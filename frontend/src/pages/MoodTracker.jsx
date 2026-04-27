import { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const API = 'http://localhost:5000/api'

const MOODS = [
  { label: 'Very Happy', emoji: '😄', value: 5, color: '#22c55e' },
  { label: 'Happy',      emoji: '🙂', value: 4, color: '#86efac' },
  { label: 'Neutral',    emoji: '😐', value: 3, color: '#f59e0b' },
  { label: 'Sad',        emoji: '😢', value: 2, color: '#60a5fa' },
  { label: 'Very Sad',   emoji: '😭', value: 1, color: '#ef4444' },
]

const ENERGY = [
  { label: 'Very High', emoji: '⚡⚡', value: 5 },
  { label: 'High',      emoji: '⚡',   value: 4 },
  { label: 'Medium',    emoji: '🔋',   value: 3 },
  { label: 'Low',       emoji: '😴',   value: 2 },
  { label: 'Very Low',  emoji: '💤',   value: 1 },
]

export default function MoodTracker({ user }) {
  const [selectedMood,   setSelectedMood]   = useState(null)
  const [selectedEnergy, setSelectedEnergy] = useState(null)
  const [sleep,  setSleep]  = useState(8)
  const [notes,  setNotes]  = useState('')
  const [history, setHistory] = useState([])
  const [msg, setMsg] = useState('')

  const load = () => axios.get(`${API}/mood/history/${user.id}`).then(r => setHistory(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!selectedMood || !selectedEnergy) return setMsg('❌ Please select mood and energy level!')
    try {
      await axios.post(`${API}/mood/log`, {
        userId: user.id,
        mood: selectedMood,
        energy: selectedEnergy,
        sleep: Number(sleep),
        notes
      })
      setMsg('✅ Mood logged successfully!')
      setSelectedMood(null); setSelectedEnergy(null); setSleep(8); setNotes('')
      load()
      setTimeout(() => setMsg(''), 3000)
    } catch { setMsg('❌ Error logging mood') }
  }

  // Chart data — last 7 entries reversed
  const chartData = [...history].reverse().slice(-7).map(m => ({
    date: new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    mood:   m.mood,
    energy: m.energy,
    sleep:  m.sleep,
  }))

  const todayMood = history[0]

  return (
    <div>
      <div className="page-header">
        <h1>😊 Daily Mood Tracker</h1>
        <p>Track mood, energy and sleep patterns every day</p>
      </div>

      {/* Today's summary if already logged */}
      {todayMood && new Date(todayMood.date).toDateString() === new Date().toDateString() && (
        <div className="alert alert-success" style={{ marginBottom: 24, fontSize: 15 }}>
          ✅ Today's mood already logged! —
          Mood: {MOODS.find(m => m.value === todayMood.mood)?.emoji} &nbsp;
          Energy: {ENERGY.find(e => e.value === todayMood.energy)?.emoji} &nbsp;
          Sleep: {todayMood.sleep}hrs
        </div>
      )}

      {/* Log Form */}
      <div className="form-card">
        <h3>Log Today's Mood</h3>
        {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>{msg}</div>}

        {/* Mood selector */}
        <p style={{ fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 12 }}>How is the individual feeling today?</p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {MOODS.map(m => (
            <div key={m.value} onClick={() => setSelectedMood(m.value)}
              style={{
                flex: 1, minWidth: 80, padding: '14px 8px', borderRadius: 14, textAlign: 'center',
                cursor: 'pointer', border: `2px solid ${selectedMood === m.value ? m.color : '#e5e7eb'}`,
                background: selectedMood === m.value ? `${m.color}22` : '#fff',
                transition: 'all 0.2s'
              }}>
              <div style={{ fontSize: 32 }}>{m.emoji}</div>
              <div style={{ fontSize: 12, marginTop: 6, fontWeight: selectedMood === m.value ? 700 : 400, color: selectedMood === m.value ? m.color : '#666' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Energy selector */}
        <p style={{ fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 12 }}>Energy Level</p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {ENERGY.map(e => (
            <div key={e.value} onClick={() => setSelectedEnergy(e.value)}
              style={{
                flex: 1, minWidth: 80, padding: '12px 8px', borderRadius: 12, textAlign: 'center',
                cursor: 'pointer', border: `2px solid ${selectedEnergy === e.value ? '#7c83fd' : '#e5e7eb'}`,
                background: selectedEnergy === e.value ? '#f0f0ff' : '#fff',
                transition: 'all 0.2s'
              }}>
              <div style={{ fontSize: 24 }}>{e.emoji}</div>
              <div style={{ fontSize: 12, marginTop: 4, fontWeight: selectedEnergy === e.value ? 700 : 400, color: selectedEnergy === e.value ? '#7c83fd' : '#666' }}>{e.label}</div>
            </div>
          ))}
        </div>

        {/* Sleep */}
        <div className="form-grid" style={{ marginBottom: 20 }}>
          <div className="form-group">
            <label>Hours of Sleep Last Night: <strong>{sleep} hrs</strong></label>
            <input type="range" min="1" max="12" value={sleep} onChange={e => setSleep(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <input placeholder="Any observations about today..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <button className="btn btn-primary" onClick={submit}>😊 Log Mood</button>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="form-card">
          <h3>📈 Mood & Energy Trends (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 6]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mood"   stroke="#7c83fd" strokeWidth={2} dot={{ r: 5 }} name="Mood" />
              <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} dot={{ r: 5 }} name="Energy" />
              <Line type="monotone" dataKey="sleep"  stroke="#22c55e" strokeWidth={2} dot={{ r: 5 }} name="Sleep (hrs)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History Table */}
      <div className="table-card">
        <h3>📋 Mood History</h3>
        {history.length ? (
          <table>
            <thead>
              <tr><th>Date</th><th>Mood</th><th>Energy</th><th>Sleep</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {history.map(m => (
                <tr key={m.id}>
                  <td>{new Date(m.date).toLocaleDateString()}</td>
                  <td>{MOODS.find(x => x.value === m.mood)?.emoji} {MOODS.find(x => x.value === m.mood)?.label}</td>
                  <td>{ENERGY.find(x => x.value === m.energy)?.emoji} {ENERGY.find(x => x.value === m.energy)?.label}</td>
                  <td>{m.sleep} hrs</td>
                  <td style={{ color: '#888' }}>{m.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-info">No mood entries yet. Log one above!</div>
        )}
      </div>
    </div>
  )
}