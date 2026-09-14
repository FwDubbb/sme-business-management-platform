import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, BarChart3, Boxes, ChevronRight, Command, LayoutDashboard, LogOut, Menu, Receipt, ShoppingBag, Users, X } from 'lucide-react'
import { initials } from '../lib/workspace'
const links = [ ['/', 'Overview', LayoutDashboard], ['/sales', 'Sales', ShoppingBag], ['/inventory', 'Inventory', Boxes], ['/customers', 'Customers', Users], ['/expenses', 'Expenses', Receipt] ]
export function Brand() {
  return <span className="brand"><span className="brand-mark"><Command size={22} strokeWidth={2} /></span><span>SME<span className="brand-light">workspace</span></span></span>
}
export default function Navbar({ user, onLogout, children }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const toggle = useRef(null)
  const mobile = useRef(null)
  const current = links.find(([path]) => path === location.pathname)?.[1] || 'Workspace'
  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    if (open) mobile.current.showModal()
    else mobile.current.close()
    const previous = document.body.style.overflow
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])
  const navigation = <>
    <NavLink to="/" className="brand-link" onClick={() => setOpen(false)}><Brand /></NavLink>
    <div className="workspace-label"><span className="workspace-icon">B</span><div><strong>My business</strong><span>Business workspace</span></div></div>
    <p className="nav-section-label">WORKSPACE</p>
    <div className="nav-links">{links.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={19} strokeWidth={1.7} /><span>{label}</span><ChevronRight size={14} className="nav-arrow" /></NavLink>)}</div>
    <div className="sidebar-bottom"><div className="sidebar-note"><BarChart3 size={19} /><strong>A little clarity. Every day.</strong><p>Your sales, stock, and customer balances, together.</p><NavLink to="/sales?new=1" onClick={() => setOpen(false)}>Record a sale <ArrowUpRight size={14} /></NavLink></div><div className="profile"><span className="avatar">{initials(user?.name)}</span><div><strong>{user?.name || 'Your account'}</strong><span title={user?.email}>{user?.email}</span></div><button className="icon-button" title="Sign out" aria-label="Sign out" onClick={onLogout}><LogOut size={17} /></button></div></div>
  </>
  return <div className="app-shell"><a className="skip-link" href="#main-content">Skip to content</a><aside className="sidebar"><nav aria-label="Main navigation">{navigation}</nav></aside><dialog ref={mobile} className="mobile-sidebar" onCancel={event => { event.preventDefault(); setOpen(false); toggle.current?.focus() }}><button className="mobile-close icon-button" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20} /></button><nav aria-label="Mobile navigation">{navigation}</nav></dialog><div className="workspace-main"><div className="topbar"><div className="breadcrumb"><button ref={toggle} className="icon-button mobile-toggle" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={20} /></button><span>Workspace</span><ChevronRight size={14} /><strong>{current}</strong></div><div className="topbar-end"><span className="today-label">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span><span className="avatar avatar-small" title={user?.name}>{initials(user?.name)}</span></div></div><main id="main-content" className="page-content">{children}</main><footer className="workspace-footer"><span>SME Workspace</span><span>A clearer picture of your business.</span></footer></div></div>
}
