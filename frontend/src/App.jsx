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
import ReportCard from './pages/ReportCard'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './components/LanguageSwitcher'
import DarkModeToggle from './components/DarkModeToggle'
import NotificationBell from './components/NotificationBell'
import ModelTraining from './pages/ModelTraining'

const CAREGIVER_NAV = [
  { id: 'dashboard',       label: 'dashboard',       icon: '🏠' },
  { id: 'profile',         label: 'patientProfile',  icon: '👤' },
  { id: 'mood',            label: 'moodTracker',     icon: '😊' },
  { id: 'schedule',        label: 'scheduleRisk',    icon: '📅' },
  { id: 'breakdown',       label: 'breakdownLog',    icon: '⚡' },
  { id: 'text',            label: 'textAnalyzer',    icon: '💬' },
  { id: 'recommendations', label: 'recommendations', icon: '💡' },
  { id: 'dailylog',        label: 'dailyLog',        icon: '📓' },
  { id: 'reportcard',      label: 'Report Card',     icon: '📊' },
  { id: 'export',          label: 'exportReport',    icon: '📄' },
  { id: 'training', label: 'ML Training', icon: '🤖' },
]

const PATIENT_NAV = [
  { id: 'patienthome',     label: 'myHome',          icon: '🏠' },
  { id: 'mood',            label: 'moodTracker',     icon: '😊' },
  { id: 'dailylog',        label: 'dailyLog',        icon: '📓' },
  { id: 'text',            label: 'textAnalyzer',    icon: '💬' },
  { id: 'schedule',        label: 'scheduleRisk',    icon: '📅' },
  { id: 'breakdown',       label: 'breakdownLog',    icon: '⚡' },
  { id: 'recommendations', label: 'recommendations', icon: '💡' },
  { id: 'reportcard',      label: 'Report Card',     icon: '📊' },
  { id: 'profile',         label: 'myProfile',       icon: '👤' },
  { id: 'export',          label: 'exportReport',    icon: '📄' },
]

export default function App() {
  const [user, setUser]               = useState(null)
  const [page, setPage]               = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { t } = useTranslation()

  const handleLogin = (userData) => {
    setUser(userData)
    setPage(userData.role === 'caregiver' || userData.role === 'therapist' ? 'dashboard' : 'patienthome')
  }

  if (!user) return <Login onLogin={handleLogin} />

  const isCaregiver = user.role === 'caregiver' || user.role === 'therapist'
  const NAV         = isCaregiver ? CAREGIVER_NAV : PATIENT_NAV
  const roleColor   = isCaregiver ? '#7c83fd' : '#22c55e'
  const roleBadge   = isCaregiver ? `🩺 ${user.role}` : '🧑 Patient'

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
    reportcard:      <ReportCard user={user} />,
    training: <ModelTraining user={user} />,
  }

  return (
    <div className="app">

      {/* Mobile hamburger */}
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>

        <div className="sidebar-logo">
          <h2>🧠 {t('appName')}</h2>
          <p>{t('appSubtitle')}</p>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? 'active' : ''}`}
              onClick={() => navigate(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              {t(n.label)}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* User info + notification bell */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:10, padding:'8px 12px', flex:1, marginRight:8 }}>
              <p style={{ color:'#888', fontSize:11, marginBottom:2 }}>{t('loggedInAs')}</p>
              <p style={{ color:'#fff', fontSize:13, fontWeight:600 }}>{user.name}</p>
              <span style={{ background:roleColor, color:'#fff', fontSize:10, padding:'2px 8px', borderRadius:10, fontWeight:600 }}>
                {roleBadge}
              </span>
            </div>
            <NotificationBell user={user} />
          </div>

          {/* Dark mode toggle */}
          <DarkModeToggle />

          {/* Logout */}
          <button
            className="btn btn-danger"
            style={{ width:'100%', fontSize:'13px', marginBottom:10 }}
            onClick={() => { setUser(null); setPage(null) }}>
            {t('logout')}
          </button>

          {/* Language switcher */}
          <LanguageSwitcher />
        </div>

      </aside>

      <main className="main-content">
        {pages[page]}
      </main>

    </div>
  )
}