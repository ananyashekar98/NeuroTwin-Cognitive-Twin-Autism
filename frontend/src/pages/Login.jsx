import { useState } from 'react'
import axios from 'axios'
const API = 'http://localhost:5000/api'
export default function Login({ onLogin }) {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'caregiver' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })
  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const url = tab === 'login' ? `${API}/auth/login` : `${API}/auth/register`
      const { data } = await axios.post(url, form)
      onLogin(data.user)
    } catch (err) { setError(err.response?.data?.error || 'Something went wrong') }
    setLoading(false)
  }
  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🧠</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e' }}>CognitiveTwin</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>AI-Based ASD Support System</p>
        </div>
        <div className="tab-switch">
          <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError('') }}>Login</button>
          <button className={`tab-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError('') }}>Register</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" placeholder="Your full name" value={form.name} onChange={handle} />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handle} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} />
          </div>
          {tab === 'register' && (
            <div className="form-group">
  <label>Role</label>
  <select name="role" value={form.role} onChange={handle}>
    <option value="caregiver">🩺 Caregiver</option>
    <option value="therapist">👨‍⚕️ Therapist</option>
    <option value="patient">🧑 Patient / Individual</option>
  </select>
</div>
)}
          <button className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 15, marginTop: 6 }} onClick={submit} disabled={loading}>
            {loading ? 'Please wait...' : tab === 'login' ? '🔐 Login' : '✅ Create Account'}
          </button>
        </div>
      </div>
    </div>
  )
}