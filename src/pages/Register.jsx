import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import api, { errorMessage } from '../lib/api'
import AuthLayout from '../components/AuthLayout'
import { Field, Notice } from '../components/UI'
export default function Register({ onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault()
    if (loading) return
    if (form.password !== form.confirm) { setError('Your passwords don’t match. Please try again.'); return }
    setLoading(true); setError('')
    try { const { data } = await api.post('/auth/register', { name: form.name.trim(), email: form.email.trim(), password: form.password }); onLogin(data.token, data.user) }
    catch (error) { setError(errorMessage(error)) } finally { setLoading(false) }
  }
  return <AuthLayout><p className="eyebrow">A FRESH START</p><h2>Make yourself at home.</h2><p className="auth-intro">Create your account and bring the day-to-day into one workspace.</p><Notice error>{error}</Notice><form onSubmit={submit}><fieldset disabled={loading}><Field label="Your name"><input required autoComplete="name" value={form.name} placeholder="Your full name" onChange={event => setForm({ ...form, name: event.target.value })} /></Field><Field label="Email address"><input type="email" required autoComplete="email" value={form.email} placeholder="you@business.com" onChange={event => setForm({ ...form, email: event.target.value })} /></Field><Field label="Password" hint="Use at least 8 characters."><div className="password-field"><input className="input-field" aria-label="Password" type={showPassword ? 'text' : 'password'} required minLength={8} autoComplete="new-password" value={form.password} placeholder="Create a password" onChange={event => setForm({ ...form, password: event.target.value })} /><button type="button" className="icon-button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></Field><Field label="Confirm password"><input type={showPassword ? 'text' : 'password'} required minLength={8} autoComplete="new-password" value={form.confirm} placeholder="Enter it once more" onChange={event => setForm({ ...form, confirm: event.target.value })} /></Field><button type="submit" className="btn btn-primary">{loading ? 'Creating account…' : 'Create account'}<ArrowRight size={15} /></button></fieldset></form><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p></AuthLayout>
}
