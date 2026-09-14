import { useCallback, useEffect, useRef, useState } from 'react'
import api from './api'
export const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
export const number = value => new Intl.NumberFormat('en-US').format(Number(value) || 0)
export const initials = name => (name || '?').trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()
export const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
export function parseDate(value) {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T12:00:00`)
  return new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`)
}
export const dateLabel = value => {
  const date = parseDate(value)
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
}
export function inPeriod(value, period) {
  if (period === 'all') return true
  const date = parseDate(value)
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (period === 'week') start.setDate(start.getDate() - (start.getDay() + 6) % 7)
  if (period === 'month') start.setDate(1)
  if (period === '30') start.setDate(start.getDate() - 29)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return date && date >= start && date < end
}
export function useData(paths) {
  const key = paths.join('|')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const activeRequest = useRef(null)
  const reload = useCallback(async () => {
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    setLoading(true)
    setError('')
    try {
      const responses = await Promise.all(key.split('|').map(path => api.get(path, { signal: controller.signal })))
      if (!controller.signal.aborted) setData(responses.map(response => response.data))
    } catch {
      if (!controller.signal.aborted) setError('We couldn’t load your workspace. Check your connection and try again.')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [key])
  useEffect(() => { setData([]); reload(); return () => activeRequest.current?.abort() }, [reload])
  return { data, loading, error, reload }
}
export function exportCsv(filename, columns, records) {
  const cell = value => {
    let text = String(value ?? '')
    if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`
    return `"${text.replaceAll('"', '""')}"`
  }
  const rows = [columns.map(column => cell(column.label)).join(','), ...records.map(record => columns.map(column => cell(column.value(record))).join(','))]
  const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
