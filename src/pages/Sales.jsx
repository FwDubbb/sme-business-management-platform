import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search } from 'lucide-react'

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

  useEffect(() => {
    fetchSales()
    fetchCustomers()
    fetchProducts()
  }, [])

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API_URL}/sales`)
      setSales(response.data)
    } catch (error) {
      console.error('Error fetching sales:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers`)
      setCustomers(response.data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/inventory/products`)
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/sales`, formData)
      setShowForm(false)
      setFormData({
        customer_id: '',
        items: [{ product_id: '', quantity: 1, unit_price: 0 }],
        notes: ''
      })
      fetchSales()
    } catch (error) {
      console.error('Error creating sale:', error)
    }
  }

  const filteredSales = sales.filter(sale =>
    sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> New Sale
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Create New Sale</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold mb-2">Customer</label>
                <select
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
                <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                  <select
                    value={item.product_id}
                    onChange={(e) => {
                      const newItems = [...formData.items]
                      newItems[index].product_id = e.target.value
                      setFormData({ ...formData, items: newItems })
                    }}
                    className="input-field"
                  >
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...formData.items]
                      newItems[index].quantity = parseInt(e.target.value)
                      setFormData({ ...formData, items: newItems })
                    }}
                    className="input-field"
                    placeholder="Quantity"
                  />
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => {
                      const newItems = [...formData.items]
                      newItems[index].unit_price = parseFloat(e.target.value)
                      setFormData({ ...formData, items: newItems })
                    }}
                    className="input-field"
                    placeholder="Price"
                  />
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
              />
            </div>

            <button type="submit" className="btn btn-primary">Create Sale</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Search size={20} />
          <input
            type="text"
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
