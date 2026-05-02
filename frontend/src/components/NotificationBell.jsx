import { useState, useEffect } from 'react'
import axios from 'axios'
const API = 'http://localhost:5000/api'

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen]   = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const check = async () => {
      try {
        const [breakdownRes, scheduleRes, moodRes] = await Promise.all([
          axios.get(`${API}/breakdown/history/${user.id}`),
          axios.get(`${API}/schedule/${user.id}`),
          axios.get(`${API}/mood/history/${user.id}`),
        ])
        const notifs = []
        const breakdowns = breakdownRes.data
        const schedules  = scheduleRes.data
        const moods      = moodRes.data

        // Check high intensity breakdowns in last 7 days
        const recent = breakdowns.filter(b => {
          const days = (new Date() - new Date(b.date)) / (1000*60*60*24)
          return days <= 7 && b.intensity >= 7
        })
        if (recent.length >= 2) {
          notifs.push({ id:'bd1', type:'danger', icon:'🚨', title:'High Risk Alert', message:`${recent.length} high-intensity breakdowns in the last 7 days!`, time:'Today' })
        }

        // Check high risk schedules
        const highRisk = schedules.filter(s => s.riskScore >= 80).slice(0,1)
        if (highRisk.length) {
          notifs.push({ id:'sc1', type:'warning', icon:'⚠️', title:'High Risk Activity', message:`"${highRisk[0].activity}" has ${highRisk[0].riskScore}% ML risk score`, time:'Recent' })
        }

        // Check if mood not logged today
        const todayMood = moods.find(m => new Date(m.date).toDateString() === new Date().toDateString())
        if (!todayMood) {
          notifs.push({ id:'md1', type:'info', icon:'😊', title:'Mood Not Logged', message:"Today's mood hasn't been recorded yet", time:'Today' })
        }

        // Check consecutive sad moods
        const last3 = moods.slice(0,3)
        if (last3.length === 3 && last3.every(m => m.mood <= 2)) {
          notifs.push({ id:'md2', type:'danger', icon:'💙', title:'Low Mood Pattern', message:'3 consecutive sad mood entries detected', time:'Pattern' })
        }

        // Check ML breakdown prediction
        if (breakdowns.length >= 3) {
          const avgIntensity = breakdowns.slice(0,3).reduce((s,b) => s+b.intensity, 0) / 3
          if (avgIntensity > 6) {
            notifs.push({ id:'ml1', type:'warning', icon:'🤖', title:'ML Prediction', message:`Avg breakdown intensity is ${avgIntensity.toFixed(1)}/10 — elevated risk pattern`, time:'ML Alert' })
          }
        }

        if (notifs.length === 0) {
          notifs.push({ id:'ok1', type:'success', icon:'✅', title:'All Good!', message:"No alerts at this time. Keep up the great work!", time:'Now' })
        }

        setNotifications(notifs)
        setUnread(notifs.filter(n => n.type !== 'success').length)
      } catch {}
    }
    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [user.id])

  const typeColors = { danger:'#ef4444', warning:'#f59e0b', info:'#3b82f6', success:'#22c55e' }
  const typeBg     = { danger:'#fef2f2', warning:'#fffbeb', info:'#eff6ff', success:'#f0fdf4' }

  return (
    <div style={{ position:'relative' }}>
      <button onClick={() => setOpen(!open)}
        style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, position:'relative', padding:'4px' }}>
        🔔
        {unread > 0 && (
          <span style={{
            position:'absolute', top:0, right:0,
            background:'#ef4444', color:'#fff', borderRadius:'50%',
            width:18, height:18, fontSize:10, fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center'
          }}>{unread}</span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position:'fixed', inset:0, zIndex:998 }} />
          <div style={{
            position:'absolute', bottom:'100%', left:'50%', transform:'translateX(-50%)',
            width:320, background:'#fff', borderRadius:16,
            boxShadow:'0 8px 32px rgba(0,0,0,0.15)', zIndex:999,
            marginBottom:8, overflow:'hidden'
          }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontWeight:700, fontSize:15 }}>🔔 Notifications</span>
              <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:18 }}>✕</button>
            </div>
            <div style={{ maxHeight:320, overflowY:'auto' }}>
              {notifications.map(n => (
                <div key={n.id} style={{ padding:'12px 16px', borderBottom:'1px solid #f9f9f9', display:'flex', gap:12, background:typeBg[n.type] }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{n.icon}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, fontSize:13, color:typeColors[n.type], marginBottom:2 }}>{n.title}</p>
                    <p style={{ fontSize:12, color:'#555', lineHeight:1.4 }}>{n.message}</p>
                    <p style={{ fontSize:11, color:'#aaa', marginTop:4 }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}