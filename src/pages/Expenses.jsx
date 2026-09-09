import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API_URL = 'http://localhost:5000/api'

const Expenses = () => {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [expenseData, setExpenseData] = useState({
    category: '',
    description: '',
    amount: 0,
    payment_method: 'cash',
    status: 'paid',
    notes: ''
  })
  const [categoryData, setCategoryData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchExpenses()
    fetchCategories()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_URL}/expenses`)
      setExpenses(response.data)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/expenses/categories`)
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/expenses`, expenseData)
      setShowForm(false)
      setExpenseData({
        category: '',
        description: '',
        amount: 0,
        payment_method: 'cash',
        status: 'paid',
        notes: ''
      })
      fetchExpenses()
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/expenses/categories`, categoryData)
      setShowCategoryForm(false)
      setCategoryData({ name: '', description: '' })
      fetchCategories()
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const getFilteredExpenses = () => {
    let filtered = expenses.filter(expense =>
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (dateFilter !== 'all') {
      const today = new Date()
      const startDate = new Date()

      if (dateFilter === 'today') {
        startDate.setDate(today.getDate() - 1)
      } else if (dateFilter === 'week') {
        startDate.setDate(today.getDate() - 7)
      } else if (dateFilter === 'month') {
        startDate.setMonth(today.getMonth() - 1)
      }

      filtered = filtered.filter(expense =>
        new Date(expense.expense_date) >= startDate
      )
    }

    return filtered
  }

  const filteredExpenses = getFilteredExpenses()

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  const expensesByCategory = categories.map(cat => {
    const total = filteredExpenses
      .filter(exp => exp.category === cat.name)
      .reduce((sum, exp) => sum + (exp.amount || 0), 0)
    return { name: cat.name, value: total }
  }).filter(item => item.value > 0)

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryForm(!showCategoryForm)}
            className="btn btn-secondary text-sm"
          >
            <Plus size={18} /> Category
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} /> New Expense
          </button>
        </div>
      </div>

      {showCategoryForm && (
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Add Expense Category</h3>
          <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Category Name</label>
              <input
                type="text"
                value={categoryData.name}
                onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Description</label>
              <input
                type="text"
                value={categoryData.description}
                onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                className="input-field"
              />
            </div>
            <button type="submit" className="btn btn-primary col-span-full md:col-span-2">Add Category</button>
          </form>
        </div>
      )}

      {showForm && (
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Record New Expense</h3>
          <form onSubmit={handleAddExpense}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold mb-2">Category</label>
                <select
                  value={expenseData.category}
                  onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({ ...expenseData, amount: parseFloat(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Payment Method</label>
                <select
                  value={expenseData.payment_method}
                  onChange={(e) => setExpenseData({ ...expenseData, payment_method: e.target.value })}
                  className="input-field"
                >
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Status</label>
                <select
                  value={expenseData.status}
                  onChange={(e) => setExpenseData({ ...expenseData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Description</label>
              <input
                type="text"
                value={expenseData.description}
                onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Notes</label>
              <textarea
                value={expenseData.notes}
                onChange={(e) => setExpenseData({ ...expenseData, notes: e.target.value })}
                className="input-field"
              />
            </div>
            <button type="submit" className="btn btn-primary">Add Expense</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <p className="text-gray-600 text-sm">Total Expenses</p>
          <p className="text-3xl font-bold text-orange-600">${totalExpenses?.toFixed(2)}</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-gray-600 text-sm">Number of Expenses</p>
          <p className="text-3xl font-bold text-blue-600">{filteredExpenses.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-gray-600 text-sm">Average Expense</p>
          <p className="text-3xl font-bold text-green-600">${(totalExpenses / (filteredExpenses.length || 1))?.toFixed(2)}</p>
        </div>
      </div>

      {expensesByCategory.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-lg font-bold mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expensesByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1 min-w-[200px]"
          />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field min-w-[120px]"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Payment Method</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{new Date(expense.expense_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{expense.category}</td>
                  <td className="px-4 py-2">{expense.description}</td>
                  <td className="px-4 py-2 font-bold text-orange-600">${expense.amount?.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm">{expense.payment_method}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${
                      expense.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {expense.status}
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

export default Expenses
