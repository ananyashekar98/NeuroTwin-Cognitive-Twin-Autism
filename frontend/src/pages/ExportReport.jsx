import { useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const API = 'http://localhost:5000/api'

export default function ExportReport({ user }) {

  const { t, i18n } = useTranslation()

// PDF always uses English labels (jsPDF doesn't support Indian fonts)
const PDF_LABELS = {
  appName: 'CognitiveTwin',
  exportTitle: 'AI-Based Behavioral Analysis Report',
  loggedInAs: 'Caregiver',
  patientProfileSection: 'Patient Profile',
  summaryStats: 'Summary Statistics',
  breakdownHistorySection: 'Breakdown History',
  scheduleRiskSection: 'Schedule Risk Analysis (ML Predictions)',
  moodHistorySection: 'Mood Tracking History',
  aiRecommendations: 'AI-Generated Recommendations',
  fullName: 'Name', age: 'Age', gender: 'Gender',
  supportLevel: 'ASD Support Level', school: 'School',
  therapistName: 'Therapist', communication: 'Communication',
  specialInterests: 'Special Interests',
  knownTriggers: 'Known Triggers',
  calmingStrategies: 'Calming Strategies',
  metric: 'Metric', value: 'Value',
  totalBreakdowns: 'Total Breakdowns',
  schedulesLogged: 'Schedules Logged',
  avgRiskScore: 'Avg Risk Score',
  routineAdherence: 'Routine Adherence',
  moodHistoryCount: 'Mood Entries',
  avgIntensity: 'Avg Breakdown Intensity',
  date: 'Date', trigger: 'Trigger',
  intensity: 'Intensity', duration: 'Duration',
  location: 'Location', mlRisk: 'ML Risk',
  activity: 'Activity', time: 'Time',
  type: 'Type', environment: 'Environment',
  mlRiskScore: 'ML Risk Score',
  moodTitle: 'Mood', energyLevel: 'Energy',
  sleepHours: 'Sleep', notes: 'Notes',
  confidentialReport: 'CognitiveTwin — AI-Based ASD Support System | Confidential Medical Report',
}
const p = (key) => PDF_LABELS[key] || key
  const [loading, setLoading]   = useState(false)
  const [generated, setGenerated] = useState(false)

  const generatePDF = async () => {
  setLoading(true)
  try {
    const [profileRes, dashRes, breakdownRes, scheduleRes, moodRes, recsRes] = await Promise.all([
      axios.get(`${API}/profile/${user.id}`).catch(() => ({ data: null })),
      axios.get(`${API}/dashboard/${user.id}`).catch(() => ({ data: {} })),
      axios.get(`${API}/breakdown/history/${user.id}`).catch(() => ({ data: [] })),
      axios.get(`${API}/schedule/${user.id}`).catch(() => ({ data: [] })),
      axios.get(`${API}/mood/history/${user.id}`).catch(() => ({ data: [] })),
      axios.get(`${API}/recommendations/${user.id}`).catch(() => ({ data: { suggestions:[] } })),
    ])

    const profile    = profileRes.data
    const dashboard  = dashRes.data
    const breakdowns = breakdownRes.data
    const schedules  = scheduleRes.data
    const moods      = moodRes.data
    const recs       = recsRes.data.suggestions || []

    const doc = new jsPDF()
    const pageW = doc.internal.pageSize.getWidth()
    let y = 0

    // Header
    doc.setFillColor(26,26,46)
    doc.rect(0,0,pageW,45,'F')
    doc.setTextColor(124,131,253)
    doc.setFontSize(22); doc.setFont('helvetica','bold')
    doc.text(p('appName'), 14, 18)
    doc.setTextColor(255,255,255); doc.setFontSize(12)
    doc.text(p('exportTitle'), 14, 28)
    doc.setFontSize(9); doc.setTextColor(180,180,180)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`, 14, 38)
    doc.text(`${p('loggedInAs')}: ${user.name}`, pageW-14, 38, { align:'right' })
    y = 55

    // Patient Profile
    doc.setTextColor(26,26,46); doc.setFontSize(14); doc.setFont('helvetica','bold')
    doc.text(p('patientProfileSection'), 14, y)
    doc.setDrawColor(124,131,253); doc.setLineWidth(0.5)
    doc.line(14, y+2, pageW-14, y+2); y += 10

    if (profile) {
      autoTable(doc, {
        startY: y,
        body: [
          [p('fullName'), profile.name||'—', p('age'), profile.age||'—'],
          [p('gender'), profile.gender||'—', p('supportLevel'), `Level ${profile.supportLevel||'—'}`],
          [p('school'), profile.school||'—', p('therapistName'), profile.therapist||'—'],
          [p('communication'), profile.communicationStyle||'—', p('specialInterests'), profile.specialInterests||'—'],
        ],
        theme:'grid',
        styles:{ fontSize:9, cellPadding:4 },
        columnStyles:{ 0:{fontStyle:'bold',fillColor:[240,244,255]}, 2:{fontStyle:'bold',fillColor:[240,244,255]} },
        margin:{ left:14, right:14 }
      })
      y = doc.lastAutoTable.finalY + 6
      if (profile.sensoryTriggers?.length) {
        doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(26,26,46)
        doc.text(`${p('knownTriggers')}:`, 14, y)
        doc.setFont('helvetica','normal'); doc.setTextColor(100,100,100)
        doc.text(profile.sensoryTriggers.join(', '), 50, y); y += 6
      }
      if (profile.calmingStrategies?.length) {
        doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(26,26,46)
        doc.text(`${p('calmingStrategies')}:`, 14, y)
        doc.setFont('helvetica','normal'); doc.setTextColor(100,100,100)
        doc.text(profile.calmingStrategies.join(', '), 55, y); y += 6
      }
    } else {
      doc.setFontSize(9); doc.setTextColor(150,150,150)
      doc.text('No profile data available.', 14, y); y += 8
    }
    y += 6

    // Summary Stats
    doc.setTextColor(26,26,46); doc.setFontSize(14); doc.setFont('helvetica','bold')
    doc.text(p('summaryStats'), 14, y)
    doc.setDrawColor(124,131,253); doc.line(14, y+2, pageW-14, y+2); y += 10
    autoTable(doc, {
      startY: y,
      head: [[p('metric'), p('value')]],
      body: [
        [p('totalBreakdowns'), dashboard.totalBreakdowns||0],
        [p('schedulesLogged'), dashboard.totalSchedules||0],
        [p('avgRiskScore'), `${dashboard.avgRiskScore||0}%`],
        [p('routineAdherence'), `${dashboard.routineAdherence||0}%`],
        [p('moodHistoryCount'), moods.length],
        [p('avgIntensity'), breakdowns.length ? (breakdowns.reduce((s,b)=>s+b.intensity,0)/breakdowns.length).toFixed(1) : '—'],
      ],
      theme:'striped',
      headStyles:{ fillColor:[26,26,46], textColor:[124,131,253], fontStyle:'bold' },
      styles:{ fontSize:10, cellPadding:5 },
      margin:{ left:14, right:14 }
    })
    y = doc.lastAutoTable.finalY + 10

    // Breakdown History
    if (breakdowns.length > 0) {
      if (y > 220) { doc.addPage(); y = 20 }
      doc.setTextColor(26,26,46); doc.setFontSize(14); doc.setFont('helvetica','bold')
      doc.text(p('breakdownHistorySection'), 14, y)
      doc.setDrawColor(239,68,68); doc.line(14, y+2, pageW-14, y+2); y += 10
      autoTable(doc, {
        startY: y,
        head: [[p('date'), p('trigger'), p('intensity'), p('duration'), p('location'), p('mlRisk')]],
        body: breakdowns.slice(0,15).map(b => [
          new Date(b.date).toLocaleDateString('en-IN'),
          b.trigger, `${b.intensity}/10`, `${b.duration} min`, b.location||'—', b.mlRiskCategory||'—'
        ]),
        theme:'striped',
        headStyles:{ fillColor:[239,68,68], textColor:255, fontStyle:'bold' },
        styles:{ fontSize:8, cellPadding:3 },
        margin:{ left:14, right:14 }
      })
      y = doc.lastAutoTable.finalY + 10
    }

    // Schedule Risk
    if (schedules.length > 0) {
      if (y > 220) { doc.addPage(); y = 20 }
      doc.setTextColor(26,26,46); doc.setFontSize(14); doc.setFont('helvetica','bold')
      doc.text(p('scheduleRiskSection'), 14, y)
      doc.setDrawColor(124,131,253); doc.line(14, y+2, pageW-14, y+2); y += 10
      autoTable(doc, {
        startY: y,
        head: [[p('activity'), p('time'), p('type'), p('environment'), p('mlRiskScore'), 'Category']],
        body: schedules.slice(0,15).map(s => [
          s.activity, s.time, s.type, s.environment, `${s.riskScore}%`, s.riskCategory||'—'
        ]),
        theme:'striped',
        headStyles:{ fillColor:[124,131,253], textColor:255, fontStyle:'bold' },
        styles:{ fontSize:8, cellPadding:3 },
        margin:{ left:14, right:14 }
      })
      y = doc.lastAutoTable.finalY + 10
    }

    // Mood History
    if (moods.length > 0) {
      if (y > 220) { doc.addPage(); y = 20 }
      doc.setTextColor(26,26,46); doc.setFontSize(14); doc.setFont('helvetica','bold')
      doc.text(p('moodHistorySection'), 14, y)
      doc.setDrawColor(34,197,94); doc.line(14, y+2, pageW-14, y+2); y += 10
      const moodLabels = ['','Very Sad','Sad','Neutral','Happy','Very Happy']
      const energyLabels = ['','Very Low','Low','Medium','High','Very High']
      autoTable(doc, {
        startY: y,
        head: [[p('date'), p('moodTitle'), p('energyLevel'), p('sleepHours'), p('notes')]],
        body: moods.slice(0,15).map(m => [
          new Date(m.date).toLocaleDateString('en-IN'),
          moodLabels[m.mood]||m.mood,
          energyLabels[m.energy]||m.energy,
          `${m.sleep} hrs`, m.notes||'—'
        ]),
        theme:'striped',
        headStyles:{ fillColor:[34,197,94], textColor:255, fontStyle:'bold' },
        styles:{ fontSize:8, cellPadding:3 },
        margin:{ left:14, right:14 }
      })
      y = doc.lastAutoTable.finalY + 10
    }

    // AI Recommendations
    if (y > 220) { doc.addPage(); y = 20 }
    doc.setTextColor(26,26,46); doc.setFontSize(14); doc.setFont('helvetica','bold')
    doc.text(p('aiRecommendations'), 14, y)
    doc.setDrawColor(245,158,11); doc.line(14, y+2, pageW-14, y+2); y += 10
    autoTable(doc, {
      startY: y,
      head: [['Category', 'Recommendation', 'Priority']],
      body: recs.map(r => [r.category, r.tip, r.priority.toUpperCase()]),
      theme:'striped',
      headStyles:{ fillColor:[245,158,11], textColor:255, fontStyle:'bold' },
      styles:{ fontSize:9, cellPadding:4 },
      columnStyles:{ 1:{ cellWidth:110 } },
      margin:{ left:14, right:14 }
    })

    // Footer
    const totalPages = doc.internal.getNumberOfPages()
    for (let i=1; i<=totalPages; i++) {
      doc.setPage(i)
      doc.setFillColor(240,244,255)
      doc.rect(0, doc.internal.pageSize.getHeight()-14, pageW, 14, 'F')
      doc.setFontSize(8); doc.setTextColor(150,150,150)
      doc.text(p('confidentialReport'), 14, doc.internal.pageSize.getHeight()-5)
      doc.text(`Page ${i} of ${totalPages}`, pageW-14, doc.internal.pageSize.getHeight()-5, { align:'right' })
    }

    const filename = `CognitiveTwin_Report_${profile?.name||user.name}_${new Date().toISOString().slice(0,10)}.pdf`
    doc.save(filename)
    setGenerated(true); setTimeout(() => setGenerated(false), 4000)
  } catch (err) { console.error(err) }
  setLoading(false)
}
  const sections = [
    { icon:'👤', titleKey:'patientProfileSection', descKey:'patientProfileDesc' },
    { icon:'📊', titleKey:'summaryStats',           descKey:'summaryStatsDesc' },
    { icon:'⚡', titleKey:'breakdownHistorySection', descKey:'breakdownHistoryDesc' },
    { icon:'📅', titleKey:'scheduleRiskSection',    descKey:'scheduleRiskDesc' },
    { icon:'😊', titleKey:'moodHistorySection',     descKey:'moodHistoryDesc' },
    { icon:'💡', titleKey:'aiRecommendations',      descKey:'aiRecommendationsDesc' },
  ]

  return (
    <div>
      <div className="page-header">
        <h1>📄 {t('exportTitle')}</h1>
        <p>{t('exportSubtitle')}</p>
      </div>
      {generated && <div className="alert alert-success" style={{ marginBottom:24 }}>{t('pdfSuccess')}</div>}

      <div className="form-card">
        <h3>{t('reportContents')}</h3>
        <p style={{ color:'#666', fontSize:14, marginBottom:20 }}>{t('exportSubtitle')}</p>
        {sections.map((s,i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 0', borderBottom:'1px solid #f0f0f0' }}>
            <span style={{ fontSize:24 }}>{s.icon}</span>
            <div>
              <p style={{ fontWeight:600, fontSize:14, marginBottom:3 }}>{t(s.titleKey)}</p>
              <p style={{ fontSize:13, color:'#888' }}>{t(s.descKey)}</p>
            </div>
            <span style={{ marginLeft:'auto', color:'#22c55e', fontWeight:700, fontSize:13 }}>{t('included')}</span>
          </div>
        ))}
      </div>

      <div className="form-card" style={{ textAlign:'center', padding:40 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>📄</div>
        <h3 style={{ fontSize:20, marginBottom:8 }}>{t('readyToGenerate')}</h3>
        <p style={{ color:'#888', fontSize:14, marginBottom:28 }}>{t('pdfReady')}</p>
        <button className="btn btn-primary" style={{ padding:'16px 48px', fontSize:16 }} onClick={generatePDF} disabled={loading}>
          {loading ? t('generating') : t('downloadPDF')}
        </button>
      </div>
    </div>
  )
}