import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, CreditCard } from 'lucide-react'

const API_URL = 'http://localhost:5000/api'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [customerDebts, setCustomerDebts] = useState([])
  const [paymentData, setPaymentData] = useState({
    debt_id: '',
    amount: 0,
    payment_method: 'cash'
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    credit_limit: 0
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers`)
      setCustomers(response.data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchCustomerDebts = async (customerId) => {
    try {
      const response = await axios.get(`${API_URL}/customers/${customerId}/debts`)
      setCustomerDebts(response.data)
    } catch (error) {
      console.error('Error fetching debts:', error)
    }
  }

  const handleAddCustomer = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/customers`, formData)
      setShowForm(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        credit_limit: 0
      })
      fetchCustomers()
    } catch (error) {
      console.error('Error adding customer:', error)
    }
  }

  const handleRecordPayment = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/customers/${selectedCustomer.id}/payments`, paymentData)
      setShowPaymentForm(false)
      setPaymentData({ debt_id: '', amount: 0, payment_method: 'cash' })
      fetchCustomerDebts(selectedCustomer.id)
    } catch (error) {
      console.error('Error recording payment:', error)
    }
  }

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer)
    fetchCustomerDebts(customer.id)
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Customer
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Add New Customer</h3>
          <form onSubmit={handleAddCustomer}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Credit Limit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.credit_limit}
                  onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Add Customer</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field flex-1"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCustomers.map(customer => (
                <div
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <p className="font-bold">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                  <p className="text-sm font-semibold text-red-600">Debt: ${customer.total_debt?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedCustomer && (
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <h3 className="text-xl font-bold mb-4">Customer Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-bold">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-bold">{selectedCustomer.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-bold">{selectedCustomer.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Credit Limit</p>
                  <p className="font-bold">${selectedCustomer.credit_limit?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Debt</p>
                  <p className="font-bold text-red-600">${selectedCustomer.total_debt?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-bold">{selectedCustomer.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Pending Debts</h3>
                <button
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className="btn btn-primary flex items-center gap-2 text-sm"
                >
                  <CreditCard size={16} /> Record Payment
                </button>
              </div>

              {showPaymentForm && (
                <form onSubmit={handleRecordPayment} className="mb-6 p-4 bg-gray-50 rounded">
                  <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Select Debt</label>
                    <select
                      value={paymentData.debt_id}
                      onChange={(e) => setPaymentData({ ...paymentData, debt_id: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Select Debt</option>
                      {customerDebts.map(debt => (
                        <option key={debt.id} value={debt.id}>
                          ${debt.amount?.toFixed(2)} - {debt.status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Payment Method</label>
                      <select
                        value={paymentData.payment_method}
                        onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                        className="input-field"
                      >
                        <option value="cash">Cash</option>
                        <option value="check">Check</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="card">Card</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-full">Record Payment</button>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Remaining</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerDebts.map(debt => (
                      <tr key={debt.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2 font-bold">${debt.amount?.toFixed(2)}</td>
                        <td className="px-4 py-2 text-red-600 font-bold">${debt.remaining_amount?.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${
                            debt.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            {debt.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">{debt.due_date ? new Date(debt.due_date).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Customers
