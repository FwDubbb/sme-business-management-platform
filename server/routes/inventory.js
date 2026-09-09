import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Add product
router.post('/products', authenticate, async (req, res) => {
  try {
    const { name, sku, description, quantity, unit_cost, selling_price, category, reorder_level } = req.body;
    const db = await getDb();

    const productId = uuidv4();
    await db.run(
      `INSERT INTO products (id, name, sku, description, quantity, unit_cost, selling_price, category, reorder_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [productId, name, sku, description, quantity, unit_cost, selling_price, category, reorder_level]
    );

    res.json({ id: productId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products
router.get('/products', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const products = await db.all('SELECT * FROM products ORDER BY name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product quantity
router.patch('/products/:id', authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;
    const db = await getDb();

    await db.run(
      'UPDATE products SET quantity = ? WHERE id = ?',
      [quantity, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get low stock products
router.get('/low-stock', authenticate, async (req, res) => {
  try {
    const db = await getDb();
    const products = await db.all(
      'SELECT * FROM products WHERE quantity <= reorder_level ORDER BY quantity ASC'
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
