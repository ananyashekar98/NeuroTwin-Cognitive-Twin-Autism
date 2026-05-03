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
import ModelTraining from './pages/ModelTraining'
import PatientSelector from './pages/PatientSelector'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './components/LanguageSwitcher'
import DarkModeToggle from './components/DarkModeToggle'
import NotificationBell from './components/NotificationBell'

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
  { id: 'training',        label: 'ML Training',     icon: '🤖' },
  { id: 'export',          label: 'exportReport',    icon: '📄' },
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
  const [user, setUser]                   = useState(null)
  const [page, setPage]                   = useState(null)
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const { t } = useTranslation()

  const handleLogin = (userData) => {
    setUser(userData)
    if (userData.role === 'patient') {
      setPage('patienthome')
    } else {
      // Caregiver/therapist → show patient selector first
      setPage('__select_patient__')
    }
  }

  if (!user) return <Login onLogin={handleLogin} />

  const isCaregiver = user.role === 'caregiver' || user.role === 'therapist'

  // ── Show patient selector for caregiver/therapist ─────────
  if (isCaregiver && page === '__select_patient__') {
    return (
      <PatientSelector
        caregiver={user}
        onSelectPatient={(patient) => {
          setSelectedPatient(patient)
          setPage('dashboard')
        }}
      />
    )
  }

  const NAV       = isCaregiver ? CAREGIVER_NAV : PATIENT_NAV
  const roleColor = isCaregiver ? '#7c83fd' : '#22c55e'
  const roleBadge = isCaregiver ? `🩺 ${user.role}` : '🧑 Patient'

  // Active patient ID — use selected patient for caregiver, user.id for patient
  const activePatientId = isCaregiver && selectedPatient ? selectedPatient.id : user.id
  const activeUser      = isCaregiver && selectedPatient
    ? { ...user, id: selectedPatient.id, patientName: selectedPatient.name }
    : user

  const navigate = (id) => { setPage(id); setSidebarOpen(false) }

  const pages = {
    dashboard:       <Dashboard user={activeUser} />,
    patienthome:     <PatientHome user={activeUser} onNavigate={navigate} />,
    profile:         <Profile user={activeUser} />,
    mood:            <MoodTracker user={activeUser} />,
    schedule:        <Schedule user={activeUser} />,
    breakdown:       <Breakdown user={activeUser} />,
    text:            <TextAnalyzer />,
    recommendations: <Recommendations user={activeUser} />,
    dailylog:        <DailyLog user={activeUser} />,
    export:          <ExportReport user={activeUser} />,
    reportcard:      <ReportCard user={activeUser} />,
    training:        <ModelTraining user={activeUser} />,
  }

  return (
    <div className="app">
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? '✕' : '☰'}
      </button>
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>🧠 {t('appName')}</h2>
          <p>{t('appSubtitle')}</p>
        </div>

        {/* Selected patient indicator */}
        {isCaregiver && selectedPatient && (
          <div style={{ margin:'0 12px 4px', background:'rgba(124,131,253,0.15)', borderRadius:10, padding:'10px 12px' }}>
            <p style={{ color:'#888', fontSize:10, marginBottom:4 }}>VIEWING PATIENT</p>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:selectedPatient.avatarColor||'#7c83fd', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {selectedPatient.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div>
                <p style={{ color:'#fff', fontSize:13, fontWeight:600 }}>{selectedPatient.name}</p>
                <p style={{ color:'#888', fontSize:11 }}>Age {selectedPatient.age} · Level {selectedPatient.supportLevel}</p>
              </div>
            </div>
            <button
              onClick={() => { setSelectedPatient(null); setPage('__select_patient__') }}
              style={{ width:'100%', marginTop:8, padding:'5px', borderRadius:8, border:'none', background:'rgba(255,255,255,0.1)', color:'#aaa', fontSize:11, cursor:'pointer' }}>
              ← Switch Patient
            </button>
          </div>
        )}

        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => navigate(n.id)}>
              <span className="nav-icon">{n.icon}</span>{t(n.label)}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:10, padding:'8px 12px', flex:1, marginRight:8 }}>
              <p style={{ color:'#888', fontSize:11, marginBottom:2 }}>{t('loggedInAs')}</p>
              <p style={{ color:'#fff', fontSize:13, fontWeight:600 }}>{user.name}</p>
              <span style={{ background:roleColor, color:'#fff', fontSize:10, padding:'2px 8px', borderRadius:10, fontWeight:600 }}>{roleBadge}</span>
            </div>
            <NotificationBell user={activeUser} />
          </div>
          <DarkModeToggle />
          <button className="btn btn-danger" style={{ width:'100%', fontSize:'13px', marginBottom:10 }}
            onClick={() => { setUser(null); setPage(null); setSelectedPatient(null) }}>
            {t('logout')}
          </button>
          <LanguageSwitcher />
        </div>
      </aside>

      <main className="main-content">{pages[page]}</main>
    </div>
  )
}