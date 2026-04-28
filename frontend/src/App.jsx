import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import Breakdown from './pages/Breakdown'
import Recommendations from './pages/Recommendations'
import TextAnalyzer from './pages/TextAnalyzer'
import Profile from './pages/Profile'
import MoodTracker from './pages/MoodTracker'
import DailyLog from './pages/DailyLog'
import ExportReport from './pages/ExportReport'
import PatientHome from './pages/PatientHome'

const CAREGIVER_NAV = [
  { id: 'dashboard',       label: 'Dashboard',      icon: '🏠' },
  { id: 'profile',         label: 'Patient Profile', icon: '👤' },
  { id: 'mood',            label: 'Mood Tracker',    icon: '😊' },
  { id: 'schedule',        label: 'Schedule Risk',   icon: '📅' },
  { id: 'breakdown',       label: 'Breakdown Log',   icon: '⚡' },
  { id: 'text',            label: 'Text Analyzer',   icon: '💬' },
  { id: 'recommendations', label: 'Recommendations', icon: '💡' },
  { id: 'dailylog',        label: 'Daily Log',       icon: '📓' },
  { id: 'export',          label: 'Export Report',   icon: '📄' },
]

const PATIENT_NAV = [
  { id: 'patienthome',     label: 'My Home',         icon: '🏠' },
  { id: 'mood',            label: 'Mood Tracker',    icon: '😊' },
  { id: 'dailylog',        label: 'Daily Log',       icon: '📓' },
  { id: 'text',            label: 'Text Analyzer',   icon: '💬' },
  { id: 'schedule',        label: 'Schedule Risk',   icon: '📅' },
  { id: 'breakdown',       label: 'Breakdown Log',   icon: '⚡' },
  { id: 'recommendations', label: 'Recommendations', icon: '💡' },
  { id: 'profile',         label: 'My Profile',      icon: '👤' },
  { id: 'export',          label: 'Export Report',   icon: '📄' },
]

export default function App() {
  const [user, setUser]       = useState(null)
  const [page, setPage]       = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogin = (userData) => {
    setUser(userData)
    setPage(userData.role === 'caregiver' || userData.role === 'therapist' ? 'dashboard' : 'patienthome')
  }

  if (!user) return <Login onLogin={handleLogin} />

  const isCaregiver = user.role === 'caregiver' || user.role === 'therapist'
  const NAV = isCaregiver ? CAREGIVER_NAV : PATIENT_NAV
  const roleColor = isCaregiver ? '#7c83fd' : '#22c55e'
  const roleBadge = isCaregiver ? `🩺 ${user.role}` : '🧑 Patient'

  const navigate = (id) => { setPage(id); setSidebarOpen(false) }

  const pages = {
    dashboard:       <Dashboard user={user} />,
    patienthome:     <PatientHome user={user} onNavigate={navigate} />,
    profile:         <Profile user={user} />,
    mood:            <MoodTracker user={user} />,
    schedule:        <Schedule user={user} />,
    breakdown:       <Breakdown user={user} />,
    text:            <TextAnalyzer />,
    recommendations: <Recommendations user={user} />,
    dailylog:        <DailyLog user={user} />,
    export:          <ExportReport user={user} />,
  }

  return (
    <div className="app">
      {/* Mobile hamburger */}
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>🧠 CognitiveTwin</h2>
          <p>ASD Support System</p>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? 'active' : ''}`}
              onClick={() => navigate(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
            <p style={{ color: '#888', fontSize: 11, marginBottom: 3 }}>Logged in as</p>
            <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{user.name}</p>
            <span style={{ background: roleColor, color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{roleBadge}</span>
          </div>
          <button className="btn btn-danger" style={{ width: '100%', fontSize: '13px' }}
            onClick={() => { setUser(null); setPage(null) }}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {pages[page]}
      </main>
    </div>
  )
}