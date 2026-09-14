import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { mkdtemp, readdir, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import express from 'express';
import jwt from 'jsonwebtoken';
import { getDb, closeDb } from '../db/connection.js';
import { initializeDatabase } from '../db/init.js';
import salesRoutes from '../routes/sales.js';
import customersRoutes from '../routes/customers.js';

let directory, db, server, baseUrl, token;
const previousDbPath = process.env.DB_PATH;
const previousSecret = process.env.JWT_SECRET;

before(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'sme-transactions-'));
  process.env.DB_PATH = path.join(directory, 'test.db');
  process.env.JWT_SECRET = 'test-only-secret';
  db = await getDb();
  await initializeDatabase(db);
  const app = express();
  app.use(express.json());
  app.use('/api/sales', salesRoutes);
  app.use('/api/customers', customersRoutes);
  server = await new Promise(resolve => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
  token = jwt.sign({ id: 'test-user' }, process.env.JWT_SECRET);
});

after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await closeDb();
  if (previousDbPath === undefined) delete process.env.DB_PATH;
  else process.env.DB_PATH = previousDbPath;
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
  if (directory) {
    // Only remove files from the temporary directory created by this test run.
    for (const filename of await readdir(directory)) await unlink(path.join(directory, filename));
    await rmdir(directory);
  }
});

beforeEach(async () => {
  await db.exec(`
    DROP TRIGGER IF EXISTS fail_debt;
    DROP TRIGGER IF EXISTS fail_payment_update;
    DELETE FROM payments;
    DELETE FROM customer_debts;
    DELETE FROM sale_items;
    DELETE FROM sales;
    DELETE FROM products;
    DELETE FROM customers;
    INSERT INTO customers (id, name) VALUES ('customer-a', 'Customer A'), ('customer-b', 'Customer B');
    INSERT INTO products (id, name, sku, quantity, selling_price)
      VALUES ('product-a', 'Product A', 'A', 5, 0.1), ('product-b', 'Product B', 'B', 2, 0.2);
  `);
});

async function request(route, body) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return { status: response.status, body: await response.json() };
}

const sale = (items = [{ product_id: 'product-a', quantity: 3, unit_price: 0.1 }]) => ({
  customer_id: 'customer-a', items
});

async function snapshot() {
  const tables = ['products', 'customers', 'sales', 'sale_items', 'customer_debts', 'payments'];
  return Promise.all(tables.map(table => db.all(`SELECT * FROM ${table} ORDER BY id`)));
}

async function createDebt() {
  const result = await request('/sales', sale());
  assert.equal(result.status, 200);
  return db.get('SELECT * FROM customer_debts WHERE sale_id = ?', result.body.id);
}

test('sale creates matching totals, stock changes, and customer debt', async () => {
  const result = await request('/sales', sale([
    { product_id: 'product-a', quantity: 3, unit_price: 0.1 },
    { product_id: 'product-b', quantity: 1, unit_price: 0.2 }
  ]));
  assert.equal(result.status, 200);
  assert.equal(result.body.totalAmount, 0.5);
  assert.equal((await db.get("SELECT quantity FROM products WHERE id = 'product-a'")).quantity, 2);
  assert.equal((await db.get("SELECT quantity FROM products WHERE id = 'product-b'")).quantity, 1);
  assert.equal((await db.get('SELECT remaining_amount FROM customer_debts')).remaining_amount, 0.5);
  assert.equal((await db.get("SELECT total_debt FROM customers WHERE id = 'customer-a'")).total_debt, 0.5);
});

test('invalid sale inputs never change records', async () => {
  const initial = await snapshot();
  const invalid = [
    {}, sale([]), sale([null]), sale([{ product_id: '', quantity: 1, unit_price: 1 }]),
    ...[0, -1, 1.5, null, '1'].map(quantity => sale([{ product_id: 'product-a', quantity, unit_price: 1 }])),
    ...[-1, null, '1', 0.001, 100000000].map(unit_price => sale([{ product_id: 'product-a', quantity: 1, unit_price }]))
  ];
  for (const payload of invalid) {
    assert.equal((await request('/sales', payload)).status, 400, JSON.stringify(payload));
    assert.deepEqual(await snapshot(), initial);
  }
});

test('unknown customer or product and cumulative overselling roll back the whole sale', async () => {
  const initial = await snapshot();
  assert.equal((await request('/sales', { ...sale(), customer_id: 'missing' })).status, 404);
  for (const [product_id, status] of [['missing', 404], ['product-a', 409]]) {
    const result = await request('/sales', sale([
      { product_id: 'product-a', quantity: 3, unit_price: 1 },
      { product_id, quantity: 3, unit_price: 1 }
    ]));
    assert.equal(result.status, status);
    assert.deepEqual(await snapshot(), initial);
  }
});

