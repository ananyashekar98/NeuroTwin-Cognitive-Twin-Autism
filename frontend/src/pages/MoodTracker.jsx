import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
const API = 'http://localhost:5000/api'

export default function MoodTracker({ user }) {
  const { t } = useTranslation()
  const MOODS  = [
    { key:'veryHappy', emoji:'😄', value:5, color:'#22c55e' },
    { key:'happy',     emoji:'🙂', value:4, color:'#86efac' },
    { key:'neutral',   emoji:'😐', value:3, color:'#f59e0b' },
    { key:'sad',       emoji:'😢', value:2, color:'#60a5fa' },
    { key:'verySad',   emoji:'😭', value:1, color:'#ef4444' },
  ]
  const ENERGY = [
    { key:'veryHigh', emoji:'⚡⚡', value:5 },
    { key:'high',     emoji:'⚡',   value:4 },
    { key:'medium',   emoji:'🔋',  value:3 },
    { key:'low',      emoji:'😴',  value:2 },
    { key:'veryLow',  emoji:'💤',  value:1 },
  ]

  const [selectedMood,   setSelectedMood]   = useState(null)
  const [selectedEnergy, setSelectedEnergy] = useState(null)
  const [sleep,  setSleep]   = useState(8)
  const [notes,  setNotes]   = useState('')
  const [history, setHistory] = useState([])
  const [msg, setMsg] = useState('')

  const load = () => axios.get(`${API}/mood/history/${user.id}`).then(r => setHistory(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!selectedMood || !selectedEnergy) return setMsg('❌ Please select mood and energy!')
    try {
      await axios.post(`${API}/mood/log`, { userId:user.id, mood:selectedMood, energy:selectedEnergy, sleep:Number(sleep), notes })
      setMsg('✅ ' + t('logMood')); setSelectedMood(null); setSelectedEnergy(null); setSleep(8); setNotes(''); load()
      setTimeout(() => setMsg(''), 3000)
    } catch { setMsg('❌ Error') }
  }

  const todayMood = history.find(m => new Date(m.date).toDateString() === new Date().toDateString())
  const chartData = [...history].reverse().slice(-7).map(m => ({
    date: new Date(m.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short' }),
    mood: m.mood, energy: m.energy, sleep: m.sleep
  }))

  return (
    <div>
      <div className="page-header">
        <h1>😊 {t('moodTitle')}</h1>
        <p>{t('moodSubtitle')}</p>
      </div>

      {todayMood && (
        <div className="alert alert-success" style={{ marginBottom:24, fontSize:15 }}>
          ✅ {t('todayLogged')} — {MOODS.find(m => m.value === todayMood.mood)?.emoji} {t('sleepHours')}: {todayMood.sleep}hrs
        </div>
      )}

      <div className="form-card">
        <h3>{t('logTodayMood')}</h3>
        {msg && <div className={`alert ${msg.startsWith('✅')?'alert-success':'alert-error'}`} style={{ marginBottom:16 }}>{msg}</div>}

        <p style={{ fontSize:13, fontWeight:600, color:'#444', marginBottom:12 }}>{t('howFeeling')}</p>
        <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
          {MOODS.map(m => (
            <div key={m.value} onClick={() => setSelectedMood(m.value)}
              style={{ flex:1, minWidth:80, padding:'14px 8px', borderRadius:14, textAlign:'center', cursor:'pointer', border:`2px solid ${selectedMood===m.value?m.color:'#e5e7eb'}`, background:selectedMood===m.value?`${m.color}22`:'#fff', transition:'all 0.2s' }}>
              <div style={{ fontSize:32 }}>{m.emoji}</div>
              <div style={{ fontSize:12, marginTop:6, fontWeight:selectedMood===m.value?700:400, color:selectedMood===m.value?m.color:'#666' }}>{t(m.key)}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize:13, fontWeight:600, color:'#444', marginBottom:12 }}>{t('energyLevel')}</p>
        <div style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap' }}>
          {ENERGY.map(e => (
            <div key={e.value} onClick={() => setSelectedEnergy(e.value)}
              style={{ flex:1, minWidth:80, padding:'12px 8px', borderRadius:12, textAlign:'center', cursor:'pointer', border:`2px solid ${selectedEnergy===e.value?'#7c83fd':'#e5e7eb'}`, background:selectedEnergy===e.value?'#f0f0ff':'#fff', transition:'all 0.2s' }}>
              <div style={{ fontSize:24 }}>{e.emoji}</div>
              <div style={{ fontSize:12, marginTop:4, color:selectedEnergy===e.value?'#7c83fd':'#666' }}>{t(e.key)}</div>
            </div>
          ))}
        </div>

        <div className="form-grid" style={{ marginBottom:20 }}>
          <div className="form-group"><label>{t('sleepHours')}: <strong>{sleep} hrs</strong></label><input type="range" min="1" max="12" value={sleep} onChange={e => setSleep(e.target.value)} /></div>
          <div className="form-group"><label>{t('optionalNotes')}</label><input placeholder="Any observations..." value={notes} onChange={e => setNotes(e.target.value)} /></div>
        </div>
        <button className="btn btn-primary" onClick={submit}>{t('logMood')}</button>
      </div>

      {chartData.length > 0 && (
        <div className="form-card">
          <h3>📈 {t('moodTrends')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize:11 }} />
              <YAxis domain={[0,6]} tick={{ fontSize:11 }} />
              <Tooltip /><Legend />
              <Line type="monotone" dataKey="mood"   stroke="#7c83fd" strokeWidth={2} dot={{ r:5 }} name={t('moodTitle')} />
              <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} dot={{ r:5 }} name={t('energyLevel')} />
              <Line type="monotone" dataKey="sleep"  stroke="#22c55e" strokeWidth={2} dot={{ r:5 }} name={t('sleepHours')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="table-card">
        <h3>📋 {t('moodHistory')}</h3>
        {history.length ? (
          <table>
            <thead><tr><th>{t('date')}</th><th>{t('moodTitle')}</th><th>{t('energyLevel')}</th><th>{t('sleepHours')}</th><th>{t('notes')}</th></tr></thead>
            <tbody>
              {history.map(m => (
                <tr key={m.id}>
                  <td>{new Date(m.date).toLocaleDateString()}</td>
                  <td>{MOODS.find(x => x.value===m.mood)?.emoji} {t(MOODS.find(x => x.value===m.mood)?.key||'neutral')}</td>
                  <td>{ENERGY.find(x => x.value===m.energy)?.emoji} {t(ENERGY.find(x => x.value===m.energy)?.key||'medium')}</td>
                  <td>{m.sleep} hrs</td>
                  <td style={{ color:'#888' }}>{m.notes||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="alert alert-info">{t('noMoodYet')}</div>}
      </div>
    </div>
  )
}