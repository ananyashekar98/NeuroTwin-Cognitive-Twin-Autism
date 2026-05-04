import { useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
const API = 'http://localhost:5000/api'

export default function Login({ onLogin }) {
  const { t } = useTranslation()
  const [tab, setTab]     = useState('login')
  const [form, setForm]   = useState({ name:'', email:'', password:'', role:'caregiver' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const url = tab==='login' ? `${API}/auth/login` : `${API}/auth/register`
      const { data } = await axios.post(url, form)
      onLogin(data.user)
    } catch (err) { setError(err.response?.data?.error || 'Something went wrong') }
    setLoading(false)
  }

  return (
    <div className="login-page" style={{ position:'relative' }}>

      {/* Language switcher — top right corner */}
      <div style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
        width: 180,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: 12,
          padding: 4,
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <LanguageSwitcher position="down" />
        </div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🧠</div>
          <h1 style={{ fontSize:26, fontWeight:800, color:'#1a1a2e' }}>{t('appName')}</h1>
          <p style={{ color:'#888', fontSize:13, marginTop:4 }}>{t('appSubtitle')}</p>
        </div>

        <div className="tab-switch">
          <button className={`tab-btn ${tab==='login'?'active':''}`}
            onClick={() => { setTab('login'); setError('') }}>{t('login')}</button>
          <button className={`tab-btn ${tab==='register'?'active':''}`}
            onClick={() => { setTab('register'); setError('') }}>{t('register')}</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {tab==='register' && (
            <div className="form-group">
              <label>{t('fullName')}</label>
              <input name="name" placeholder={t('fullName')} value={form.name} onChange={handle} />
            </div>
          )}
          <div className="form-group">
            <label>{t('email')}</label>
            <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handle} />
          </div>
          <div className="form-group">
            <label>{t('password')}</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} />
          </div>
          {tab==='register' && (
            <div className="form-group">
              <label>{t('role')}</label>
              <select name="role" value={form.role} onChange={handle}>
                <option value="caregiver">{t('caregiver')}</option>
                <option value="therapist">{t('therapist')}</option>
                <option value="patient">{t('patient')}</option>
              </select>
            </div>
          )}
          <button className="btn btn-primary"
            style={{ width:'100%', padding:14, fontSize:15, marginTop:6 }}
            onClick={submit} disabled={loading}>
            {loading ? t('loading') : tab==='login' ? t('loginBtn') : t('createAccount')}
          </button>
        </div>
      </div>
    </div>
  )
}