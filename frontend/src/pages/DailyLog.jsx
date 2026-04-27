import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api'

const ACTIVITIES = ['School', 'Therapy', 'Outdoor play', 'Indoor play', 'Meal time', 'Bath time', 'Social interaction', 'Screen time', 'Sleep/nap']
const BEHAVIORS  = ['Calm', 'Cooperative', 'Stimming', 'Repetitive behavior', 'Meltdown', 'Self-harm attempt', 'Aggression', 'Withdrawal', 'Good communication']

export default function DailyLog({ user }) {
  const [form, setForm] = useState({
    morningRoutine: '', afternoonRoutine: '', eveningRoutine: '',
    activitiesCompleted: [], behaviorsObserved: [],
    appetite: '3', hydration: '3', medicationTaken: false,
    caregiverNotes: '', highlights: '', concerns: ''
  })
  const [history, setHistory] = useState([])
  const [msg, setMsg]         = useState('')
  const [expanded, setExpanded] = useState(null)

  const load = () => axios.get(`${API}/dailylog/history/${user.id}`).then(r => setHistory(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const toggleArray = (field, val) => {
    const arr = form[field] || []
    setForm({ ...form, [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] })
  }

  const submit = async () => {
    try {
      await axios.post(`${API}/dailylog/log`, { ...form, userId: user.id })
      setMsg('✅ Daily log saved!')
      setForm({
        morningRoutine: '', afternoonRoutine: '', eveningRoutine: '',
        activitiesCompleted: [], behaviorsObserved: [],
        appetite: '3', hydration: '3', medicationTaken: false,
        caregiverNotes: '', highlights: '', concerns: ''
      })
      load()
      setTimeout(() => setMsg(''), 3000)
    } catch { setMsg('❌ Error saving log') }
  }

  const ratingLabel = v => ['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent'][v]

  return (
    <div>
      <div className="page-header">
        <h1>📓 Daily Log</h1>
        <p>Record daily observations, routines and behaviors for the individual</p>
      </div>

      {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 20 }}>{msg}</div>}

      {/* Routines */}
      <div className="form-card">
        <h3>🌅 Daily Routines</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>🌄 Morning Routine</label>
            <textarea name="morningRoutine" rows="2" style={{ width: '100%' }}
              placeholder="e.g. Woke up at 7am, had breakfast, got dressed independently..."
              value={form.morningRoutine} onChange={handle} />
          </div>
          <div className="form-group">
            <label>☀️ Afternoon Routine</label>
            <textarea name="afternoonRoutine" rows="2" style={{ width: '100%' }}
              placeholder="e.g. Attended school, therapy session at 2pm..."
              value={form.afternoonRoutine} onChange={handle} />
          </div>
          <div className="form-group full-width">
            <label>🌙 Evening Routine</label>
            <textarea name="eveningRoutine" rows="2" style={{ width: '100%' }}
              placeholder="e.g. Dinner at 7pm, bath, bedtime story, slept by 9pm..."
              value={form.eveningRoutine} onChange={handle} />
          </div>
        </div>
      </div>

      {/* Activities */}
      <div className="form-card">
        <h3>🎯 Activities Completed Today</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {ACTIVITIES.map(a => (
            <div key={a} onClick={() => toggleArray('activitiesCompleted', a)}
              style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                background: form.activitiesCompleted.includes(a) ? '#7c83fd' : '#f3f4f6',
                color: form.activitiesCompleted.includes(a) ? '#fff' : '#444',
                fontWeight: form.activitiesCompleted.includes(a) ? 600 : 400,
                transition: 'all 0.2s'
              }}>{a}</div>
          ))}
        </div>
      </div>

      {/* Behaviors */}
      <div className="form-card">
        <h3>👁️ Behaviors Observed</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {BEHAVIORS.map(b => {
            const isNeg = ['Meltdown','Self-harm attempt','Aggression','Withdrawal'].includes(b)
            return (
              <div key={b} onClick={() => toggleArray('behaviorsObserved', b)}
                style={{
                  padding: '8px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                  background: form.behaviorsObserved.includes(b)
                    ? (isNeg ? '#ef4444' : '#22c55e') : '#f3f4f6',
                  color: form.behaviorsObserved.includes(b) ? '#fff' : '#444',
                  fontWeight: form.behaviorsObserved.includes(b) ? 600 : 400,
                  transition: 'all 0.2s'
                }}>{b}</div>
            )
          })}
        </div>
      </div>

      {/* Health */}
      <div className="form-card">
        <h3>🏥 Health & Medication</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Appetite: <strong>{ratingLabel(form.appetite)}</strong></label>
            <input type="range" name="appetite" min="1" max="5" value={form.appetite} onChange={handle} />
          </div>
          <div className="form-group">
            <label>Hydration: <strong>{ratingLabel(form.hydration)}</strong></label>
            <input type="range" name="hydration" min="1" max="5" value={form.hydration} onChange={handle} />
          </div>
          <div className="form-group">
            <label>Medication Taken Today?</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {['Yes', 'No', 'N/A'].map(opt => (
                <div key={opt} onClick={() => setForm({ ...form, medicationTaken: opt })}
                  style={{
                    padding: '8px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14,
                    background: form.medicationTaken === opt ? '#7c83fd' : '#f3f4f6',
                    color: form.medicationTaken === opt ? '#fff' : '#444',
                    fontWeight: form.medicationTaken === opt ? 600 : 400
                  }}>{opt}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="form-card">
        <h3>📝 Caregiver Notes</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>⭐ Today's Highlights</label>
            <textarea name="highlights" rows="2" style={{ width: '100%' }}
              placeholder="What went well today?"
              value={form.highlights} onChange={handle} />
          </div>
          <div className="form-group">
            <label>⚠️ Concerns / Challenges</label>
            <textarea name="concerns" rows="2" style={{ width: '100%' }}
              placeholder="Any concerns to note?"
              value={form.concerns} onChange={handle} />
          </div>
          <div className="form-group full-width">
            <label>📋 Additional Notes</label>
            <textarea name="caregiverNotes" rows="3" style={{ width: '100%' }}
              placeholder="Any other observations..."
              value={form.caregiverNotes} onChange={handle} />
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={submit}>
          💾 Save Daily Log
        </button>
      </div>

      {/* History */}
      <div className="table-card">
        <h3>📚 Previous Logs</h3>
        {history.length ? history.map(log => (
          <div key={log.id} style={{ border: '1px solid #f0f0f0', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
            <div
              onClick={() => setExpanded(expanded === log.id ? null : log.id)}
              style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
              <div>
                <strong>{new Date(log.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                <span style={{ marginLeft: 16, fontSize: 13, color: '#888' }}>
                  {log.activitiesCompleted?.length || 0} activities · {log.behaviorsObserved?.length || 0} behaviors
                </span>
              </div>
              <span style={{ color: '#7c83fd', fontSize: 18 }}>{expanded === log.id ? '▲' : '▼'}</span>
            </div>
            {expanded === log.id && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0' }}>
                {log.morningRoutine && <p style={{ marginBottom: 8 }}><strong>🌄 Morning:</strong> {log.morningRoutine}</p>}
                {log.afternoonRoutine && <p style={{ marginBottom: 8 }}><strong>☀️ Afternoon:</strong> {log.afternoonRoutine}</p>}
                {log.eveningRoutine && <p style={{ marginBottom: 8 }}><strong>🌙 Evening:</strong> {log.eveningRoutine}</p>}
                {log.activitiesCompleted?.length > 0 && (
                  <p style={{ marginBottom: 8 }}><strong>🎯 Activities:</strong> {log.activitiesCompleted.join(', ')}</p>
                )}
                {log.behaviorsObserved?.length > 0 && (
                  <p style={{ marginBottom: 8 }}><strong>👁️ Behaviors:</strong> {log.behaviorsObserved.join(', ')}</p>
                )}
                {log.highlights && <p style={{ marginBottom: 8 }}><strong>⭐ Highlights:</strong> {log.highlights}</p>}
                {log.concerns && <p style={{ marginBottom: 8 }}><strong>⚠️ Concerns:</strong> {log.concerns}</p>}
                {log.caregiverNotes && <p><strong>📋 Notes:</strong> {log.caregiverNotes}</p>}
              </div>
            )}
          </div>
        )) : (
          <div className="alert alert-info">No daily logs yet. Add one above!</div>
        )}
      </div>
    </div>
  )
}