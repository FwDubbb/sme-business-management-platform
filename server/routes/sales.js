import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, withTransaction } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';
import { MAX_AMOUNT_CENTS, RequestError, moneyToCents, requireId, sendWriteError } from '../utils/validation.js';

const router = express.Router();

// Create sale
router.post('/', authenticate, async (req, res) => {
  try {
    const { customer_id, items, notes = '' } = req.body || {};
    const customerId = requireId(customer_id, 'Customer');
    if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
      throw new RequestError('Include between 1 and 100 sale items.');
    }
    if (typeof notes !== 'string') throw new RequestError('Notes must be text.');

    let totalCents = 0;
    const saleItems = items.map(item => {
      const productId = requireId(item?.product_id, 'Product');
      if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
        throw new RequestError('Quantity must be a positive whole number.');
      }
      const priceCents = moneyToCents(item.unit_price, 'Unit price');
      const lineCents = item.quantity * priceCents;
      totalCents += lineCents;
      if (!Number.isSafeInteger(totalCents) || totalCents > MAX_AMOUNT_CENTS) {
        throw new RequestError('The sale total is too large.');
      }
      return { productId, quantity: item.quantity, priceCents, lineCents };
    });

    const result = await withTransaction(async db => {
      const customer = await db.get('SELECT id FROM customers WHERE id = ?', [customerId]);
      if (!customer) throw new RequestError('Customer not found.', 404);

      const saleId = uuidv4();
      const totalAmount = totalCents / 100;
      await db.run(
        'INSERT INTO sales (id, customer_id, total_amount, payment_status, notes) VALUES (?, ?, ?, ?, ?)',
        [saleId, customerId, totalAmount, totalCents === 0 ? 'paid' : 'pending', notes]
      );

      for (const item of saleItems) {
        const product = await db.get('SELECT id, name FROM products WHERE id = ?', [item.productId]);
        if (!product) throw new RequestError('Product not found.', 404);
        // Repeated product lines also consume the stock left by preceding lines.
        const update = await db.run(
          'UPDATE products SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND quantity >= ?',
          [item.quantity, item.productId, item.quantity]
        );
        if (update.changes !== 1) {
          throw new RequestError(`Insufficient stock for ${product.name}.`, 409);
        }
        await db.run(
          'INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), saleId, item.productId, item.quantity, item.priceCents / 100, item.lineCents / 100]
        );
      }

      if (totalCents > 0) {
        await db.run(
          'INSERT INTO customer_debts (id, customer_id, sale_id, amount, remaining_amount, status) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), customerId, saleId, totalAmount, totalAmount, 'pending']
        );
        await db.run(
          'UPDATE customers SET total_debt = ROUND(COALESCE(total_debt, 0) + ?, 2), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [totalAmount, customerId]
        );
      }
      return { id: saleId, totalAmount };
    });
    res.json(result);
  } catch (error) {
    sendWriteError(res, error);
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
    if (!sale) return res.status(404).json({ error: 'Sale not found.' });
    const items = await db.all('SELECT * FROM sale_items WHERE sale_id = ?', [req.params.id]);
    res.json({ ...sale, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
