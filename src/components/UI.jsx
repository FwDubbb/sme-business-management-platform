import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Inbox, Search, X } from 'lucide-react'
export function PageHeader({ eyebrow, title, description, children }) {
  return <header className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div><div className="heading-actions">{children}</div></header>
}
export function Notice({ children, error = false, onDismiss, onRetry }) {
  if (!children) return null
  return <div className={`notice ${error ? 'notice-error' : ''}`} role={error ? 'alert' : 'status'}>{error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}<span>{children}</span>{onRetry && <button onClick={onRetry} className="text-button">Try again</button>}{onDismiss && <button className="icon-button" onClick={onDismiss} aria-label="Dismiss message"><X size={16} /></button>}</div>
}
export function SearchBox({ value, onChange, placeholder = 'Search records…' }) {
  return <div className="search-box"><Search size={17} /><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} />{value && <button onClick={() => onChange('')} aria-label="Clear search"><X size={15} /></button>}</div>
}
export function EmptyState({ title = 'Nothing here yet', description, action, icon: Icon = Inbox }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={25} strokeWidth={1.5} /></div><h3>{title}</h3><p>{description}</p>{action}</div>
}
export function Status({ children, tone }) {
  const style = tone || (children === 'paid' || children === 'In stock' ? 'green' : children === 'Out of stock' ? 'red' : 'amber')
  return <span className={`status status-${style}`}><span />{children}</span>
}
export function MetricStrip({ items }) {
  return <div className="metric-strip">{items.map(item => <div className="metric" key={item.label}><span className="metric-label">{item.label}</span><strong className={item.accent ? 'text-accent' : ''}>{item.value}</strong><span className="metric-note">{item.note}</span></div>)}</div>
}
export function Field({ label, hint, children, className = '' }) {
  return <label className={`field ${className}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}
export function Drawer({ title, description, onClose, children, busy = false, wide = false }) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    element.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { element.close(); document.body.style.overflow = previous }
  }, [])
  return <dialog ref={dialog} aria-label={title} className={`drawer ${wide ? 'drawer-wide' : ''}`} onCancel={event => { event.preventDefault(); if (!busy) onClose() }}><div className="drawer-header"><div><p className="eyebrow">SME WORKSPACE</p><h2>{title}</h2>{description && <p>{description}</p>}</div><button disabled={busy} className="icon-button" aria-label="Close panel" onClick={onClose}><X size={21} /></button></div>{children}</dialog>
}
export function Pagination({ total, page, onChange, pageSize = 10 }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return <div className="pagination"><span>{total ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total} records` : '0 records'}</span><div><button aria-label="Previous page" className="icon-button" disabled={page <= 1} onClick={() => onChange(page - 1)}><ArrowLeft size={16} /></button><span>Page {page} of {pages}</span><button aria-label="Next page" className="icon-button" disabled={page >= pages} onClick={() => onChange(page + 1)}><ArrowRight size={16} /></button></div></div>
}
export function usePagination(records, filterKey) {
  const [requestedPage, setPage] = useState(1)
  useEffect(() => setPage(1), [filterKey])
  const page = Math.min(requestedPage, Math.max(1, Math.ceil(records.length / 10)))
  return { page, setPage, visible: records.slice((page - 1) * 10, page * 10) }
}
export function PeriodSelect({ value, onChange }) {
  return <select className="filter-select" aria-label="Date range" value={value} onChange={event => onChange(event.target.value)}><option value="all">All time</option><option value="today">Today</option><option value="week">This week</option><option value="month">This month</option><option value="30">Last 30 days</option></select>
}
export function TableMessage({ columns, loading, title, description, action }) {
  return <tr><td colSpan={columns}>{loading ? <div className="loading-state"><span className="spinner" />Loading records…</div> : <EmptyState title={title} description={description} action={action} />}</td></tr>
}
