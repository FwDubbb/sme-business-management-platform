import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDownToLine, FolderPlus, Pencil, Plus, Receipt } from 'lucide-react'
import api, { errorMessage } from '../lib/api'
import { dateLabel, exportCsv, inPeriod, localDate, money, parseDate, useData } from '../lib/workspace'
import { Drawer, Field, MetricStrip, Notice, PageHeader, Pagination, PeriodSelect, SearchBox, Status, TableMessage, usePagination } from '../components/UI'
const blank = () => ({ category: '', description: '', amount: '', expense_date: localDate(), payment_method: 'cash', status: 'paid', notes: '' })
const EMPTY = []
export default function Expenses() {
  const { data: [expenses = EMPTY, categories = EMPTY], loading, error, reload } = useData(['/expenses', '/expenses/categories'])
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [period, setPeriod] = useState('all')
  const [form, setForm] = useState(blank)
  const [categoryName, setCategoryName] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const status = params.get('status') || 'all'
  const editing = params.get('edit')
  const creating = params.has('new')
  const addingCategory = params.has('category')
  const categoryNames = [...new Set([...categories.map(category => category.name), ...expenses.map(expense => expense.category)])].sort()
  useEffect(() => {
    if (editing) { const record = expenses.find(expense => expense.id === editing); if (record) setForm({ ...record, expense_date: localDate(parseDate(record.expense_date)) }) }
    else if (creating) setForm(blank())
  }, [editing, creating, expenses])
  const filtered = expenses.filter(expense => `${expense.description} ${expense.category}`.toLowerCase().includes(search.toLowerCase()) && (category === 'all' || expense.category === category) && (status === 'all' || expense.status === status) && inPeriod(expense.expense_date, period))
  const { page, setPage, visible } = usePagination(filtered, `${search}|${category}|${status}|${period}`)
  const total = filtered.reduce((sum, expense) => sum + expense.amount, 0)
  const close = () => setParams(status === 'all' ? {} : { status })
  const open = expense => { setForm(expense ? { ...expense, expense_date: localDate(parseDate(expense.expense_date)) } : blank()); setFormError(''); setParams(expense ? { edit: expense.id, status } : { new: '1', status }) }
  const save = async event => {
    event.preventDefault()
    if (saving) return
    setSaving(true); setFormError('')
    try {
      if (addingCategory) await api.post('/expenses/categories', { name: categoryName.trim() })
      else {
        const payload = { ...form, amount: Number(form.amount) }
        if (editing) await api.put(`/expenses/${editing}`, payload)
        else await api.post('/expenses', payload)
      }
      setNotice(addingCategory ? 'Category added. It’s ready to use on your next expense.' : editing ? 'Expense updated.' : 'Expense recorded.'); close(); await reload()
    } catch (error) { setFormError(errorMessage(error)) } finally { setSaving(false) }
  }
  const exportExpenses = () => exportCsv('expenses.csv', [{ label: 'Date', value: row => row.expense_date }, { label: 'Description', value: row => row.description }, { label: 'Category', value: row => row.category }, { label: 'Amount', value: row => row.amount }, { label: 'Payment method', value: row => row.payment_method }, { label: 'Status', value: row => row.status }], filtered)
  return <>
    <PageHeader eyebrow="COSTS & SPENDING" title="Expense ledger" description="Keep track of the everyday costs of doing business."><button className="btn btn-secondary" onClick={exportExpenses} disabled={!filtered.length}><ArrowDownToLine size={15} />Export</button><button className="btn btn-primary" onClick={() => open()}><Plus size={16} />Record expense</button></PageHeader>
    <Notice error onRetry={reload}>{error}</Notice><Notice onDismiss={() => setNotice('')}>{notice}</Notice>
    <MetricStrip items={[{ label: 'Recorded expenses', value: money(total), note: 'Matching current filters', accent: true }, { label: 'Paid', value: money(filtered.filter(expense => expense.status === 'paid').reduce((sum, expense) => sum + expense.amount, 0)), note: 'Completed payments' }, { label: 'Awaiting payment', value: money(filtered.filter(expense => expense.status === 'pending').reduce((sum, expense) => sum + expense.amount, 0)), note: 'Pending expenses' }, { label: 'Expense entries', value: filtered.length, note: `${new Set(filtered.map(expense => expense.category)).size} categories in this view` }]} />
    <section className="surface"><div className="tabs">{[['all', 'All expenses'], ['paid', 'Paid'], ['pending', 'Awaiting payment']].map(([value, label]) => <button key={value} aria-pressed={status === value} className={status === value ? 'active' : ''} onClick={() => setParams(value === 'all' ? {} : { status: value })}>{label}</button>)}<button style={{ marginLeft: 'auto' }} onClick={() => { setCategoryName(''); setFormError(''); setParams({ category: 'new', status }) }}><FolderPlus size={14} />Add category</button></div><div className="toolbar"><SearchBox value={search} onChange={setSearch} placeholder="Search description or category…" /><div className="toolbar-filters"><select aria-label="Expense category" className="filter-select" value={category} onChange={event => setCategory(event.target.value)}><option value="all">All categories</option>{categoryNames.map(name => <option key={name}>{name}</option>)}</select><PeriodSelect value={period} onChange={setPeriod} /></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Expense</th><th>Category</th><th>Date</th><th>Payment method</th><th>Status</th><th className="align-right">Amount</th><th><span className="sr-only">Edit</span></th></tr></thead><tbody>{loading || !visible.length ? <TableMessage columns={7} loading={loading} title={expenses.length ? 'No expenses match these filters' : 'Small costs. A clearer picture.'} description={expenses.length ? 'Try another category, date range, or search.' : 'Record your first expense to start understanding where your money goes.'} action={!expenses.length && <button className="btn btn-primary" onClick={() => open()}><Plus size={14} />Record expense</button>} /> : visible.map(expense => <tr key={expense.id}><td><div className="cell-with-icon"><span className="product-icon"><Receipt size={16} /></span><div><button className="row-link" onClick={() => open(expense)}>{expense.description || expense.category}</button><span className="cell-sub mono">#{expense.id.slice(0, 8).toUpperCase()}</span></div></div></td><td>{expense.category}</td><td>{dateLabel(expense.expense_date)}</td><td style={{ textTransform: 'capitalize' }}>{expense.payment_method?.replaceAll('_', ' ') || '—'}</td><td><Status>{expense.status}</Status></td><td className="align-right numeric primary-cell">{money(expense.amount)}</td><td><button className="icon-button" aria-label={`Edit ${expense.description || expense.category}`} onClick={() => open(expense)}><Pencil size={15} /></button></td></tr>)}</tbody></table></div><Pagination total={filtered.length} page={page} onChange={setPage} /></section>
    {(creating || editing || addingCategory) && <Drawer title={addingCategory ? 'Add expense category' : editing ? 'Edit expense' : 'Record expense'} description={addingCategory ? 'Group similar costs in a way that makes sense for your business.' : 'Capture the details now. Thank yourself later.'} onClose={close} busy={saving}><form onSubmit={save}><fieldset disabled={saving}><div className="drawer-body"><Notice error>{formError}</Notice>{addingCategory ? <Field label="Category name"><input required autoFocus value={categoryName} onChange={event => setCategoryName(event.target.value)} placeholder="e.g. Office supplies" /></Field> : <div className="form-grid"><Field label="Description" className="field-full"><input required autoFocus value={form.description || ''} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="What was this expense for?" /></Field><Field label="Amount ($)"><input required type="number" min="0.01" max="99999999.99" step="0.01" value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} /></Field><Field label="Expense date"><input required type="date" value={form.expense_date} onChange={event => setForm({ ...form, expense_date: event.target.value })} /></Field><Field label="Category" className="field-full" hint="Choose an existing category or type a new one."><input required list="expense-categories" value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} placeholder="e.g. Rent, supplies, transport" /><datalist id="expense-categories">{categoryNames.map(name => <option key={name}>{name}</option>)}</datalist></Field><Field label="Payment method"><select value={form.payment_method} onChange={event => setForm({ ...form, payment_method: event.target.value })}><option value="cash">Cash</option><option value="card">Card</option><option value="bank_transfer">Bank transfer</option><option value="check">Check</option></select></Field><Field label="Payment status"><select value={form.status} onChange={event => setForm({ ...form, status: event.target.value })}><option value="paid">Paid</option><option value="pending">Awaiting payment</option></select></Field><Field label="Notes (optional)" className="field-full"><textarea value={form.notes || ''} onChange={event => setForm({ ...form, notes: event.target.value })} placeholder="A receipt number, supplier, or other useful detail…" /></Field></div>}</div><div className="drawer-footer"><button type="button" className="btn btn-secondary" onClick={close}>Cancel</button><button type="submit" className="btn btn-primary">{saving ? 'Saving…' : addingCategory ? 'Add category' : editing ? 'Save changes' : 'Record expense'}</button></div></fieldset></form></Drawer>}
  </>
}
