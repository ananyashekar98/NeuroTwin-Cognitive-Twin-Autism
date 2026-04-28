import { useState } from 'react'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const API = 'http://localhost:5000/api'

export default function ExportReport({ user }) {
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  const generatePDF = async () => {
    setLoading(true)
    try {
      // Fetch all data
      const [profileRes, dashRes, breakdownRes, scheduleRes, moodRes] = await Promise.all([
        axios.get(`${API}/profile/${user.id}`).catch(() => ({ data: null })),
        axios.get(`${API}/dashboard/${user.id}`).catch(() => ({ data: {} })),
        axios.get(`${API}/breakdown/history/${user.id}`).catch(() => ({ data: [] })),
        axios.get(`${API}/schedule/${user.id}`).catch(() => ({ data: [] })),
        axios.get(`${API}/mood/history/${user.id}`).catch(() => ({ data: [] })),
      ])

      const profile   = profileRes.data
      const dashboard = dashRes.data
      const breakdowns = breakdownRes.data
      const schedules  = scheduleRes.data
      const moods      = moodRes.data

      const doc = new jsPDF()
      const pageW = doc.internal.pageSize.getWidth()
      let y = 0

      // ── Header ──────────────────────────────────────────────────
      doc.setFillColor(26, 26, 46)
      doc.rect(0, 0, pageW, 45, 'F')
      doc.setTextColor(124, 131, 253)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('CognitiveTwin ASD', 14, 18)
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.text('AI-Based Behavioral Analysis Report', 14, 28)
      doc.setFontSize(9)
      doc.setTextColor(180, 180, 180)
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`, 14, 38)
      doc.text(`Caregiver: ${user.name}`, pageW - 14, 38, { align: 'right' })

      y = 55

      // ── Patient Profile ─────────────────────────────────────────
      doc.setTextColor(26, 26, 46)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Patient Profile', 14, y)
      doc.setDrawColor(124, 131, 253)
      doc.setLineWidth(0.5)
      doc.line(14, y + 2, pageW - 14, y + 2)
      y += 10

      if (profile) {
        const profileData = [
          ['Name', profile.name || '—', 'Age', profile.age || '—'],
          ['Gender', profile.gender || '—', 'ASD Support Level', `Level ${profile.supportLevel || '—'}`],
          ['School', profile.school || '—', 'Therapist', profile.therapist || '—'],
          ['Communication', profile.communicationStyle || '—', 'Special Interests', profile.specialInterests || '—'],
        ]
        autoTable(doc, {
          startY: y,
          body: profileData,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 4 },
          columnStyles: { 0: { fontStyle:'bold', fillColor:[240,244,255] }, 2: { fontStyle:'bold', fillColor:[240,244,255] } },
          margin: { left: 14, right: 14 }
        })
        y = doc.lastAutoTable.finalY + 6

        if (profile.sensoryTriggers?.length) {
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(26,26,46)
          doc.text('Known Triggers:', 14, y)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(100,100,100)
          doc.text(profile.sensoryTriggers.join(', '), 50, y)
          y += 6
        }
        if (profile.calmingStrategies?.length) {
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(26,26,46)
          doc.text('Calming Strategies:', 14, y)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(100,100,100)
          doc.text(profile.calmingStrategies.join(', '), 55, y)
          y += 6
        }
      } else {
        doc.setFontSize(9)
        doc.setTextColor(150,150,150)
        doc.text('No profile data available. Please fill in Patient Profile.', 14, y)
        y += 8
      }

      y += 6

      // ── Summary Statistics ───────────────────────────────────────
      doc.setTextColor(26,26,46)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Summary Statistics', 14, y)
      doc.setDrawColor(124,131,253)
      doc.line(14, y+2, pageW-14, y+2)
      y += 10

      autoTable(doc, {
        startY: y,
        head: [['Metric', 'Value']],
        body: [
          ['Total Breakdowns Logged', dashboard.totalBreakdowns || 0],
          ['Total Schedules Logged',  dashboard.totalSchedules  || 0],
          ['Average ML Risk Score',   `${dashboard.avgRiskScore || 0}%`],
          ['Routine Adherence',       `${dashboard.routineAdherence || 0}%`],
          ['Total Mood Entries',      moods.length],
          ['Average Breakdown Intensity', breakdowns.length ? (breakdowns.reduce((s,b) => s+b.intensity,0)/breakdowns.length).toFixed(1) : '—'],
        ],
        theme: 'striped',
        headStyles: { fillColor:[26,26,46], textColor:[124,131,253], fontStyle:'bold' },
        styles: { fontSize: 10, cellPadding: 5 },
        margin: { left:14, right:14 }
      })
      y = doc.lastAutoTable.finalY + 10

      // ── Breakdown History ────────────────────────────────────────
      if (breakdowns.length > 0) {
        if (y > 220) { doc.addPage(); y = 20 }
        doc.setTextColor(26,26,46)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Breakdown History', 14, y)
        doc.setDrawColor(239,68,68)
        doc.line(14, y+2, pageW-14, y+2)
        y += 10

        autoTable(doc, {
          startY: y,
          head: [['Date', 'Trigger', 'Intensity', 'Duration', 'Location', 'ML Risk']],
          body: breakdowns.slice(0,15).map(b => [
            new Date(b.date).toLocaleDateString(),
            b.trigger,
            `${b.intensity}/10`,
            `${b.duration} min`,
            b.location || '—',
            b.mlRiskCategory || '—'
          ]),
          theme: 'striped',
          headStyles: { fillColor:[239,68,68], textColor:255, fontStyle:'bold' },
          styles: { fontSize: 8, cellPadding: 3 },
          margin: { left:14, right:14 }
        })
        y = doc.lastAutoTable.finalY + 10
      }

      // ── Schedule Risk ────────────────────────────────────────────
      if (schedules.length > 0) {
        if (y > 220) { doc.addPage(); y = 20 }
        doc.setTextColor(26,26,46)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Schedule Risk Analysis (ML Predictions)', 14, y)
        doc.setDrawColor(124,131,253)
        doc.line(14, y+2, pageW-14, y+2)
        y += 10

        autoTable(doc, {
          startY: y,
          head: [['Activity', 'Time', 'Type', 'Environment', 'ML Risk Score', 'Category']],
          body: schedules.slice(0,15).map(s => [
            s.activity,
            s.time,
            s.type,
            s.environment,
            `${s.riskScore}%`,
            s.riskCategory || '—'
          ]),
          theme: 'striped',
          headStyles: { fillColor:[124,131,253], textColor:255, fontStyle:'bold' },
          styles: { fontSize: 8, cellPadding: 3 },
          margin: { left:14, right:14 }
        })
        y = doc.lastAutoTable.finalY + 10
      }

      // ── Mood History ─────────────────────────────────────────────
      if (moods.length > 0) {
        if (y > 220) { doc.addPage(); y = 20 }
        doc.setTextColor(26,26,46)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Mood Tracking History', 14, y)
        doc.setDrawColor(34,197,94)
        doc.line(14, y+2, pageW-14, y+2)
        y += 10

        const moodLabels = ['','Very Sad','Sad','Neutral','Happy','Very Happy']
        const energyLabels = ['','Very Low','Low','Medium','High','Very High']

        autoTable(doc, {
          startY: y,
          head: [['Date', 'Mood', 'Energy', 'Sleep Hours', 'Notes']],
          body: moods.slice(0,15).map(m => [
            new Date(m.date).toLocaleDateString(),
            moodLabels[m.mood] || m.mood,
            energyLabels[m.energy] || m.energy,
            `${m.sleep} hrs`,
            m.notes || '—'
          ]),
          theme: 'striped',
          headStyles: { fillColor:[34,197,94], textColor:255, fontStyle:'bold' },
          styles: { fontSize: 8, cellPadding: 3 },
          margin: { left:14, right:14 }
        })
        y = doc.lastAutoTable.finalY + 10
      }

      // ── AI Recommendations ───────────────────────────────────────
      if (y > 220) { doc.addPage(); y = 20 }
      doc.setTextColor(26,26,46)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('AI-Generated Recommendations', 14, y)
      doc.setDrawColor(245,158,11)
      doc.line(14, y+2, pageW-14, y+2)
      y += 10

      const recsRes = await axios.get(`${API}/recommendations/${user.id}`).catch(() => ({ data: { suggestions:[] } }))
      const recs = recsRes.data.suggestions || []

      autoTable(doc, {
        startY: y,
        head: [['Category', 'Recommendation', 'Priority']],
        body: recs.map(r => [r.category, r.tip, r.priority.toUpperCase()]),
        theme: 'striped',
        headStyles: { fillColor:[245,158,11], textColor:255, fontStyle:'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 1: { cellWidth: 110 } },
        margin: { left:14, right:14 }
      })

      // ── Footer on every page ─────────────────────────────────────
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFillColor(240,244,255)
        doc.rect(0, doc.internal.pageSize.getHeight()-14, pageW, 14, 'F')
        doc.setFontSize(8)
        doc.setTextColor(150,150,150)
        doc.text('CognitiveTwin — AI-Based ASD Support System | Confidential Medical Report', 14, doc.internal.pageSize.getHeight()-5)
        doc.text(`Page ${i} of ${totalPages}`, pageW-14, doc.internal.pageSize.getHeight()-5, { align:'right' })
      }

      // Save PDF
      const filename = `CognitiveTwin_Report_${profile?.name || user.name}_${new Date().toISOString().slice(0,10)}.pdf`
      doc.save(filename)
      setGenerated(true)
      setTimeout(() => setGenerated(false), 4000)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <h1>📄 Export Patient Report</h1>
        <p>Generate a complete PDF report with all patient data and AI insights</p>
      </div>

      {generated && <div className="alert alert-success" style={{ marginBottom: 24 }}>✅ PDF downloaded successfully!</div>}

      <div className="form-card">
        <h3>📋 Report Contents</h3>
        <p style={{ color:'#666', fontSize:14, marginBottom:20 }}>The PDF report will include all of the following sections:</p>

        {[
          { icon:'👤', title:'Patient Profile', desc:'Name, age, support level, triggers, calming strategies' },
          { icon:'📊', title:'Summary Statistics', desc:'Total breakdowns, avg risk score, routine adherence' },
          { icon:'⚡', title:'Breakdown History', desc:'All logged breakdown events with ML risk categories' },
          { icon:'📅', title:'Schedule Risk Analysis', desc:'ML-predicted risk scores for all activities' },
          { icon:'😊', title:'Mood Tracking History', desc:'Daily mood, energy and sleep patterns' },
          { icon:'💡', title:'AI Recommendations', desc:'Personalized strategies based on behavioral patterns' },
        ].map((item, i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 0', borderBottom:'1px solid #f0f0f0' }}>
            <span style={{ fontSize:24 }}>{item.icon}</span>
            <div>
              <p style={{ fontWeight:600, fontSize:14, marginBottom:3 }}>{item.title}</p>
              <p style={{ fontSize:13, color:'#888' }}>{item.desc}</p>
            </div>
            <span style={{ marginLeft:'auto', color:'#22c55e', fontWeight:700, fontSize:13 }}>✓ Included</span>
          </div>
        ))}
      </div>

      <div className="form-card" style={{ textAlign:'center', padding:40 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>📄</div>
        <h3 style={{ fontSize:20, marginBottom:8 }}>Ready to Generate</h3>
        <p style={{ color:'#888', fontSize:14, marginBottom:28 }}>
          This will create a professional PDF report with all patient data,<br />
          ML predictions and AI-generated recommendations.
        </p>
        <button className="btn btn-primary" style={{ padding:'16px 48px', fontSize:16 }} onClick={generatePDF} disabled={loading}>
          {loading ? '⏳ Generating PDF...' : '📥 Download PDF Report'}
        </button>
      </div>
    </div>
  )
}