import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import { login } from '../../services/api'
import './LoginPage.css'

const DEMO_USERS = [
  { role: 'investigator', email: 'investigator@karnataka.gov.in', label: '🔍 Investigator' },
  { role: 'analyst',      email: 'analyst@karnataka.gov.in',      label: '📊 Analyst' },
  { role: 'supervisor',   email: 'supervisor@karnataka.gov.in',   label: '👔 Supervisor' },
  { role: 'policymaker',  email: 'policy@karnataka.gov.in',       label: '📋 Policymaker' },
  { role: 'admin',        email: 'admin@karnataka.gov.in',        label: '⚙️ Admin' },
]

const FEATURES = [
  { icon: '💬', text: 'Natural language crime queries in English & Kannada' },
  { icon: '🕸️', text: 'Criminal network relationship mapping' },
  { icon: '📊', text: 'Real-time crime analytics & heatmaps' },
  { icon: '🔮', text: 'AI-powered crime forecasting' },
  { icon: '👤', text: 'Offender profiling & risk scoring' },
  { icon: '🎤', text: 'Voice interaction with Kannada support' },
]

export default function LoginPage() {
  const navigate  = useNavigate()
  const setUser   = useAuthStore(s => s.setUser)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [role,     setRole]     = useState('investigator')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Please enter email and password'); return }
    setLoading(true); setError('')
    try {
      const res = await login(email, password, role)
      const { token, user: u, role: r } = res.data
      useChatStore.getState().clearSession()
      setUser(u || { email }, token, r || role)
      navigate('/')
    } catch (err) {
      const matched = DEMO_USERS.find(d => d.email === email)
      if (matched && password === 'demo123') {
        const fakeToken = btoa(JSON.stringify({ email, role: matched.role }))
        useChatStore.getState().clearSession()
        setUser({ email }, fakeToken, matched.role)
        navigate('/')
      } else {
        setError(err.response?.data?.error || 'Login failed. Use demo credentials.')
      }
    } finally { setLoading(false) }
  }

  function demoLogin(demo) {
    const fakeToken = btoa(JSON.stringify({ email: demo.email, role: demo.role }))
    useChatStore.getState().clearSession()
    setUser({ email: demo.email }, fakeToken, demo.role)
    navigate('/')
  }

  return (
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="login-layout">
        {/* Left branding panel */}
        <div className="login-brand fade-in">
          <div className="login-brand-logo">
            <span className="login-brand-shield">🛡️</span>
            <div>
              <h1 className="gradient-text">CrimeIQ</h1>
              <p className="login-brand-tagline">Intelligent Crime Intelligence Platform</p>
            </div>
          </div>
          <p className="login-brand-desc">
            Empowering Karnataka Police with AI-driven analytics, natural language
            querying, and predictive crime intelligence.
          </p>
          <ul className="login-features">
            {FEATURES.map((f, i) => (
              <li key={i} className="login-feature-item" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="login-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
          <div className="login-badge">
            <span>🏛️</span>
            <span>Karnataka Police Department — Datathon 2026</span>
          </div>
        </div>

        {/* Right login card */}
        <div className="login-card-wrap fade-in" style={{ animationDelay: '150ms' }}>
          <div className="card login-card">
            <div className="card-body">
              <div className="login-card-header">
                <span className="login-card-icon">🛡️</span>
                <h2>Sign In to CrimeIQ</h2>
                <p>Karnataka Police Crime Intelligence</p>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="login-field">
                  <label className="label">Email Address</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon">📧</span>
                    <input
                      type="email"
                      className="input"
                      placeholder="officer@karnataka.gov.in"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      id="login-email"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label className="label">Password</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      id="login-password"
                      autoComplete="current-password"
                    />
                    <button type="button" className="input-icon-right btn btn-ghost btn-icon"
                      onClick={() => setShowPw(v => !v)}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className="login-field">
                  <label className="label">Role</label>
                  <select className="select" value={role} onChange={e => setRole(e.target.value)} id="login-role">
                    {DEMO_USERS.map(d => (
                      <option key={d.role} value={d.role}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary btn-lg login-submit" disabled={loading} id="login-btn">
                  {loading ? <span className="login-spinner" /> : '🔐'}
                  {loading ? 'Signing In...' : 'Sign In to CrimeIQ'}
                </button>
              </form>

              <div className="divider" />

              <div className="login-demo-section">
                <p className="login-demo-label">Quick Demo Access</p>
                <div className="login-demo-grid">
                  {DEMO_USERS.map(d => (
                    <button
                      key={d.role}
                      id={`demo-${d.role}`}
                      className="btn btn-secondary login-demo-btn"
                      onClick={() => demoLogin(d)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <p className="login-demo-hint">Password for all demo accounts: <code>demo123</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
