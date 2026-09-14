// Run manually with: node scripts/ui-smoke.mjs
// Uses a temporary database and browser profile. Does not touch business records.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import express from 'express';
import jwt from 'jsonwebtoken';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { getDb, closeDb } from '../server/db/connection.js';
import { initializeDatabase } from '../server/db/init.js';
import auth from '../server/routes/auth.js';
import sales from '../server/routes/sales.js';
import customers from '../server/routes/customers.js';
import inventory from '../server/routes/inventory.js';
import expenses from '../server/routes/expenses.js';

const directory = await mkdtemp(path.join(tmpdir(), 'sme-ui-'));
process.env.DB_PATH = path.join(directory, 'browser-test.db');
process.env.JWT_SECRET = 'browser-test-only-secret';
const output = path.resolve('artifacts/ui');
await mkdir(output, { recursive: true });
const db = await getDb();
await initializeDatabase(db);
let apiServer, vite, chrome, socket;
const failures = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const names = ['Everyday notebook', 'Ceramic coffee mug', 'Cotton tote bag', 'Desk organizer', 'Gel pen set', 'Weekly planner', 'Brass bookmark', 'Gift wrapping kit'];
try {
  for (let i = 0; i < names.length; i++) await db.run('INSERT INTO products (id, name, sku, quantity, unit_cost, selling_price, category, reorder_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [`p${i}`, names[i], `SME-${100 + i}`, 25 + i * 4, 4 + i, 12 + i * 3, ['Stationery', 'Home & living', 'Accessories'][i % 3], 10]);
  const people = ['Olivia Bennett', 'James Wilson', 'Amelia Brooks', 'Noah Carter', 'Mia Thompson'];
  for (let i = 0; i < people.length; i++) await db.run('INSERT INTO customers (id, name, email, phone, city, state, credit_limit) VALUES (?, ?, ?, ?, ?, ?, ?)', [`c${i}`, people[i], `customer${i}@example.test`, '555-0100', 'Madison', 'WI', 1500]);
  const app = express();
  app.use(express.json());
  app.use('/api/auth', auth); app.use('/api/sales', sales); app.use('/api/customers', customers); app.use('/api/inventory', inventory); app.use('/api/expenses', expenses);
  apiServer = await new Promise(resolve => { const server = app.listen(0, '127.0.0.1', () => resolve(server)); });
  const token = jwt.sign({ id: 'browser-test' }, process.env.JWT_SECRET);
  const apiUrl = `http://127.0.0.1:${apiServer.address().port}/api`;
  const post = async (route, body) => {
    const response = await fetch(apiUrl + route, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    assert.equal(response.status, 200); return response.json();
  };
  for (let i = 0; i < 12; i++) {
    const sale = await post('/sales', { customer_id: `c${i % 5}`, items: [{ product_id: `p${i % 8}`, quantity: 1 + i % 3, unit_price: 12 + i % 8 * 3 }] });
    await db.run("UPDATE sales SET sale_date = datetime('now', ?) WHERE id = ?", [`-${i * 2} days`, sale.id]);
    if (i % 3 === 0) { const debt = await db.get('SELECT * FROM customer_debts WHERE sale_id = ?', sale.id); await post(`/customers/${debt.customer_id}/payments`, { debt_id: debt.id, amount: debt.amount }); }
  }
  await db.run("UPDATE products SET quantity = 4 WHERE id = 'p2'");
  await db.run("UPDATE products SET quantity = 0 WHERE id = 'p6'");
  const expenseNames = ['Monthly studio rent', 'Packaging supplies', 'Internet & phone', 'Local delivery service', 'Team lunch'];
  for (let i = 0; i < expenseNames.length; i++) await post('/expenses', { category: ['Rent', 'Supplies', 'Utilities', 'Transport', 'Meals'][i], description: expenseNames[i], amount: [850, 67.5, 89, 24, 46.8][i], status: i === 2 ? 'pending' : 'paid', payment_method: i % 2 ? 'card' : 'bank_transfer', expense_date: new Date().toISOString().slice(0, 10) });
  vite = await createServer({ configFile: false, plugins: [react()], server: { host: '127.0.0.1', port: 0, proxy: { '/api': { target: apiUrl.replace('/api', ''), changeOrigin: true } } } });
  await vite.listen();
  const origin = `http://127.0.0.1:${vite.httpServer.address().port}`;
  const profile = path.join(directory, 'chrome-profile');
  chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  chrome.on('error', error => failures.push(error.message));
  let debugPort;
  for (let i = 0; i < 100; i++) {
    try { debugPort = (await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
    catch { await delay(150); }
  }
  assert.ok(debugPort, 'Headless Chrome did not start');
  const target = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) { const entry = pending.get(message.id); if (entry) { pending.delete(message.id); message.error ? entry.reject(new Error(JSON.stringify(message.error))) : entry.resolve(message.result); } }
    if (message.method === 'Runtime.exceptionThrown') failures.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  };
  const cdp = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => { const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result?.value; };
  const wait = async (expression, description = expression) => { for (let i = 0; i < 100; i++) { if (await evaluate(`Boolean(${expression})`)) return; await delay(100); } throw new Error(`Timed out: ${description}`); };
  const click = async selector => { await wait(`!!document.querySelector(${JSON.stringify(selector)})`); await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); };
  const setField = async (label, value) => {
    const expression = `(() => { const el = Array.from(document.querySelectorAll('dialog[open] label')).find(label => label.firstElementChild?.textContent === ${JSON.stringify(label)})?.querySelector('input,textarea,select'); if (!el) throw new Error('Field missing: ' + ${JSON.stringify(label)}); const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(String(value))}); el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); return true; })()`;
    await evaluate(expression); await delay(70);
  };
  const goto = async (route, title) => { await cdp('Page.navigate', { url: origin + route }); await wait(`document.querySelector('h1')?.textContent === ${JSON.stringify(title)} && !document.querySelector('.loading-state')`, route); await delay(250); };
  const screenshot = async filename => { await delay(250); const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); await writeFile(path.join(output, filename), Buffer.from(shot.data, 'base64')); };
  await cdp('Page.enable'); await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: origin + '/login' });
  await wait("document.querySelector('h2')?.textContent === 'Back to business.'");
  await screenshot('login-desktop.png');
  await cdp('Page.navigate', { url: origin + '/register' });
  await wait("document.querySelector('h2')?.textContent === 'Make yourself at home.'");
  await screenshot('register-desktop.png');
  await evaluate(`localStorage.setItem('token', ${JSON.stringify(token)}); localStorage.setItem('user', JSON.stringify({id:'browser-test',name:'Alex Morgan',email:'alex@example.test'}))`);
  for (const [route, title, filename] of [['/', 'Overview', 'overview'], ['/sales', 'Sales register', 'sales'], ['/inventory', 'Inventory', 'inventory'], ['/customers', 'Customers', 'customers'], ['/expenses', 'Expense ledger', 'expenses']]) {
    await goto(route, title); await screenshot(`${filename}-desktop.png`);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `${title} desktop overflow`);
  }
  await goto('/inventory?new=1', 'Inventory');
  await setField('Product name', 'Browser workflow product'); await setField('SKU', 'BROWSER-001'); await setField('Category', 'Testing'); await setField('Unit cost ($)', 5); await setField('Selling price ($)', 12.5); await setField('Opening stock', 5);
  await screenshot('product-panel-desktop.png');
  await click('dialog[open] button[type="submit"]'); await wait("!document.querySelector('dialog[open]')");
  let product = await db.get("SELECT * FROM products WHERE sku = 'BROWSER-001'"); assert.equal(product.quantity, 5);
  await click('[aria-label="Receive stock for Browser workflow product"]'); await setField('Quantity received', 7); await click('dialog[open] button[type="submit"]'); await wait("!document.querySelector('dialog[open]')");
  assert.equal((await db.get('SELECT quantity FROM products WHERE id = ?', product.id)).quantity, 12);
  await click('[aria-label="Edit Browser workflow product"]'); await setField('Selling price ($)', 15); await click('dialog[open] button[type="submit"]'); await wait("!document.querySelector('dialog[open]')");
  assert.equal((await db.get('SELECT selling_price FROM products WHERE id = ?', product.id)).selling_price, 15);
  console.log('PASS: product creation, receiving stock, product editing');
  await goto('/customers?new=1', 'Customers'); await setField('Full name or business name', 'Browser Customer'); await setField('Email', 'browser@example.test'); await click('dialog[open] button[type="submit"]'); await wait("!document.querySelector('dialog[open]')");
  const customer = await db.get("SELECT * FROM customers WHERE email = 'browser@example.test'"); assert.ok(customer);
  await goto('/sales?new=1', 'Sales register'); await setField('Customer', customer.id); await setField('Product 1', product.id); await setField('Quantity', 2);
  assert.equal(await evaluate("document.querySelector('.sale-total strong').textContent"), '$30.00');
  await screenshot('sale-panel-desktop.png');
  await click('dialog[open] button[type="submit"]'); await wait("!document.querySelector('dialog[open]')");
  assert.equal((await db.get('SELECT quantity FROM products WHERE id = ?', product.id)).quantity, 10);
  const newSale = await db.get('SELECT * FROM sales WHERE customer_id = ?', customer.id); assert.equal(newSale.total_amount, 30);
  await goto(`/customers?detail=${customer.id}`, 'Customers'); await wait("document.querySelector('dialog[open] .text-button')?.textContent");
  await evaluate("Array.from(document.querySelectorAll('dialog[open] button')).find(button => button.textContent === 'Pay').click()");
  await setField('Payment amount ($)', 30); await click('dialog[open] button[type="submit"]'); await wait("document.querySelector('dialog[open] .notice')?.textContent.includes('Payment recorded')");
  await screenshot('customer-profile-desktop.png');
  assert.equal((await db.get('SELECT payment_status FROM sales WHERE id = ?', newSale.id)).payment_status, 'paid');
  console.log('PASS: customer creation, sale entry, price autofill, full payment');
  await goto('/expenses?new=1', 'Expense ledger'); await setField('Description', 'Browser expense'); await setField('Amount ($)', '42.75'); await setField('Expense date', '2026-02-28'); await setField('Category', 'Testing'); await setField('Payment status', 'pending'); await click('dialog[open] button[type="submit"]'); await wait("!document.querySelector('dialog[open]')");
  let expense = await db.get("SELECT * FROM expenses WHERE description = 'Browser expense'"); assert.equal(expense.expense_date, '2026-02-28');
  await goto(`/expenses?edit=${expense.id}`, 'Expense ledger'); await setField('Payment status', 'paid'); await click('dialog[open] button[type="submit"]'); await wait("!document.querySelector('dialog[open]')");
  assert.equal((await db.get('SELECT status FROM expenses WHERE id = ?', expense.id)).status, 'paid');
  console.log('PASS: expense creation, chosen date, editing, marking paid');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  for (const [route, title, filename] of [['/', 'Overview', 'overview'], ['/sales', 'Sales register', 'sales'], ['/inventory', 'Inventory', 'inventory'], ['/customers', 'Customers', 'customers'], ['/expenses', 'Expense ledger', 'expenses']]) {
    await goto(route, title); await screenshot(`${filename}-mobile.png`);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `${title} mobile overflow`);
  }
  await click('[aria-label="Open navigation"]'); await wait("document.querySelector('.mobile-sidebar[open]')"); await screenshot('navigation-mobile.png');
  await click('.mobile-sidebar a[href="/inventory"]'); await wait("!document.querySelector('.mobile-sidebar[open]') && document.querySelector('h1')?.textContent === 'Inventory'");
  await goto('/inventory?new=1', 'Inventory'); await screenshot('product-panel-mobile.png');
  assert.equal(await evaluate("document.querySelector('dialog[open]').scrollWidth <= innerWidth"), true, 'Mobile form overflow');
  console.log('PASS: desktop and mobile page rendering, navigation, drawer sizing');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await goto('/sales', 'Sales register');
  await click('[aria-label="Next page"]');
  await wait("document.querySelector('.pagination').textContent.includes('Page 2 of 2')");
  await evaluate("Array.from(document.querySelectorAll('.tabs button')).find(button => button.textContent.startsWith('Paid')).click()");
  await wait("document.querySelector('.pagination').textContent.includes('Page 1')");
  assert.equal(await evaluate("Array.from(document.querySelectorAll('tbody .status')).every(status => status.textContent === 'paid')"), true);
  const downloadPath = path.join(directory, 'downloads');
  await mkdir(downloadPath);
  await cdp('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath });
  await click('.heading-actions .btn-secondary');
  let csv;
  for (let i = 0; i < 50; i++) { try { csv = await readFile(path.join(downloadPath, 'sales.csv'), 'utf8'); break; } catch { await delay(100); } }
  assert.ok(csv?.includes('"Reference","Date","Customer","Amount","Status"'));
  assert.ok(!csv.includes('"pending"'), 'Export should respect the paid filter');
  console.log('PASS: pagination, payment-status filter, filtered CSV download');
  assert.deepEqual(failures, [], 'Browser runtime errors');
  console.log(`Screenshots saved to ${output}`);
} finally {
  socket?.close();
  if (chrome) chrome.kill();
  await vite?.close();
  if (apiServer) await new Promise(resolve => apiServer.close(resolve));
  await closeDb();
  console.log(`Isolated test files: ${directory}`);
}
