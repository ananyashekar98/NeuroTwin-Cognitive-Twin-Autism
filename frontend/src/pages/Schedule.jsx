import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api'

export default function Schedule({ user }) {
  const [form, setForm]       = useState({ activity: '', time: '', type: 'structured', environment: 'indoor' })
  const [result, setResult]   = useState(null)
  const [history, setHistory] = useState([])
  const [msg, setMsg]         = useState('')

  const load = () => axios.get(`${API}/schedule/${user.id}`).then(r => setHistory(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    if (!form.activity || !form.time) return setMsg('Please fill activity and time!')
    try {
      const { data } = await axios.post(`${API}/schedule/predict`, { ...form, userId: user.id })
      setResult(data.riskScore)
      setMsg('')
      load()
    } catch { setMsg('Error predicting risk') }
  }

  const getRiskLabel = score => score >= 70 ? '🔴 High Risk' : score >= 40 ? '🟡 Medium Risk' : '🟢 Low Risk'
  const getRiskClass = score => score >= 70 ? 'risk-high' : score >= 40 ? 'risk-medium' : 'risk-low'

  return (
    <div>
      <div className="page-header">
        <h1>📅 Schedule Risk Predictor</h1>
        <p>Add an activity to predict its stress/breakdown risk level</p>
      </div>

      <div className="form-card">
        <h3>Add New Activity</h3>
        {msg && <div className="alert alert-error" style={{ marginBottom: 16 }}>{msg}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label>Activity Name</label>
            <input name="activity" placeholder="e.g. School assembly, Therapy session" value={form.activity} onChange={handle} />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input name="time" type="time" value={form.time} onChange={handle} />
          </div>
          <div className="form-group">
            <label>Activity Type</label>
            <select name="type" value={form.type} onChange={handle}>
              <option value="structured">Structured</option>
              <option value="unstructured">Unstructured</option>
              <option value="social">Social</option>
              <option value="transition">Transition</option>
              <option value="therapy">Therapy</option>
            </select>
          </div>
          <div className="form-group">
            <label>Environment</label>
            <select name="environment" value={form.environment} onChange={handle}>
              <option value="indoor">Indoor (quiet)</option>
              <option value="outdoor">Outdoor</option>
              <option value="crowded">Crowded</option>
              <option value="noisy">Noisy</option>
              <option value="public">Public place</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={submit}>
          🔍 Predict Risk
        </button>

        {result !== null && (
          <div className="alert alert-info" style={{ marginTop: 20, fontSize: 16 }}>
            Risk Score: <strong className={getRiskClass(result)}>{result}% — {getRiskLabel(result)}</strong>
          </div>
        )}
      </div>

      <div className="table-card">
        <h3>📋 Schedule History</h3>
        {history.length ? (
          <table>
            <thead>
              <tr><th>Activity</th><th>Time</th><th>Type</th><th>Environment</th><th>Risk</th></tr>
            </thead>
            <tbody>
              {history.map(s => (
                <tr key={s.id}>
                  <td>{s.activity}</td>
                  <td>{s.time}</td>
                  <td style={{ textTransform: 'capitalize' }}>{s.type}</td>
                  <td style={{ textTransform: 'capitalize' }}>{s.environment}</td>
                  <td><span className={getRiskClass(s.riskScore)}>{s.riskScore}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-info">No schedules yet. Add one above!</div>
        )}
      </div>
    </div>
  )
}