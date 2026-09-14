import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import api, { errorMessage } from '../lib/api'
import AuthLayout from '../components/AuthLayout'
import { Field, Notice } from '../components/UI'
export default function Login({ onLogin, expired }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault()
    if (loading) return
    setLoading(true); setError('')
    try { const { data } = await api.post('/auth/login', { email: email.trim(), password }); onLogin(data.token, data.user) }
    catch (error) { setError(errorMessage(error)) } finally { setLoading(false) }
  }
  return <AuthLayout><p className="eyebrow">WELCOME BACK</p><h2>Back to business.</h2><p className="auth-intro">Sign in to your workspace. Everything is right where you left it.</p><Notice error>{error || (expired ? 'Your session has expired. Please sign in again.' : '')}</Notice><form onSubmit={submit}><fieldset disabled={loading}><Field label="Email address"><input type="email" required autoComplete="email" value={email} placeholder="you@business.com" onChange={event => setEmail(event.target.value)} /></Field><Field label="Password"><div className="password-field"><input className="input-field" aria-label="Password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} placeholder="Enter your password" onChange={event => setPassword(event.target.value)} /><button type="button" className="icon-button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></Field><button type="submit" className="btn btn-primary">{loading ? 'Signing in…' : 'Sign in'}<ArrowRight size={15} /></button></fieldset></form><p className="auth-switch">New to the workspace? <Link to="/register">Create an account</Link></p></AuthLayout>
}
