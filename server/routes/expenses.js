import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';
import { RequestError, moneyToCents, requireId, sendWriteError } from '../utils/validation.js';
const router = express.Router();
router.use(authenticate);
function expenseValues(body) {
  const category = requireId(body.category, 'Category');
  const amount = moneyToCents(body.amount, 'Amount', { positive: true }) / 100;
  const status = body.status || 'paid';
  const method = body.payment_method || 'cash';
  if (!['paid', 'pending'].includes(status)) throw new RequestError('Choose a valid expense status.');
  if (!['cash', 'check', 'bank_transfer', 'card'].includes(method)) throw new RequestError('Choose a valid payment method.');
  const date = body.expense_date || new Date().toISOString().slice(0, 10);
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new RequestError('Choose a valid expense date.');
  if ((body.description != null && typeof body.description !== 'string') || (body.notes != null && typeof body.notes !== 'string')) throw new RequestError('Description and notes must be text.');
  return [category, body.description || '', amount, method, status, body.notes || '', date];
}
router.post('/categories', async (req, res) => {
  try {
    const name = requireId(req.body?.name, 'Category name');
    const id = uuidv4();
    await (await getDb()).run('INSERT INTO expense_categories (id, name, description) VALUES (?, ?, ?)', [id, name, typeof req.body.description === 'string' ? req.body.description : '']);
    res.json({ id });
  } catch (error) { sendWriteError(res, error); }
});
router.get('/categories', async (req, res) => {
  try { res.json(await (await getDb()).all('SELECT * FROM expense_categories ORDER BY name')); }
  catch { res.status(500).json({ error: 'Unable to load categories.' }); }
});
router.post('/', async (req, res) => {
  try {
    const values = expenseValues(req.body || {});
    const id = uuidv4();
    await (await getDb()).run('INSERT INTO expenses (id, category, description, amount, payment_method, status, notes, expense_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, ...values]);
    res.json({ id });
  } catch (error) { sendWriteError(res, error); }
});
router.put('/:id', async (req, res) => {
  try {
    const values = expenseValues(req.body || {});
    const result = await (await getDb()).run('UPDATE expenses SET category = ?, description = ?, amount = ?, payment_method = ?, status = ?, notes = ?, expense_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [...values, req.params.id]);
    if (!result.changes) throw new RequestError('Expense not found.', 404);
    res.json({ success: true });
  } catch (error) { sendWriteError(res, error); }
});
router.get('/', async (req, res) => {
  try { res.json(await (await getDb()).all('SELECT * FROM expenses ORDER BY expense_date DESC, created_at DESC')); }
  catch { res.status(500).json({ error: 'Unable to load expenses.' }); }
});
router.get('/range/:startDate/:endDate', async (req, res) => {
  try { res.json(await (await getDb()).all('SELECT * FROM expenses WHERE DATE(expense_date) BETWEEN DATE(?) AND DATE(?) ORDER BY expense_date DESC', [req.params.startDate, req.params.endDate])); }
  catch { res.status(500).json({ error: 'Unable to load expenses.' }); }
});
export default router;
