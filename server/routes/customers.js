import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, withTransaction } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';
import { RequestError, moneyToCents, requireId, sendWriteError } from '../utils/validation.js';

const router = express.Router();

function customerValues(body) {
  const name = requireId(body.name, 'Customer name');
  const fields = ['email', 'phone', 'address', 'city', 'state', 'zip_code'].map(key => {
    if (body[key] != null && typeof body[key] !== 'string') throw new RequestError(`${key} must be text.`);
    return (body[key] || '').trim();
  });
  if (fields[0] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields[0])) throw new RequestError('Enter a valid email address.');
  const credit = moneyToCents(body.credit_limit ?? 0, 'Credit limit') / 100;
  return [name, ...fields, credit];
}

// Add customer
router.post('/', authenticate, async (req, res) => {
  try {
    const values = customerValues(req.body || {});
    const db = await getDb();

    const customerId = uuidv4();
    await db.run(
      `INSERT INTO customers (id, name, email, phone, address, city, state, zip_code, credit_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerId, ...values]
    );

    res.json({ id: customerId });
  } catch (error) {
    sendWriteError(res, error);
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const values = customerValues(req.body || {});
    const result = await (await getDb()).run('UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zip_code = ?, credit_limit = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [...values, req.params.id]);
    if (!result.changes) throw new RequestError('Customer not found.', 404);
    res.json({ success: true });
  } catch (error) { sendWriteError(res, error); }
});

router.get('/:id/payments', authenticate, async (req, res) => {
  try {
    const payments = await (await getDb()).all(`SELECT p.*, d.sale_id FROM payments p
      JOIN customer_debts d ON d.id = p.debt_id WHERE d.customer_id = ? ORDER BY p.payment_date DESC`, [req.params.id]);
    res.json(payments);
  } catch { res.status(500).json({ error: 'Unable to load payment history.' }); }
});

// Get all customers
router.get('/', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const customers = await db.all('SELECT * FROM customers ORDER BY name');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer debts
router.get('/:id/debts', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const debts = await db.all(
      'SELECT * FROM customer_debts WHERE customer_id = ? ORDER BY due_date',
      [req.params.id]
    );
    res.json(debts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record payment
router.post('/:id/payments', authenticate, async (req, res) => {
  try {
    const { debt_id, amount, payment_method = 'cash' } = req.body || {};
    const debtId = requireId(debt_id, 'Debt');
    const amountCents = moneyToCents(amount, 'Payment amount', { positive: true });
    if (!['cash', 'check', 'bank_transfer', 'card'].includes(payment_method)) {
      throw new RequestError('Choose a valid payment method.');
    }
    await withTransaction(async db => {
      const debt = await db.get(
        'SELECT * FROM customer_debts WHERE id = ? AND customer_id = ?',
        [debtId, req.params.id]
      );
      if (!debt) throw new RequestError('Debt not found for this customer.', 404);
      const remainingCents = Math.round(debt.remaining_amount * 100);
      if (debt.status === 'paid' || amountCents > remainingCents) {
        throw new RequestError('Payment exceeds the outstanding balance.', 409);
      }
      const newRemainingCents = remainingCents - amountCents;
      const newPaidCents = Math.round((debt.paid_amount || 0) * 100) + amountCents;
      await db.run(
        'INSERT INTO payments (id, debt_id, amount, payment_method) VALUES (?, ?, ?, ?)',
        [uuidv4(), debtId, amountCents / 100, payment_method]
      );
      await db.run(
        'UPDATE customer_debts SET paid_amount = ?, remaining_amount = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newPaidCents / 100, newRemainingCents / 100, newRemainingCents === 0 ? 'paid' : 'pending', debtId]
      );
      await db.run(
        `UPDATE customers SET total_debt = (
          SELECT ROUND(COALESCE(SUM(remaining_amount), 0), 2) FROM customer_debts WHERE customer_id = ?
        ), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [req.params.id, req.params.id]
      );
      if (debt.sale_id) {
        await db.run(
          `UPDATE sales SET payment_status = CASE WHEN EXISTS (
            SELECT 1 FROM customer_debts WHERE sale_id = ? AND remaining_amount > 0
          ) THEN 'pending' ELSE 'paid' END, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [debt.sale_id, debt.sale_id]
        );
      }
    });
    res.json({ success: true });
  } catch (error) {
    sendWriteError(res, error);
  }
});

export default router;
