import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
const API = 'http://localhost:5000/api'

export default function Schedule({ user }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ activity:'', time:'', type:'structured', environment:'indoor' })
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [msg, setMsg] = useState('')

  const load = () => axios.get(`${API}/schedule/${user.id}`).then(r => setHistory(r.data)).catch(() => {})
  useEffect(() => { load() }, [])
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    if (!form.activity || !form.time) return setMsg('Please fill activity and time!')
    try {
      const { data } = await axios.post(`${API}/schedule/predict`, { ...form, userId: user.id })
      setResult(data); setMsg(''); load()
    } catch { setMsg('Error predicting risk') }
  }

  const getRiskClass = score => score >= 70 ? 'risk-high' : score >= 40 ? 'risk-medium' : 'risk-low'

  return (
    <div>
      <div className="page-header">
        <h1>📅 {t('scheduleTitle')}</h1>
        <p>{t('scheduleSubtitle')}</p>
      </div>
      <div className="form-card">
        <h3>{t('addNewActivity')}</h3>
        {msg && <div className="alert alert-error" style={{ marginBottom:16 }}>{msg}</div>}
        <div className="form-grid">
          <div className="form-group"><label>{t('activityName')}</label><input name="activity" placeholder="e.g. School assembly" value={form.activity} onChange={handle} /></div>
          <div className="form-group"><label>{t('time')}</label><input name="time" type="time" value={form.time} onChange={handle} /></div>
          <div className="form-group"><label>{t('activityType')}</label>
            <select name="type" value={form.type} onChange={handle}>
              <option value="structured">Structured</option>
              <option value="unstructured">Unstructured</option>
              <option value="social">Social</option>
              <option value="transition">Transition</option>
              <option value="therapy">Therapy</option>
            </select>
          </div>
          <div className="form-group"><label>{t('environment')}</label>
            <select name="environment" value={form.environment} onChange={handle}>
              <option value="indoor">Indoor (quiet)</option>
              <option value="outdoor">Outdoor</option>
              <option value="crowded">Crowded</option>
              <option value="noisy">Noisy</option>
              <option value="public">Public place</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop:20 }} onClick={submit}>{t('predictRisk')}</button>
        {result && (
  <div className="alert alert-info" style={{ marginTop:20, fontSize:16 }}>
    {t('mlRiskScore')}: <strong className={getRiskClass(result.riskScore)}>
      {result.riskScore}% — {result.riskCategory} Risk
    </strong>
    {result.personalized && (
      <span style={{ marginLeft:12, background:'#7c83fd', color:'#fff', padding:'2px 10px', borderRadius:10, fontSize:12, fontWeight:700 }}>
        🎯 Personalized Model
      </span>
    )}
  </div>
)}
      </div>
      <div className="table-card">
        <h3>📋 {t('scheduleHistory')}</h3>
        {history.length ? (
          <table>
            <thead><tr><th>{t('activity')}</th><th>{t('time')}</th><th>{t('type')}</th><th>{t('environment')}</th><th>{t('mlRiskScore')}</th></tr></thead>
            <tbody>
              {history.map(s => (
                <tr key={s.id}>
                  <td>{s.activity}</td><td>{s.time}</td>
                  <td style={{ textTransform:'capitalize' }}>{s.type}</td>
                  <td style={{ textTransform:'capitalize' }}>{s.environment}</td>
                  <td><span className={getRiskClass(s.riskScore)}>{s.riskScore}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="alert alert-info">{t('noSchedules')}</div>}
      </div>
    </div>
  )
}