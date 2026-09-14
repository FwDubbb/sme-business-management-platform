import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDownToLine, Box, PackagePlus, Pencil, Plus } from 'lucide-react'
import api, { errorMessage } from '../lib/api'
import { exportCsv, money, number, useData } from '../lib/workspace'
import { Drawer, Field, MetricStrip, Notice, PageHeader, Pagination, SearchBox, Status, TableMessage, usePagination } from '../components/UI'
const blank = { name: '', sku: '', category: '', description: '', quantity: 0, unit_cost: '', selling_price: '', reorder_level: 10 }
const EMPTY = []
export default function Inventory() {
  const { data: [products = EMPTY], loading, error, reload } = useData(['/inventory/products'])
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('name')
  const [form, setForm] = useState(blank)
  const [restock, setRestock] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const stock = params.get('stock') || 'all'
  const editing = params.get('edit')
  const receiving = params.get('receive')
  const creating = params.has('new')
  const productToReceive = products.find(product => product.id === receiving)
  useEffect(() => {
    if (editing) { const record = products.find(product => product.id === editing); if (record) setForm(record) }
    else if (creating) setForm({ ...blank })
  }, [editing, creating, products])
  const categories = [...new Set(products.map(product => product.category).filter(Boolean))].sort()
  const filtered = products.filter(product => `${product.name} ${product.sku}`.toLowerCase().includes(search.toLowerCase()) && (category === 'all' || product.category === category) && (stock === 'all' || (stock === 'low' ? product.quantity <= product.reorder_level : product.quantity === 0))).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'stock' ? a.quantity - b.quantity : b.quantity * b.unit_cost - a.quantity * a.unit_cost)
  const { page, setPage, visible } = usePagination(filtered, `${search}|${category}|${stock}|${sort}`)
  const close = () => setParams(stock !== 'all' ? { stock } : {})
  const open = product => { setForm(product ? { ...product } : { ...blank }); setFormError(''); setParams(product ? { edit: product.id, stock } : { new: '1', stock }) }
  const save = async event => {
    event.preventDefault()
    if (saving) return
    setSaving(true); setFormError('')
    try {
      if (receiving) await api.post(`/inventory/products/${receiving}/restock`, { quantity: Number(restock) })
      else {
        const payload = { ...form, quantity: Number(form.quantity), unit_cost: Number(form.unit_cost), selling_price: Number(form.selling_price), reorder_level: Number(form.reorder_level) }
        if (editing) await api.put(`/inventory/products/${editing}`, payload)
        else await api.post('/inventory/products', payload)
      }
      setNotice(receiving ? 'Stock received. Your inventory is up to date.' : editing ? 'Product updated.' : 'Product added to your catalog.'); close(); await reload()
    } catch (error) { setFormError(errorMessage(error)) } finally { setSaving(false) }
  }
  const exportProducts = () => exportCsv('inventory.csv', [{ label: 'Product', value: row => row.name }, { label: 'SKU', value: row => row.sku }, { label: 'Category', value: row => row.category }, { label: 'On hand', value: row => row.quantity }, { label: 'Unit cost', value: row => row.unit_cost }, { label: 'Selling price', value: row => row.selling_price }, { label: 'Reorder level', value: row => row.reorder_level }], filtered)
  return <>
    <PageHeader eyebrow="PRODUCTS & STOCK" title="Inventory" description="Know what’s on your shelves, and what’s ready for a refill."><button className="btn btn-secondary" onClick={exportProducts} disabled={!filtered.length}><ArrowDownToLine size={15} />Export</button><button className="btn btn-primary" onClick={() => open()}><Plus size={16} />Add product</button></PageHeader>
    <Notice error onRetry={reload}>{error}</Notice><Notice onDismiss={() => setNotice('')}>{notice}</Notice>
    <MetricStrip items={[{ label: 'Total products', value: number(products.length), note: 'Products in your catalog' }, { label: 'Inventory value', value: money(products.reduce((sum, product) => sum + product.quantity * product.unit_cost, 0)), note: 'Based on unit cost', accent: true }, { label: 'Low stock', value: products.filter(product => product.quantity > 0 && product.quantity <= product.reorder_level).length, note: 'At or below reorder level' }, { label: 'Out of stock', value: products.filter(product => product.quantity === 0).length, note: 'Ready to be replenished' }]} />
    <section className="surface"><div className="tabs">{[['all', 'All products'], ['low', 'Needs restocking'], ['out', 'Out of stock']].map(([value, label]) => <button key={value} aria-pressed={stock === value} className={stock === value ? 'active' : ''} onClick={() => setParams(value === 'all' ? {} : { stock: value })}>{label}</button>)}</div><div className="toolbar"><SearchBox value={search} onChange={setSearch} placeholder="Search product name or SKU…" /><div className="toolbar-filters"><select aria-label="Product category" className="filter-select" value={category} onChange={event => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map(value => <option key={value}>{value}</option>)}</select><select aria-label="Sort products" className="filter-select" value={sort} onChange={event => setSort(event.target.value)}><option value="name">Name A–Z</option><option value="stock">Lowest stock first</option><option value="value">Highest value first</option></select></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Product</th><th>Category</th><th>On hand</th><th>Status</th><th className="align-right">Selling price</th><th className="align-right">Margin</th><th className="align-right">Actions</th></tr></thead><tbody>{loading || !visible.length ? <TableMessage columns={7} loading={loading} title={products.length ? 'No products in this view' : 'Your catalog starts here'} description={products.length ? 'Adjust your search or filters to find a product.' : 'Add your first product with its price, cost, and opening stock.'} action={!products.length && <button className="btn btn-primary" onClick={() => open()}><Plus size={14} />Add product</button>} /> : visible.map(product => <tr key={product.id}><td><div className="cell-with-icon"><span className="product-icon"><Box size={17} /></span><div><button className="row-link" onClick={() => open(product)}>{product.name}</button><span className="cell-sub mono">{product.sku}</span></div></div></td><td>{product.category || 'Uncategorized'}</td><td className="numeric primary-cell">{number(product.quantity)}<span className="cell-sub">Reorder at {product.reorder_level}</span></td><td><Status>{product.quantity === 0 ? 'Out of stock' : product.quantity <= product.reorder_level ? 'Low stock' : 'In stock'}</Status></td><td className="align-right numeric primary-cell">{money(product.selling_price)}<span className="cell-sub">Cost {money(product.unit_cost)}</span></td><td className="align-right numeric">{product.selling_price > 0 ? `${((product.selling_price - product.unit_cost) / product.selling_price * 100).toFixed(1)}%` : '—'}</td><td className="align-right"><button className="icon-button" aria-label={`Receive stock for ${product.name}`} title="Receive stock" onClick={() => { setRestock(''); setFormError(''); setParams({ receive: product.id, stock }) }}><PackagePlus size={17} /></button><button className="icon-button" aria-label={`Edit ${product.name}`} title="Edit product" onClick={() => open(product)}><Pencil size={15} /></button></td></tr>)}</tbody></table></div><Pagination total={filtered.length} page={page} onChange={setPage} /></section>
    {(creating || editing || receiving) && <Drawer title={receiving ? 'Receive stock' : editing ? 'Edit product' : 'Add product'} description={receiving ? 'Add a delivery to the quantity currently on hand.' : 'The essentials for a well-organized catalog.'} onClose={close} busy={saving}><form onSubmit={save}><fieldset disabled={saving}><div className="drawer-body"><Notice error>{formError}</Notice>{receiving ? <><div className="detail-heading"><span className="product-icon"><Box size={20} /></span><div><h3>{productToReceive?.name}</h3><p>{productToReceive?.quantity} currently on hand · {productToReceive?.sku}</p></div></div><Field label="Quantity received" hint="This adds to your stock, including any sales recorded in the meantime."><input type="number" min="1" max="1000000000" step="1" required autoFocus value={restock} onChange={event => setRestock(event.target.value)} /></Field></> : <div className="form-grid"><Field label="Product name" className="field-full"><input required autoFocus value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="e.g. Everyday notebook" /></Field><Field label="SKU"><input required value={form.sku} onChange={event => setForm({ ...form, sku: event.target.value })} placeholder="e.g. NB-001" /></Field><Field label="Category"><input list="product-categories" value={form.category || ''} onChange={event => setForm({ ...form, category: event.target.value })} placeholder="e.g. Stationery" /><datalist id="product-categories">{categories.map(value => <option key={value}>{value}</option>)}</datalist></Field><Field label="Unit cost ($)"><input required type="number" min="0" max="99999999.99" step="0.01" value={form.unit_cost ?? ''} onChange={event => setForm({ ...form, unit_cost: event.target.value })} /></Field><Field label="Selling price ($)"><input required type="number" min="0" max="99999999.99" step="0.01" value={form.selling_price ?? ''} onChange={event => setForm({ ...form, selling_price: event.target.value })} /></Field>{!editing && <Field label="Opening stock"><input required type="number" min="0" step="1" value={form.quantity} onChange={event => setForm({ ...form, quantity: event.target.value })} /></Field>}<Field label="Reorder level" hint="We’ll flag the product when stock reaches this level."><input required type="number" min="0" step="1" value={form.reorder_level ?? 10} onChange={event => setForm({ ...form, reorder_level: event.target.value })} /></Field><Field label="Description (optional)" className="field-full"><textarea value={form.description || ''} onChange={event => setForm({ ...form, description: event.target.value })} /></Field>{editing && <p className="inline-note field-full">Use “Receive stock” in the product list to add a delivery.</p>}</div>}</div><div className="drawer-footer"><button type="button" className="btn btn-secondary" onClick={close}>Cancel</button><button type="submit" className="btn btn-primary">{saving ? 'Saving…' : receiving ? 'Receive stock' : editing ? 'Save changes' : 'Add product'}</button></div></fieldset></form></Drawer>}
  </>
}
