import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
const API = 'http://localhost:5000/api'
const TRIGGERS = ['Sensory overload','Routine change','Social interaction','Loud noise','Transition','Hunger/fatigue','Communication failure','Other']

export default function Breakdown({ user }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ trigger:'Sensory overload', intensity:5, duration:10, location:'', notes:'' })
  const [history, setHistory] = useState([])
  const [msg, setMsg] = useState('')

  const load = () => axios.get(`${API}/breakdown/history/${user.id}`).then(r => setHistory(r.data)).catch(() => {})
  useEffect(() => { load() }, [])
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    try {
      const { data } = await axios.post(`${API}/breakdown/log`, { ...form, userId:user.id, intensity:Number(form.intensity), duration:Number(form.duration) })
      setMsg(`✅ Logged! ML Risk: ${data.mlRisk}`)
      setForm({ trigger:'Sensory overload', intensity:5, duration:10, location:'', notes:'' })
      load(); setTimeout(() => setMsg(''), 4000)
    } catch { setMsg('❌ Error') }
  }

  return (
    <div>
      <div className="page-header">
        <h1>⚡ {t('breakdownTitle')}</h1>
        <p>{t('breakdownSubtitle')}</p>
      </div>
      <div className="form-card">
        <h3>{t('logNewEvent')}</h3>
        {msg && <div className={`alert ${msg.startsWith('✅')?'alert-success':'alert-error'}`}>{msg}</div>}
        <div className="form-grid">
          <div className="form-group"><label>{t('trigger')}</label>
            <select name="trigger" value={form.trigger} onChange={handle}>
              {TRIGGERS.map(t2 => <option key={t2}>{t2}</option>)}
            </select>
          </div>
          <div className="form-group"><label>{t('location')}</label><input name="location" placeholder="e.g. School, Home" value={form.location} onChange={handle} /></div>
          <div className="form-group"><label>{t('intensity')} (1–10): <strong>{form.intensity}</strong></label><input name="intensity" type="range" min="1" max="10" value={form.intensity} onChange={handle} /></div>
          <div className="form-group"><label>{t('duration')}</label><input name="duration" type="number" min="1" value={form.duration} onChange={handle} /></div>
          <div className="form-group full-width"><label>{t('notes')}</label><textarea name="notes" rows="3" value={form.notes} onChange={handle} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop:20 }} onClick={submit}>{t('logBreakdown')}</button>
      </div>
      <div className="table-card">
        <h3>📋 {t('breakdownHistory')}</h3>
        {history.length ? (
          <table>
            <thead><tr><th>{t('date')}</th><th>{t('trigger')}</th><th>{t('intensity')}</th><th>{t('duration')}</th><th>{t('mlRisk')}</th></tr></thead>
            <tbody>
              {history.map(b => (
                <tr key={b.id}>
                  <td>{new Date(b.date).toLocaleDateString()}</td>
                  <td>{b.trigger}</td>
                  <td><span className={b.intensity>6?'risk-high':b.intensity>3?'risk-medium':'risk-low'}>{b.intensity}/10</span></td>
                  <td>{b.duration} min</td>
                  <td><span className={b.mlRiskCategory==='High'?'risk-high':b.mlRiskCategory==='Medium'?'risk-medium':'risk-low'}>{b.mlRiskCategory}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="alert alert-info">{t('noBreakdownsYet')}</div>}
      </div>
    </div>
  )
}