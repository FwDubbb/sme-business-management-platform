import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';
import { RequestError, moneyToCents, requireId, sendWriteError } from '../utils/validation.js';
const router = express.Router();
router.use(authenticate);
function productValues(body) {
  const name = requireId(body.name, 'Product name');
  const sku = requireId(body.sku, 'SKU');
  const unitCost = moneyToCents(body.unit_cost, 'Unit cost') / 100;
  const sellingPrice = moneyToCents(body.selling_price, 'Selling price') / 100;
  const reorderLevel = body.reorder_level ?? 10;
  if (!Number.isSafeInteger(reorderLevel) || reorderLevel < 0) throw new RequestError('Reorder level must be a nonnegative whole number.');
  if ((body.description != null && typeof body.description !== 'string') || (body.category != null && typeof body.category !== 'string')) throw new RequestError('Description and category must be text.');
  return [name, sku, body.description || '', unitCost, sellingPrice, body.category || '', reorderLevel];
}
router.post('/products', async (req, res) => {
  try {
    const values = productValues(req.body || {});
    const quantity = req.body.quantity ?? 0;
    if (!Number.isSafeInteger(quantity) || quantity < 0) throw new RequestError('Stock must be a nonnegative whole number.');
    const db = await getDb();
    const id = uuidv4();
    await db.run('INSERT INTO products (id, name, sku, description, unit_cost, selling_price, category, reorder_level, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, ...values, quantity]);
    res.json({ id });
  } catch (error) { sendWriteError(res, error); }
});
router.get('/products', async (req, res) => {
  try { res.json(await (await getDb()).all('SELECT * FROM products ORDER BY name')); }
  catch (error) { res.status(500).json({ error: 'Unable to load products.' }); }
});
router.put('/products/:id', async (req, res) => {
  try {
    const values = productValues(req.body || {});
    const result = await (await getDb()).run('UPDATE products SET name = ?, sku = ?, description = ?, unit_cost = ?, selling_price = ?, category = ?, reorder_level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [...values, req.params.id]);
    if (!result.changes) throw new RequestError('Product not found.', 404);
    res.json({ success: true });
  } catch (error) { sendWriteError(res, error); }
});
router.post('/products/:id/restock', async (req, res) => {
  try {
    const quantity = req.body?.quantity;
    if (!Number.isSafeInteger(quantity) || quantity <= 0 || quantity > 1000000000) throw new RequestError('Received quantity must be a positive whole number up to 1,000,000,000.');
    const result = await (await getDb()).run('UPDATE products SET quantity = COALESCE(quantity, 0) + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND COALESCE(quantity, 0) <= ?', [quantity, req.params.id, Number.MAX_SAFE_INTEGER - quantity]);
    if (!result.changes) throw new RequestError('Product not found or stock quantity is too large.', 409);
    res.json({ success: true });
  } catch (error) { sendWriteError(res, error); }
});
router.patch('/products/:id', async (req, res) => {
  try {
    const quantity = req.body?.quantity;
    if (!Number.isSafeInteger(quantity) || quantity < 0) throw new RequestError('Stock must be a nonnegative whole number.');
    const result = await (await getDb()).run('UPDATE products SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [quantity, req.params.id]);
    if (!result.changes) throw new RequestError('Product not found.', 404);
    res.json({ success: true });
  } catch (error) { sendWriteError(res, error); }
});
router.get('/low-stock', async (req, res) => {
  try { res.json(await (await getDb()).all('SELECT * FROM products WHERE quantity <= reorder_level ORDER BY quantity ASC')); }
  catch { res.status(500).json({ error: 'Unable to load stock alerts.' }); }
});
export default router;
