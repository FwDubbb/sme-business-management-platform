import { useNavigate } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'
import { useState } from 'react'

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">SME Manager</h1>
        </div>

        <div className="hidden md:flex gap-6">
          <a href="/" className="hover:text-blue-200">Dashboard</a>
          <a href="/sales" className="hover:text-blue-200">Sales</a>
          <a href="/inventory" className="hover:text-blue-200">Inventory</a>
          <a href="/customers" className="hover:text-blue-200">Customers</a>
          <a href="/expenses" className="hover:text-blue-200">Expenses</a>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