test('a database failure after stock updates leaves no partial sale', async () => {
  await db.exec("CREATE TRIGGER fail_debt BEFORE INSERT ON customer_debts BEGIN SELECT RAISE(ABORT, 'simulated failure'); END");
  const initial = await snapshot();
  const result = await request('/sales', sale());
  assert.equal(result.status, 500);
  assert.equal(result.body.error, 'Unable to save changes. Please try again.');
  assert.deepEqual(await snapshot(), initial);
});

test('concurrent sales cannot sell the same stock twice', async () => {
  const results = await Promise.all([request('/sales', sale()), request('/sales', sale())]);
  assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
  assert.equal((await db.get('SELECT COUNT(*) AS count FROM sales')).count, 1);
  assert.equal((await db.get("SELECT quantity FROM products WHERE id = 'product-a'")).quantity, 2);
});

test('partial and final payments keep debt, customer balance and sale status in sync', async () => {
  const debt = await createDebt();
  for (const [amount, remaining, status] of [[0.1, 0.2, 'pending'], [0.2, 0, 'paid']]) {
    assert.equal((await request('/customers/customer-a/payments', { debt_id: debt.id, amount })).status, 200);
    const updated = await db.get('SELECT * FROM customer_debts WHERE id = ?', debt.id);
    assert.equal(updated.remaining_amount, remaining);
    assert.equal(updated.status, status);
    assert.equal((await db.get("SELECT total_debt FROM customers WHERE id = 'customer-a'")).total_debt, remaining);
    assert.equal((await db.get('SELECT payment_status FROM sales WHERE id = ?', debt.sale_id)).payment_status, status);
  }
  assert.equal((await db.get('SELECT paid_amount FROM customer_debts')).paid_amount, 0.3);
  const initial = await snapshot();
  assert.equal((await request('/customers/customer-a/payments', { debt_id: debt.id, amount: 0.01 })).status, 409);
  assert.deepEqual(await snapshot(), initial);
});

test('invalid payments, overpayment and another customer’s debt cannot change balances', async () => {
  const debt = await createDebt();
  const initial = await snapshot();
  for (const amount of [0, -1, null, '0.1', 0.001]) {
    assert.equal((await request('/customers/customer-a/payments', { debt_id: debt.id, amount })).status, 400);
  }
  assert.equal((await request('/customers/customer-a/payments', { debt_id: debt.id, amount: 0.31 })).status, 409);
  assert.equal((await request('/customers/customer-b/payments', { debt_id: debt.id, amount: 0.1 })).status, 404);
  assert.equal((await request('/customers/customer-a/payments', { debt_id: 'missing', amount: 0.1 })).status, 404);
  assert.equal((await request('/customers/customer-a/payments', { debt_id: debt.id, amount: 0.1, payment_method: 'invalid' })).status, 400);
  assert.deepEqual(await snapshot(), initial);
});

test('failed payment update rolls back its payment record', async () => {
  const debt = await createDebt();
  await db.exec("CREATE TRIGGER fail_payment_update BEFORE UPDATE ON customers BEGIN SELECT RAISE(ABORT, 'simulated failure'); END");
  const initial = await snapshot();
  assert.equal((await request('/customers/customer-a/payments', { debt_id: debt.id, amount: 0.1 })).status, 500);
  assert.deepEqual(await snapshot(), initial);
});

test('concurrent payments cannot overpay a debt', async () => {
  const debt = await createDebt();
  const payload = { debt_id: debt.id, amount: 0.2 };
  const results = await Promise.all([
    request('/customers/customer-a/payments', payload), request('/customers/customer-a/payments', payload)
  ]);
  assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
  assert.equal((await db.get('SELECT remaining_amount FROM customer_debts')).remaining_amount, 0.1);
  assert.equal((await db.get('SELECT COUNT(*) AS count FROM payments')).count, 1);
});

test('zero-value sales are paid and do not create a pending debt', async () => {
  const result = await request('/sales', sale([{ product_id: 'product-a', quantity: 1, unit_price: 0 }]));
  assert.equal(result.status, 200);
  assert.equal((await db.get('SELECT payment_status FROM sales')).payment_status, 'paid');
  assert.equal((await db.get('SELECT COUNT(*) AS count FROM customer_debts')).count, 0);
});

test('unknown sale returns 404 and sales still require authentication', async () => {
  assert.equal((await request('/sales/missing')).status, 404);
  assert.equal((await fetch(`${baseUrl}/sales`)).status, 401);
});
