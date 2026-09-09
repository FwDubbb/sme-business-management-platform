import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, AlertTriangle } from 'lucide-react'

const API_URL = 'http://localhost:5000/api'

const Inventory = () => {
  const [products, setProducts] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    quantity: 0,
    unit_cost: 0,
    selling_price: 0,
    category: '',
    reorder_level: 10
  })

  useEffect(() => {
    fetchProducts()
    fetchLowStockProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/inventory/products`)
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchLowStockProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/inventory/low-stock`)
      setLowStockProducts(response.data)
    } catch (error) {
      console.error('Error fetching low stock products:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/inventory/products`, formData)
      setShowForm(false)
      setFormData({
        name: '',
        sku: '',
        description: '',
        quantity: 0,
        unit_cost: 0,
        selling_price: 0,
        category: '',
        reorder_level: 10
      })
      fetchProducts()
      fetchLowStockProducts()
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const displayProducts = showLowStockOnly ? lowStockProducts : filteredProducts

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="card bg-yellow-50 border border-yellow-200 mb-6">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle size={24} />
            <div>
              <p className="font-bold">Low Stock Alert</p>
              <p>{lowStockProducts.length} product(s) below reorder level</p>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Add New Product</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Unit Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unit_cost}
                  onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Selling Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Reorder Level</label>
                <input
                  type="number"
                  value={formData.reorder_level}
                  onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
              />
            </div>
            <button type="submit" className="btn btn-primary">Add Product</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1 min-w-[200px]"
          />
          <label className="flex items-center gap-2 ml-4">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold">Low Stock Only</span>
          </label>
        </div>

        <div className="table-responsive">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">SKU</th>
                <th className="px-4 py-2 text-left">Product Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Unit Cost</th>
                <th className="px-4 py-2 text-left">Selling Price</th>
                <th className="px-4 py-2 text-left">Profit Margin</th>
              </tr>
            </thead>
            <tbody>
              {displayProducts.map(product => {
                const margin = ((product.selling_price - product.unit_cost) / product.selling_price * 100).toFixed(1)
                const isLowStock = product.quantity <= product.reorder_level
                return (
                  <tr key={product.id} className={`border-t hover:bg-gray-50 ${isLowStock ? 'bg-yellow-50' : ''}`}>
                    <td className="px-4 py-2 font-mono text-sm">{product.sku}</td>
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">{product.category}</td>
                    <td className="px-4 py-2">
                      <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                        {product.quantity}
                      </span>
                      {isLowStock && <span className="text-xs text-red-600 ml-2">(Low)</span>}
                    </td>
                    <td className="px-4 py-2">${product.unit_cost?.toFixed(2)}</td>
                    <td className="px-4 py-2 font-bold">${product.selling_price?.toFixed(2)}</td>
                    <td className="px-4 py-2 text-green-600 font-semibold">{margin}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Inventory
