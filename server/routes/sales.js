import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create sale
router.post('/', authenticate, async (req, res) => {
  try {
    const { customer_id, items, notes } = req.body;
    const db = await getDb();

    const saleId = uuidv4();
    let totalAmount = 0;

    // Calculate total
    for (const item of items) {
      totalAmount += item.quantity * item.unit_price;
    }

    await db.run(
      'INSERT INTO sales (id, customer_id, total_amount, notes) VALUES (?, ?, ?, ?)',
      [saleId, customer_id, totalAmount, notes]
    );

    // Add sale items and update inventory
    for (const item of items) {
      const saleItemId = uuidv4();
      await db.run(
        'INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?, ?)',
        [saleItemId, saleId, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
      );

      // Update inventory
      await db.run(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Create debt record
    const debtId = uuidv4();
    await db.run(
      'INSERT INTO customer_debts (id, customer_id, sale_id, amount, remaining_amount, status) VALUES (?, ?, ?, ?, ?, ?)',
      [debtId, customer_id, saleId, totalAmount, totalAmount, 'pending']
    );

    // Update customer total debt
    await db.run(
      'UPDATE customers SET total_debt = total_debt + ? WHERE id = ?',
      [totalAmount, customer_id]
    );

    res.json({ id: saleId, totalAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all sales
router.get('/', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const sales = await db.all(`
      SELECT s.*, c.name as customer_name 
      FROM sales s 
      LEFT JOIN customers c ON s.customer_id = c.id 
      ORDER BY s.sale_date DESC
    `);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sale by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const sale = await db.get('SELECT * FROM sales WHERE id = ?', [req.params.id]);
    const items = await db.all('SELECT * FROM sale_items WHERE sale_id = ?', [req.params.id]);
    res.json({ ...sale, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
