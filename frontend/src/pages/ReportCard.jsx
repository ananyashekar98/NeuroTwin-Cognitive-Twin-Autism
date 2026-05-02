import { useEffect, useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts'

const API = 'http://localhost:5000/api'

export default function ReportCard({ user }) {
  const { t } = useTranslation()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [breakdownRes, moodRes, scheduleRes, dailyRes] = await Promise.all([
          axios.get(`${API}/breakdown/history/${user.id}`),
          axios.get(`${API}/mood/history/${user.id}`),
          axios.get(`${API}/schedule/${user.id}`),
          axios.get(`${API}/dailylog/history/${user.id}`),
        ])

        const breakdowns = breakdownRes.data
        const moods      = moodRes.data
        const schedules  = scheduleRes.data
        const dailylogs  = dailyRes.data

        // Last 7 days filter
        const last7 = (arr) => arr.filter(x => (new Date() - new Date(x.date)) / (1000*60*60*24) <= 7)
        const bd7  = last7(breakdowns)
        const md7  = last7(moods)
        const sc7  = last7(schedules)
        const dl7  = last7(dailylogs)

        // ── Score calculations ──────────────────────────────
        // Mood Score (0-100): avg mood value * 20
        const avgMood = md7.length ? md7.reduce((s,m) => s+m.mood, 0)/md7.length : 0
        const moodScore = Math.round(avgMood * 20)

        // Sleep Score (0-100): optimal is 8hrs
        const avgSleep = md7.length ? md7.reduce((s,m) => s+m.sleep, 0)/md7.length : 0
        const sleepScore = Math.round(Math.max(0, 100 - Math.abs(avgSleep-8)*10))

        // Breakdown Score (0-100): fewer = better
        const bdScore = Math.max(0, 100 - (bd7.length * 15) - (bd7.reduce((s,b) => s+b.intensity,0)/Math.max(bd7.length,1))*3)

        // Routine Score (0-100): based on daily logs
        const routineScore = Math.min(100, dl7.length * 14)

        // Schedule Risk Score (0-100): lower risk = better
        const avgRisk = sc7.length ? sc7.reduce((s,sc) => s+sc.riskScore,0)/sc7.length : 50
        const scheduleScore = Math.round(100 - avgRisk)

        // Energy Score (0-100)
        const avgEnergy = md7.length ? md7.reduce((s,m) => s+m.energy,0)/md7.length : 0
        const energyScore = Math.round(avgEnergy * 20)

        // Overall Score
        const overall = Math.round((moodScore + sleepScore + bdScore + routineScore + scheduleScore + energyScore) / 6)

        // Grade
        const grade = overall >= 85 ? 'A+' : overall >= 75 ? 'A' : overall >= 65 ? 'B+' : overall >= 55 ? 'B' : overall >= 45 ? 'C+' : overall >= 35 ? 'C' : 'D'
        const gradeColor = overall >= 75 ? '#22c55e' : overall >= 55 ? '#f59e0b' : '#ef4444'
        const gradeMsg = overall >= 85 ? 'Excellent week! 🌟' : overall >= 75 ? 'Great progress! 🎉' : overall >= 55 ? 'Good effort! Keep going 💪' : overall >= 35 ? 'Needs improvement 📈' : 'Extra support needed 💙'

        const radarData = [
          { subject:'Mood',     score: moodScore },
          { subject:'Sleep',    score: sleepScore },
          { subject:'Calm',     score: Math.round(bdScore) },
          { subject:'Routine',  score: routineScore },
          { subject:'Schedule', score: scheduleScore },
          { subject:'Energy',   score: energyScore },
        ]

        // Insights
        const insights = []
        if (moodScore >= 70) insights.push({ icon:'😊', text:'Mood has been positive this week', type:'good' })
        else insights.push({ icon:'😔', text:'Mood has been lower than usual', type:'concern' })
        if (bd7.length === 0) insights.push({ icon:'✅', text:'No breakdown events this week!', type:'good' })
        else if (bd7.length >= 3) insights.push({ icon:'⚠️', text:`${bd7.length} breakdown events this week`, type:'concern' })
        if (avgSleep >= 7 && avgSleep <= 9) insights.push({ icon:'😴', text:`Good sleep average of ${avgSleep.toFixed(1)} hours`, type:'good' })
        else if (avgSleep < 6) insights.push({ icon:'⚠️', text:`Low sleep average of ${avgSleep.toFixed(1)} hours`, type:'concern' })
        if (dl7.length >= 5) insights.push({ icon:'📓', text:'Excellent daily log consistency!', type:'good' })
        else insights.push({ icon:'📝', text:'Try to log daily observations more regularly', type:'tip' })

        setData({ moodScore, sleepScore, bdScore: Math.round(bdScore), routineScore, scheduleScore, energyScore, overall, grade, gradeColor, gradeMsg, radarData, insights, stats: { moods: md7.length, breakdowns: bd7.length, logs: dl7.length, avgSleep: avgSleep.toFixed(1) } })
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    fetch()
  }, [user.id])

  if (loading) return <div className="alert alert-info">⏳ Calculating your weekly report card...</div>

  const scores = [
    { label:'😊 Mood',      score: data.moodScore,     color:'#7c83fd' },
    { label:'😴 Sleep',     score: data.sleepScore,    color:'#06b6d4' },
    { label:'⚡ Calm',      score: data.bdScore,       color:'#22c55e' },
    { label:'📓 Routine',   score: data.routineScore,  color:'#f59e0b' },
    { label:'📅 Schedule',  score: data.scheduleScore, color:'#8b5cf6' },
    { label:'🔋 Energy',    score: data.energyScore,   color:'#ec4899' },
  ]

  return (
    <div>
      <div className="page-header">
        <h1>📊 Weekly Progress Report Card</h1>
        <p>AI-generated weekly summary based on all logged data</p>
      </div>

      {/* Main grade card */}
      <div style={{ background:'linear-gradient(135deg,#1a1a2e,#16213e)', borderRadius:24, padding:'36px', marginBottom:24, textAlign:'center', color:'#fff' }}>
        <p style={{ color:'#888', fontSize:13, marginBottom:8 }}>WEEK OF {new Date().toLocaleDateString('en-IN', { month:'long', day:'numeric' })}</p>
        <div style={{ fontSize:90, fontWeight:900, color:data.gradeColor, lineHeight:1, marginBottom:8 }}>{data.grade}</div>
        <div style={{ fontSize:36, fontWeight:700, color:'#fff', marginBottom:6 }}>{data.overall}%</div>
        <div style={{ fontSize:18, color:'#aaa' }}>{data.gradeMsg}</div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginTop:28 }}>
          {[
            { label:'Mood Entries', value:data.stats.moods, icon:'😊' },
            { label:'Breakdowns', value:data.stats.breakdowns, icon:'⚡' },
            { label:'Daily Logs', value:data.stats.logs, icon:'📓' },
            { label:'Avg Sleep', value:`${data.stats.avgSleep}h`, icon:'😴' },
          ].map((s,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.05)', borderRadius:12, padding:'14px' }}>
              <div style={{ fontSize:24 }}>{s.icon}</div>
              <div style={{ fontSize:22, fontWeight:700, color:'#fff', marginTop:4 }}>{s.value}</div>
              <div style={{ fontSize:11, color:'#888', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>

        {/* Score breakdown */}
        <div className="form-card" style={{ margin:0 }}>
          <h3 style={{ marginBottom:20 }}>📈 Score Breakdown</h3>
          {scores.map(s => (
            <div key={s.label} style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13, fontWeight:600 }}>{s.label}</span>
                <span style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.score}%</span>
              </div>
              <div style={{ background:'#f3f4f6', borderRadius:8, height:10 }}>
                <div style={{ width:`${s.score}%`, background:s.color, height:10, borderRadius:8, transition:'width 0.8s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Radar chart */}
        <div className="form-card" style={{ margin:0 }}>
          <h3 style={{ marginBottom:16 }}>🕸️ Wellness Radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={data.radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize:12 }} />
              <PolarRadiusAxis domain={[0,100]} tick={{ fontSize:10 }} />
              <Radar name="Score" dataKey="score" stroke="#7c83fd" fill="#7c83fd" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="form-card">
        <h3 style={{ marginBottom:16 }}>💡 Weekly Insights</h3>
        {data.insights.map((ins,i) => (
          <div key={i} style={{
            display:'flex', alignItems:'flex-start', gap:12, padding:'12px 16px',
            borderRadius:12, marginBottom:10,
            background: ins.type==='good' ? '#f0fdf4' : ins.type==='concern' ? '#fef2f2' : '#eff6ff',
            border: `1px solid ${ins.type==='good' ? '#bbf7d0' : ins.type==='concern' ? '#fecaca' : '#bfdbfe'}`
          }}>
            <span style={{ fontSize:22 }}>{ins.icon}</span>
            <p style={{ fontSize:14, color: ins.type==='good' ? '#166534' : ins.type==='concern' ? '#991b1b' : '#1e40af', lineHeight:1.5 }}>{ins.text}</p>
          </div>
        ))}
      </div>

      {/* Grade scale */}
      <div className="form-card">
        <h3 style={{ marginBottom:16 }}>📋 Grade Scale</h3>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {[['A+','85-100','#22c55e'],['A','75-84','#22c55e'],['B+','65-74','#84cc16'],['B','55-64','#f59e0b'],['C+','45-54','#f97316'],['C','35-44','#ef4444'],['D','0-34','#dc2626']].map(([g,range,color]) => (
            <div key={g} style={{ padding:'8px 16px', borderRadius:10, background:`${color}22`, border:`2px solid ${data.grade===g?color:'transparent'}`, textAlign:'center' }}>
              <div style={{ fontWeight:800, fontSize:18, color }}>{g}</div>
              <div style={{ fontSize:11, color:'#888' }}>{range}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}