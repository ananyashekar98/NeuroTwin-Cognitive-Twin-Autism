import { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api'

const MOODS = ['','😭','😢','😐','🙂','😄']
const ENERGY = ['','💤','😴','🔋','⚡','⚡⚡']

export default function PatientHome({ user, onNavigate }) {
  const [profile, setProfile]   = useState(null)
  const [moods, setMoods]       = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [todayMood, setTodayMood] = useState(null)

  useEffect(() => {
    axios.get(`${API}/profile/${user.id}`).then(r => setProfile(r.data)).catch(() => {})
    axios.get(`${API}/mood/history/${user.id}`).then(r => {
      setMoods(r.data)
      const today = r.data.find(m => new Date(m.date).toDateString() === new Date().toDateString())
      setTodayMood(today || null)
    }).catch(() => {})
    axios.get(`${API}/dashboard/${user.id}`).then(r => setDashboard(r.data)).catch(() => {})
  }, [user.id])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const quickActions = [
    { icon: '😊', label: 'Log My Mood', page: 'mood', color: '#7c83fd', desc: 'How are you feeling today?' },
    { icon: '📓', label: 'Daily Log',   page: 'dailylog', color: '#22c55e', desc: 'Record your day' },
    { icon: '💬', label: 'Text Check',  page: 'text', color: '#f59e0b', desc: 'Analyze your feelings' },
    { icon: '📅', label: 'My Schedule', page: 'schedule', color: '#ef4444', desc: 'Check activity risks' },
  ]

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 20, padding: '32px', marginBottom: 28, color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {profile && (
            <div style={{ width: 70, height: 70, borderRadius: '50%', background: profile.avatarColor || '#7c83fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, flexShrink: 0 }}>
              {profile.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?'}
            </div>
          )}
          <div>
            <p style={{ color: '#7c83fd', fontSize: 13, marginBottom: 4 }}>{greeting()} 👋</p>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
              {profile?.name || user.name}
            </h1>
            {profile?.specialInterests && (
              <p style={{ color: '#aaa', fontSize: 13 }}>⭐ Interests: {profile.specialInterests}</p>
            )}
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ color: '#888', fontSize: 12 }}>{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</p>
            {todayMood ? (
              <div style={{ marginTop: 8 }}>
                <p style={{ color: '#22c55e', fontSize: 12, marginBottom: 4 }}>✅ Mood logged today!</p>
                <span style={{ fontSize: 32 }}>{MOODS[todayMood.mood]}</span>
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                <p style={{ color: '#f59e0b', fontSize: 12, marginBottom: 8 }}>⚠️ Mood not logged yet</p>
                <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => onNavigate('mood')}>
                  Log Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {quickActions.map(a => (
          <div key={a.page} onClick={() => onNavigate(a.page)}
            style={{ background: '#fff', borderRadius: 16, padding: '20px', cursor: 'pointer', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `2px solid transparent`, transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.border = `2px solid ${a.color}`}
            onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>{a.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 4 }}>{a.label}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{a.desc}</div>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>My Stats</h3>
      <div className="cards-grid" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="card-icon">😊</div>
          <div className="card-value">{moods.length}</div>
          <div className="card-label">Mood Entries</div>
        </div>
        <div className="card">
          <div className="card-icon">⚡</div>
          <div className="card-value">{dashboard?.totalBreakdowns ?? 0}</div>
          <div className="card-label">Breakdown Events</div>
        </div>
        <div className="card">
          <div className="card-icon">📅</div>
          <div className="card-value">{dashboard?.totalSchedules ?? 0}</div>
          <div className="card-label">Schedules Logged</div>
        </div>
        <div className="card">
          <div className="card-icon">✅</div>
          <div className="card-value">{dashboard?.routineAdherence ?? 0}%</div>
          <div className="card-label">Routine Adherence</div>
        </div>
      </div>

      {/* Recent Mood */}
      {moods.length > 0 && (
        <div className="form-card">
          <h3>😊 Recent Mood History</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            {moods.slice(0, 7).map(m => (
              <div key={m.id} style={{ textAlign: 'center', background: '#f9f9ff', borderRadius: 12, padding: '12px 16px', minWidth: 80 }}>
                <div style={{ fontSize: 28 }}>{MOODS[m.mood]}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{new Date(m.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}</div>
                <div style={{ fontSize: 11, color: '#7c83fd' }}>{ENERGY[m.energy]} energy</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calming Strategies if profile exists */}
      {profile?.calmingStrategies?.length > 0 && (
        <div className="form-card">
          <h3>🧘 Your Calming Strategies</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
            {profile.calmingStrategies.map(s => (
              <span key={s} style={{ background: '#f0fdf4', color: '#16a34a', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}