import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import Breakdown from './pages/Breakdown'
import Recommendations from './pages/Recommendations'
import TextAnalyzer from './pages/TextAnalyzer'
import Profile from './pages/Profile'

const NAV = [
  { id: 'dashboard',       label: 'Dashboard',      icon: '🏠' },
  { id: 'profile',         label: 'Patient Profile', icon: '👤' },
  { id: 'schedule',        label: 'Schedule Risk',   icon: '📅' },
  { id: 'breakdown',       label: 'Breakdown Log',   icon: '⚡' },
  { id: 'text',            label: 'Text Analyzer',   icon: '💬' },
  { id: 'recommendations', label: 'Recommendations', icon: '💡' },
]

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('dashboard')

  if (!user) return <Login onLogin={setUser} />

  const pages = {
    dashboard:       <Dashboard user={user} />,
    profile:         <Profile   user={user} />,
    schedule:        <Schedule  user={user} />,
    breakdown:       <Breakdown user={user} />,
    text:            <TextAnalyzer />,
    recommendations: <Recommendations user={user} />,
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>🧠 CognitiveTwin</h2>
          <p>ASD Support System</p>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? 'active' : ''}`}
              onClick={() => setPage(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '24px' }}>
          <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Logged in as</p>
          <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{user.name}</p>
          <button
            className="btn btn-danger"
            style={{ marginTop: '12px', width: '100%', fontSize: '13px' }}
            onClick={() => setUser(null)}
          >Logout</button>
        </div>
      </aside>
      <main className="main-content">
        {pages[page]}
      </main>
    </div>
  )
}