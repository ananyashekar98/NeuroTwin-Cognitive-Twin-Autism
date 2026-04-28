import { useState, useEffect } from 'react'
import axios from 'axios'
const API = 'http://localhost:5000/api'
const ACTIVITIES = ['School','Therapy','Outdoor play','Indoor play','Meal time','Bath time','Social interaction','Screen time','Sleep/nap']
const BEHAVIORS  = ['Calm','Cooperative','Stimming','Repetitive behavior','Meltdown','Self-harm attempt','Aggression','Withdrawal','Good communication']
export default function DailyLog({ user }) {
  const [form, setForm] = useState({ morningRoutine:'', afternoonRoutine:'', eveningRoutine:'', activitiesCompleted:[], behaviorsObserved:[], appetite:'3', hydration:'3', medicationTaken:'N/A', caregiverNotes:'', highlights:'', concerns:'' })
  const [history, setHistory] = useState([])
  const [msg, setMsg]         = useState('')
  const [expanded, setExpanded] = useState(null)
  const load = () => axios.get(`${API}/dailylog/history/${user.id}`).then(r=>setHistory(r.data)).catch(()=>{})
  useEffect(() => { load() }, [])
  const handle = e => setForm({...form,[e.target.name]:e.target.value})
  const toggleArray = (field,val) => { const arr=form[field]||[]; setForm({...form,[field]:arr.includes(val)?arr.filter(x=>x!==val):[...arr,val]}) }
  const submit = async () => {
    try {
      await axios.post(`${API}/dailylog/log`,{...form,userId:user.id})
      setMsg('✅ Daily log saved!')
      setForm({ morningRoutine:'', afternoonRoutine:'', eveningRoutine:'', activitiesCompleted:[], behaviorsObserved:[], appetite:'3', hydration:'3', medicationTaken:'N/A', caregiverNotes:'', highlights:'', concerns:'' })
      load(); setTimeout(()=>setMsg(''),3000)
    } catch { setMsg('❌ Error saving') }
  }
  const ratingLabel = v => ['','Very Poor','Poor','Average','Good','Excellent'][v]
  return (
    <div>
      <div className="page-header"><h1>📓 Daily Log</h1><p>Record daily observations, routines and behaviors</p></div>
      {msg && <div className={`alert ${msg.startsWith('✅')?'alert-success':'alert-error'}`} style={{ marginBottom:20 }}>{msg}</div>}
      <div className="form-card">
        <h3>🌅 Daily Routines</h3>
        <div className="form-grid">
          <div className="form-group"><label>🌄 Morning</label><textarea name="morningRoutine" rows="2" style={{ width:'100%' }} placeholder="Morning routine..." value={form.morningRoutine} onChange={handle} /></div>
          <div className="form-group"><label>☀️ Afternoon</label><textarea name="afternoonRoutine" rows="2" style={{ width:'100%' }} placeholder="Afternoon routine..." value={form.afternoonRoutine} onChange={handle} /></div>
          <div className="form-group full-width"><label>🌙 Evening</label><textarea name="eveningRoutine" rows="2" style={{ width:'100%' }} placeholder="Evening routine..." value={form.eveningRoutine} onChange={handle} /></div>
        </div>
      </div>
      <div className="form-card">
        <h3>🎯 Activities Completed</h3>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          {ACTIVITIES.map(a => <div key={a} onClick={()=>toggleArray('activitiesCompleted',a)} style={{ padding:'8px 16px', borderRadius:20, fontSize:13, cursor:'pointer', background:form.activitiesCompleted.includes(a)?'#7c83fd':'#f3f4f6', color:form.activitiesCompleted.includes(a)?'#fff':'#444', transition:'all 0.2s' }}>{a}</div>)}
        </div>
      </div>
      <div className="form-card">
        <h3>👁️ Behaviors Observed</h3>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          {BEHAVIORS.map(b => { const isNeg=['Meltdown','Self-harm attempt','Aggression','Withdrawal'].includes(b); return <div key={b} onClick={()=>toggleArray('behaviorsObserved',b)} style={{ padding:'8px 16px', borderRadius:20, fontSize:13, cursor:'pointer', background:form.behaviorsObserved.includes(b)?(isNeg?'#ef4444':'#22c55e'):'#f3f4f6', color:form.behaviorsObserved.includes(b)?'#fff':'#444', transition:'all 0.2s' }}>{b}</div> })}
        </div>
      </div>
      <div className="form-card">
        <h3>🏥 Health</h3>
        <div className="form-grid">
          <div className="form-group"><label>Appetite: <strong>{ratingLabel(form.appetite)}</strong></label><input type="range" name="appetite" min="1" max="5" value={form.appetite} onChange={handle} /></div>
          <div className="form-group"><label>Hydration: <strong>{ratingLabel(form.hydration)}</strong></label><input type="range" name="hydration" min="1" max="5" value={form.hydration} onChange={handle} /></div>
          <div className="form-group"><label>Medication?</label><div style={{ display:'flex', gap:12, marginTop:8 }}>{['Yes','No','N/A'].map(opt=><div key={opt} onClick={()=>setForm({...form,medicationTaken:opt})} style={{ padding:'8px 20px', borderRadius:10, cursor:'pointer', fontSize:14, background:form.medicationTaken===opt?'#7c83fd':'#f3f4f6', color:form.medicationTaken===opt?'#fff':'#444' }}>{opt}</div>)}</div></div>
        </div>
      </div>
      <div className="form-card">
        <h3>📝 Notes</h3>
        <div className="form-grid">
          <div className="form-group"><label>⭐ Highlights</label><textarea name="highlights" rows="2" style={{ width:'100%' }} value={form.highlights} onChange={handle} /></div>
          <div className="form-group"><label>⚠️ Concerns</label><textarea name="concerns" rows="2" style={{ width:'100%' }} value={form.concerns} onChange={handle} /></div>
          <div className="form-group full-width"><label>📋 Additional Notes</label><textarea name="caregiverNotes" rows="3" style={{ width:'100%' }} value={form.caregiverNotes} onChange={handle} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop:8 }} onClick={submit}>💾 Save Daily Log</button>
      </div>
      <div className="table-card">
        <h3>📚 Previous Logs</h3>
        {history.length ? history.map(log => (
          <div key={log.id} style={{ border:'1px solid #f0f0f0', borderRadius:12, marginBottom:12, overflow:'hidden' }}>
            <div onClick={()=>setExpanded(expanded===log.id?null:log.id)} style={{ padding:'14px 20px', cursor:'pointer', display:'flex', justifyContent:'space-between', background:'#fafafa' }}>
              <strong>{new Date(log.date).toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</strong>
              <span style={{ color:'#7c83fd' }}>{expanded===log.id?'▲':'▼'}</span>
            </div>
            {expanded===log.id && (
              <div style={{ padding:'16px 20px', borderTop:'1px solid #f0f0f0' }}>
                {log.morningRoutine && <p style={{ marginBottom:8 }}><strong>🌄 Morning:</strong> {log.morningRoutine}</p>}
                {log.afternoonRoutine && <p style={{ marginBottom:8 }}><strong>☀️ Afternoon:</strong> {log.afternoonRoutine}</p>}
                {log.eveningRoutine && <p style={{ marginBottom:8 }}><strong>🌙 Evening:</strong> {log.eveningRoutine}</p>}
                {log.highlights && <p style={{ marginBottom:8 }}><strong>⭐ Highlights:</strong> {log.highlights}</p>}
                {log.concerns && <p><strong>⚠️ Concerns:</strong> {log.concerns}</p>}
              </div>
            )}
          </div>
        )) : <div className="alert alert-info">No daily logs yet.</div>}
      </div>
    </div>
  )
}