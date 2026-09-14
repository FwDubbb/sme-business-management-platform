import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const links = [
  ['/', 'Dashboard'],
  ['/sales', 'Sales'],
  ['/inventory', 'Inventory'],
  ['/customers', 'Customers'],
  ['/expenses', 'Expenses']
]

const linkClassName = ({ isActive }) =>
  `rounded px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
    isActive ? 'bg-blue-800 font-semibold' : 'hover:bg-blue-700'
  }`

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const menuButton = useRef(null)

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false)
      menuButton.current?.focus()
    }
  }

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav aria-label="Main navigation" onKeyDown={handleKeyDown} className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex flex-wrap gap-3 justify-between items-center">
        <div className="flex items-center gap-2">
          <NavLink to="/" className="text-xl sm:text-2xl font-bold">SME Manager</NavLink>
        </div>

        <div className="hidden lg:flex gap-1">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkClassName}>{label}</NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden sm:block max-w-32 truncate text-sm">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded"
          >
            <LogOut size={18} />
            Logout
          </button>
          <button
            ref={menuButton}
            type="button"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsOpen(open => !open)}
            className="rounded p-2 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white lg:hidden"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div id="mobile-navigation" className={`${isOpen ? 'flex' : 'hidden'} w-full flex-col gap-1 border-t border-blue-400 pt-3 lg:hidden`}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setIsOpen(false)} className={linkClassName}>{label}</NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
