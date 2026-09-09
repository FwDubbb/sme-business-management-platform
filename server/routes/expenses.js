import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Add expense category
router.post('/categories', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    const db = await getDb();

    const categoryId = uuidv4();
    await db.run(
      'INSERT INTO expense_categories (id, name, description) VALUES (?, ?, ?)',
      [categoryId, name, description]
    );

    res.json({ id: categoryId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expense categories
router.get('/categories', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const categories = await db.all('SELECT * FROM expense_categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add expense
router.post('/', authenticate, async (req, res) => {
  try {
    const { category, description, amount, payment_method, status, notes } = req.body;
    const db = await getDb();

    const expenseId = uuidv4();
    await db.run(
      `INSERT INTO expenses (id, category, description, amount, payment_method, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [expenseId, category, description, amount, payment_method, status, notes]
    );

    res.json({ id: expenseId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all expenses
router.get('/', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const expenses = await db.all(
      'SELECT * FROM expenses ORDER BY expense_date DESC'
    );
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expenses by date range
router.get('/range/:startDate/:endDate', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const db = await getDb();

    const expenses = await db.all(
      'SELECT * FROM expenses WHERE expense_date BETWEEN ? AND ? ORDER BY expense_date DESC',
      [startDate, endDate]
    );
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
