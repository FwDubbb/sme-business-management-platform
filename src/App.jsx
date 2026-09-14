import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Sales = lazy(() => import('./pages/Sales'))
const Inventory = lazy(() => import('./pages/Inventory'))
const Customers = lazy(() => import('./pages/Customers'))
const Expenses = lazy(() => import('./pages/Expenses'))
function savedUser() {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    return localStorage.getItem('token') && user?.id ? user : null
  } catch { return null }
}
export default function App() {
  const [user, setUser] = useState(savedUser)
  const [expired, setExpired] = useState(false)
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }
  useEffect(() => {
    const onExpired = () => { logout(); setExpired(true) }
    window.addEventListener('session-expired', onExpired)
    return () => window.removeEventListener('session-expired', onExpired)
  }, [])
  const login = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setExpired(false)
  }
  const content = <Suspense fallback={<div className="loading-state"><span className="spinner" />Opening workspace…</div>}><Routes>
    <Route path="/" element={<Dashboard />} /><Route path="/sales" element={<Sales />} /><Route path="/inventory" element={<Inventory />} /><Route path="/customers" element={<Customers />} /><Route path="/expenses" element={<Expenses />} /><Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense>
  return <BrowserRouter>{user ? <Navbar user={user} onLogout={logout}>{content}</Navbar> : <Routes><Route path="/login" element={<Login onLogin={login} expired={expired} />} /><Route path="/register" element={<Register onLogin={login} />} /><Route path="*" element={<Navigate to="/login" replace />} /></Routes>}</BrowserRouter>
}
