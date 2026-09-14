import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, Trash2 } from 'lucide-react'

const API_URL = 'http://localhost:5000/api'

const Sales = () => {
  const [sales, setSales] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    customer_id: '',
    items: [{ product_id: '', quantity: 1, unit_price: 0 }],
    notes: ''
  })
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshData()
  }, [])

  const refreshData = async () => {
    setLoading(true)
    try {
      const [salesRes, customersRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/sales`),
        axios.get(`${API_URL}/customers`),
        axios.get(`${API_URL}/inventory/products`)
      ])
      setSales(salesRes.data)
      setCustomers(customersRes.data)
      setProducts(productsRes.data)
    } catch (error) {
      setError('Unable to refresh sales, customers, and stock. Please reload the page.')
    } finally {
      setLoading(false)
    }
  }

  const updateItem = (index, changes) => {
    setFormData(current => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return
    setError('')
    setSaving(true)
    try {
      await axios.post(`${API_URL}/sales`, {
        ...formData,
        items: formData.items.map(item => ({ ...item, quantity: Number(item.quantity), unit_price: Number(item.unit_price) }))
      })
      setShowForm(false)
      setFormData({
        customer_id: '',
        items: [{ product_id: '', quantity: 1, unit_price: 0 }],
        notes: ''
      })
      await refreshData()
    } catch (error) {
      setError(error.response?.data?.error || 'Unable to create the sale. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const filteredSales = sales.filter(sale =>
    (sale.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalCents = formData.items.reduce((sum, item) =>
    sum + Math.round(Number(item.unit_price || 0) * 100) * Number(item.quantity || 0), 0)

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={saving || loading}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> New Sale
        </button>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}

      {showForm && (
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Create New Sale</h3>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={saving || loading}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="sale-customer" className="block text-sm font-bold mb-2">Customer</label>
                <select
                  id="sale-customer"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Items</label>
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 mb-3">
                  <select
                    aria-label={`Product for item ${index + 1}`}
                    required
                    value={item.product_id}
                    onChange={(e) => {
                      const product = products.find(product => product.id === e.target.value)
                      updateItem(index, { product_id: e.target.value, unit_price: product?.selling_price ?? 0 })
                    }}
                    className="input-field"
                  >
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p.id} value={p.id} disabled={p.quantity <= 0}>{p.name} ({p.quantity} in stock)</option>)}
                  </select>
                  <input
                    type="number"
                    aria-label={`Quantity for item ${index + 1}`}
                    min="1"
                    step="1"
                    max={products.find(product => product.id === item.product_id)?.quantity}
                    required
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: e.target.value })}
                    className="input-field"
                    placeholder="Quantity"
                  />
                  <input
                    type="number"
                    aria-label={`Unit price for item ${index + 1}`}
                    min="0"
                    step="0.01"
                    max="99999999.99"
                    required
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, { unit_price: e.target.value })}
                    className="input-field"
                    placeholder="Price"
                  />
                  <button
                    type="button"
                    aria-label={`Remove item ${index + 1}`}
                    disabled={formData.items.length === 1}
                    className="btn btn-secondary"
                    onClick={() => setFormData(current => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" disabled={formData.items.length >= 100}
                onClick={() => setFormData(current => ({ ...current, items: [...current.items, { product_id: '', quantity: 1, unit_price: 0 }] }))}>
                Add Item
              </button>
              <p className="mt-4 text-lg font-bold" aria-live="polite">Total: ${(totalCents / 100).toFixed(2)}</p>
              <p className="text-sm text-gray-600">Sales are recorded on credit. Record payments from the Customers page.</p>
            </div>

            <div className="mb-4">
              <label htmlFor="sale-notes" className="block text-sm font-bold mb-2">Notes</label>
              <textarea
                id="sale-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
              />
            </div>

            <button type="submit" className="btn btn-primary">{saving ? 'Saving...' : 'Create Sale'}</button>
            </fieldset>
          </form>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Search size={20} />
          <input
            type="text"
            aria-label="Search sales by customer"
            placeholder="Search by customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1"
          />
        </div>

        <div className="table-responsive">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Total Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {(loading || filteredSales.length === 0) && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  {loading ? 'Loading sales...' : searchTerm ? 'No sales match your search.' : 'No sales yet. Create your first sale to get started.'}
                </td></tr>
              )}
              {filteredSales.map(sale => (
                <tr key={sale.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{new Date(sale.sale_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{sale.customer_name}</td>
                  <td className="px-4 py-2 font-bold">${sale.total_amount?.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${
                      sale.payment_status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {sale.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Sales
