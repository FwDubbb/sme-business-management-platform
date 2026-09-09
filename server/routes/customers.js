import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Add customer
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, email, phone, address, city, state, zip_code, credit_limit } = req.body;
    const db = await getDb();

    const customerId = uuidv4();
    await db.run(
      `INSERT INTO customers (id, name, email, phone, address, city, state, zip_code, credit_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerId, name, email, phone, address, city, state, zip_code, credit_limit]
    );

    res.json({ id: customerId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
    const { debt_id, amount, payment_method } = req.body;
    const db = await getDb();

    const paymentId = uuidv4();
    await db.run(
      'INSERT INTO payments (id, debt_id, amount, payment_method) VALUES (?, ?, ?, ?)',
      [paymentId, debt_id, amount, payment_method]
    );

    // Update debt
    const debt = await db.get('SELECT * FROM customer_debts WHERE id = ?', [debt_id]);
    const newPaidAmount = (debt.paid_amount || 0) + amount;
    const newRemainingAmount = debt.amount - newPaidAmount;

    await db.run(
      'UPDATE customer_debts SET paid_amount = ?, remaining_amount = ?, status = ? WHERE id = ?',
      [newPaidAmount, Math.max(0, newRemainingAmount), newRemainingAmount <= 0 ? 'paid' : 'pending', debt_id]
    );

    // Update customer total debt
    await db.run(
      'UPDATE customers SET total_debt = total_debt - ? WHERE id = ?',
      [amount, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
