import express from 'express';
import { getDb } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const db = await getDb();

    // Total sales
    const totalSales = await db.get('SELECT SUM(total_amount) as total FROM sales');
    
    // Total expenses
    const totalExpenses = await db.get('SELECT SUM(amount) as total FROM expenses');
    
    // Total outstanding debts
    const totalDebts = await db.get(
      'SELECT SUM(remaining_amount) as total FROM customer_debts WHERE status = "pending"'
    );
    
    // Number of customers
    const customerCount = await db.get('SELECT COUNT(*) as count FROM customers');
    
    // Number of products
    const productCount = await db.get('SELECT COUNT(*) as count FROM products');
    
    // Low stock products
    const lowStock = await db.get(
      'SELECT COUNT(*) as count FROM products WHERE quantity <= reorder_level'
    );

    res.json({
      totalSales: totalSales?.total || 0,
      totalExpenses: totalExpenses?.total || 0,
      totalDebts: totalDebts?.total || 0,
      customerCount: customerCount?.count || 0,
      productCount: productCount?.count || 0,
      lowStockCount: lowStock?.count || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales trend (last 30 days)
router.get('/sales-trend', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const trend = await db.all(`
      SELECT DATE(sale_date) as date, SUM(total_amount) as amount
      FROM sales
      WHERE sale_date >= datetime('now', '-30 days')
      GROUP BY DATE(sale_date)
      ORDER BY date DESC
    `);
    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expense breakdown
router.get('/expense-breakdown', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const breakdown = await db.all(`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM expenses
      WHERE expense_date >= datetime('now', '-30 days')
      GROUP BY category
      ORDER BY total DESC
    `);
    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top customers
router.get('/top-customers', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const customers = await db.all(`
      SELECT c.id, c.name, COUNT(s.id) as purchase_count, SUM(s.total_amount) as total_spent
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id
      GROUP BY c.id
      ORDER BY total_spent DESC
      LIMIT 10
    `);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
