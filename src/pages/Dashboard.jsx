import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDownToLine, ArrowRight, Boxes, Check, Plus, Sparkles, Wallet } from 'lucide-react'
import { EmptyState, MetricStrip, Notice, PageHeader, Status, TableMessage } from '../components/UI'
import { dateLabel, exportCsv, inPeriod, localDate, money, parseDate, useData } from '../lib/workspace'

export default function Dashboard() {
  const { data: [sales = [], expenses = [], products = [], customers = []], loading, error, reload } = useData(['/sales', '/expenses', '/inventory/products', '/customers'])
  const [period, setPeriod] = useState('30')
  const filteredSales = sales.filter(sale => inPeriod(sale.sale_date, period))
  const filteredExpenses = expenses.filter(expense => inPeriod(expense.expense_date, period))
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0)
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const debt = customers.reduce((sum, customer) => sum + (customer.total_debt || 0), 0)
  const lowStock = products.filter(product => product.quantity <= product.reorder_level)
  const unpaidExpenses = expenses.filter(expense => expense.status === 'pending')
  const chartDays = period === 'month' ? new Date().getDate() : 30
  const trend = Array.from({ length: chartDays }, (_, index) => {
    const day = new Date()
    day.setDate(day.getDate() - chartDays + 1 + index)
    const key = localDate(day)
    return { date: key, label: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), sales: filteredSales.filter(sale => localDate(parseDate(sale.sale_date)) === key).reduce((sum, sale) => sum + sale.total_amount, 0) }
  })
  const exportOverview = () => exportCsv('business-overview.csv', [{ label: 'Metric', value: row => row.label }, { label: 'Value', value: row => row.value }, { label: 'Period', value: row => row.period }], [
    { label: 'Recorded sales', value: totalSales, period: period === '30' ? 'Last 30 days' : 'This month' },
    { label: 'Recorded expenses', value: totalExpenses, period: period === '30' ? 'Last 30 days' : 'This month' },
    { label: 'Outstanding customer debt', value: debt, period: 'All time' },
    { label: 'Low stock products', value: lowStock.length, period: 'Current stock' }
  ])
  return <>
    <PageHeader eyebrow="YOUR BUSINESS, AT A GLANCE" title="Overview" description="A little perspective on what’s moving your business forward."><button className="btn btn-secondary" onClick={exportOverview} disabled={loading || !!error}><ArrowDownToLine size={15} />Export summary</button><Link className="btn btn-primary" to="/sales?new=1"><Plus size={16} />New sale</Link></PageHeader>
    <Notice error onRetry={reload}>{error}</Notice>
    <div className="section-heading" style={{ paddingBottom: 15 }}><span className="muted" style={{ fontSize: 11 }}>Business performance</span><select className="filter-select" aria-label="Overview period" value={period} onChange={event => setPeriod(event.target.value)}><option value="30">Last 30 days</option><option value="month">This month</option></select></div>
    <MetricStrip items={[
      { label: 'Recorded sales', value: loading ? '—' : money(totalSales), note: `${filteredSales.length} sales in this period`, accent: true },
      { label: 'Recorded expenses', value: loading ? '—' : money(totalExpenses), note: `${filteredExpenses.length} expenses in this period` },
      { label: 'Outstanding balance', value: loading ? '—' : money(debt), note: 'Unpaid customer debt · all time' },
      { label: 'Catalog products', value: loading ? '—' : products.length, note: `${lowStock.length} products need attention` }
    ]} />
    {!loading && !error && products.length === 0 && <div className="onboarding"><Sparkles size={23} /><div><h2>Make room for a better workday.</h2><p>Start with your products, add your customers, then record your first sale.</p></div><Link to="/inventory?new=1" className="btn btn-primary">Add your first product <ArrowRight size={15} /></Link></div>}
    <div className="dashboard-grid"><section className="chart-section"><div className="section-heading"><div><h2>Sales activity</h2><p>Recorded revenue over time</p></div><div className="chart-legend"><span><i className="legend-dot" />Sales</span></div></div>
      {loading ? <div className="loading-state"><span className="spinner" />Loading activity…</div> : filteredSales.length ? <ResponsiveContainer width="100%" height={245}><AreaChart data={trend} margin={{ top: 10, right: 5, bottom: 0, left: -18 }}><defs><linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7fa485" stopOpacity={.2} /><stop offset="100%" stopColor="#7fa485" stopOpacity={.01} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#edf0e8" strokeDasharray="3 3" /><XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={36} tick={{ fontSize: 9, fill: '#98a58b' }} dy={8} /><YAxis axisLine={false} tickLine={false} tickFormatter={value => `$${value >= 1000 ? `${value / 1000}k` : value}`} tick={{ fontSize: 9, fill: '#98a58b' }} /><Tooltip formatter={value => [money(value), 'Recorded sales']} contentStyle={{ border: '1px solid #e0e7da', borderRadius: 6, fontSize: 11 }} /><Area isAnimationActive={false} dataKey="sales" type="monotone" stroke="#608b65" strokeWidth={2} fill="url(#sales-fill)" /></AreaChart></ResponsiveContainer> : <EmptyState title="Your next chapter starts with a sale" description="Recorded sales will appear here. Choose a different period or create a sale to get started." action={<Link to="/sales?new=1" className="text-button">Record a sale <ArrowRight size={14} /></Link>} />}
    </section><section className="attention-section"><div className="section-heading"><div><h2>Needs your attention</h2><p>A few things to keep an eye on</p></div></div>
      <Link className="attention-item" to="/inventory?stock=low"><span className={`attention-symbol ${lowStock.length ? '' : 'green'}`}><Boxes size={16} /></span><div><strong>{lowStock.length ? `${lowStock.length} products are running low` : 'Your stock is in good shape'}</strong><p>{lowStock.length ? lowStock.slice(0, 2).map(product => product.name).join(', ') : 'Review products and keep your shelves ready.'}</p></div><ArrowRight size={14} className="muted" /></Link>
      <Link className="attention-item" to="/customers?balance=outstanding"><span className="attention-symbol"><Wallet size={16} /></span><div><strong>{money(debt)} in customer balances</strong><p>Review outstanding debts and record payments.</p></div><ArrowRight size={14} className="muted" /></Link>
      <Link className="attention-item" to="/expenses?status=pending"><span className={`attention-symbol ${unpaidExpenses.length ? '' : 'green'}`}><Check size={16} /></span><div><strong>{unpaidExpenses.length ? `${unpaidExpenses.length} expenses awaiting payment` : 'No pending expenses'}</strong><p>Keep the small costs from becoming surprises.</p></div><ArrowRight size={14} className="muted" /></Link>
      <div className="quick-actions"><Link to="/customers?new=1" className="btn btn-secondary"><Plus size={13} />Customer</Link><Link to="/expenses?new=1" className="btn btn-secondary"><Plus size={13} />Expense</Link></div>
    </section></div>
    <div className="section-heading"><div><h2>Recent sales</h2><p>The latest entries in your sales register</p></div><Link className="text-button" to="/sales">View all sales <ArrowRight size={14} /></Link></div>
    <div className="surface table-wrap"><table className="data-table"><thead><tr><th>Reference</th><th>Customer</th><th>Date</th><th>Status</th><th className="align-right">Amount</th></tr></thead><tbody>{loading || !sales.length ? <TableMessage columns={5} loading={loading} title="Your sales register is ready" description="Your first recorded sale will appear here." /> : sales.slice(0, 5).map(sale => <tr key={sale.id}><td><Link to={`/sales?detail=${sale.id}`} className="row-link mono">#{sale.id.slice(0, 8).toUpperCase()}</Link></td><td className="primary-cell">{sale.customer_name || 'Customer'}</td><td>{dateLabel(sale.sale_date)}</td><td><Status>{sale.payment_status}</Status></td><td className="align-right primary-cell numeric">{money(sale.total_amount)}</td></tr>)}</tbody></table></div>
  </>
}
