import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
const API = 'http://localhost:5000/api'
const SENSORY  = ['Noise sensitivity','Light sensitivity','Touch sensitivity','Smell sensitivity','Taste sensitivity']
const TRIGGERS = ['Loud noises','Crowds','Routine changes','Bright lights','Physical contact','Transitions','Unexpected events']
const CALMING  = ['Music','Weighted blanket','Fidget toys','Quiet room','Deep pressure','Drawing','Walking']

export default function Profile({ user }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name:'', age:'', gender:'', supportLevel:'2', school:'', therapist:'', sensoryTriggers:[], calmingStrategies:[], sensoryNeeds:[], communicationStyle:'verbal', specialInterests:'', notes:'', avatarColor:'#7c83fd' })
  const [saved, setSaved] = useState(false)

  useEffect(() => { axios.get(`${API}/profile/${user.id}`).then(r => { if(r.data) setForm(f => ({ ...f, ...r.data })) }).catch(() => {}) }, [user.id])
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })
  const toggleArray = (field, value) => { const arr=form[field]||[]; setForm({ ...form, [field]: arr.includes(value)?arr.filter(x=>x!==value):[...arr,value] }) }
  const save = async () => { await axios.post(`${API}/profile/save`, { ...form, userId:user.id }); setSaved(true); setTimeout(() => setSaved(false), 3000) }

  const COLORS = ['#7c83fd','#ef4444','#22c55e','#f59e0b','#8b5cf6','#06b6d4','#ec4899']
  const initials = form.name ? form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '?'

  return (
    <div>
      <div className="page-header"><h1>👤 {t('profileTitle')}</h1><p>{t('profileSubtitle')}</p></div>
      {saved && <div className="alert alert-success" style={{ marginBottom:20 }}>{t('profileSaved')}</div>}

      <div className="form-card">
        <h3>{t('basicInfo')}</h3>
        <div style={{ display:'flex', alignItems:'center', gap:24, marginBottom:24 }}>
          <div style={{ width:90, height:90, borderRadius:'50%', background:form.avatarColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:700, color:'#fff', boxShadow:`0 4px 20px ${form.avatarColor}66` }}>{initials}</div>
          <div>
            <p style={{ fontSize:13, color:'#666', marginBottom:8 }}>{t('avatarColor')}</p>
            <div style={{ display:'flex', gap:8 }}>
              {COLORS.map(c => <div key={c} onClick={() => setForm({ ...form, avatarColor:c })} style={{ width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer', border:form.avatarColor===c?'3px solid #1a1a2e':'3px solid transparent' }} />)}
            </div>
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group"><label>{t('fullName')}</label><input name="name" placeholder="Individual's name" value={form.name} onChange={handle} /></div>
          <div className="form-group"><label>{t('age')}</label><input name="age" type="number" value={form.age} onChange={handle} /></div>
          <div className="form-group"><label>{t('gender')}</label>
            <select name="gender" value={form.gender} onChange={handle}>
              <option value="">Select</option>
              <option value="Male">{t('male')}</option>
              <option value="Female">{t('female')}</option>
              <option value="Non-binary">Non-binary</option>
            </select>
          </div>
          <div className="form-group"><label>{t('supportLevel')}</label>
            <select name="supportLevel" value={form.supportLevel} onChange={handle}>
              <option value="1">{t('level1')}</option>
              <option value="2">{t('level2')}</option>
              <option value="3">{t('level3')}</option>
            </select>
          </div>
          <div className="form-group"><label>{t('school')}</label><input name="school" value={form.school} onChange={handle} /></div>
          <div className="form-group"><label>{t('therapistName')}</label><input name="therapist" value={form.therapist} onChange={handle} /></div>
          <div className="form-group"><label>{t('communication')}</label>
            <select name="communicationStyle" value={form.communicationStyle} onChange={handle}>
              <option value="verbal">{t('verbal')}</option>
              <option value="nonverbal">{t('nonverbal')}</option>
              <option value="aac">{t('aac')}</option>
              <option value="mixed">{t('mixed')}</option>
            </select>
          </div>
          <div className="form-group"><label>{t('specialInterests')}</label><input name="specialInterests" value={form.specialInterests} onChange={handle} /></div>
        </div>
      </div>

      <div className="form-card">
        <h3>{t('knownTriggers')}</h3>
        <p style={{ fontSize:13, color:'#888', marginBottom:12 }}>{t('selectAll')}</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          {TRIGGERS.map(tr => <div key={tr} onClick={() => toggleArray('sensoryTriggers',tr)} style={{ padding:'8px 16px', borderRadius:20, fontSize:13, cursor:'pointer', background:form.sensoryTriggers?.includes(tr)?'#7c83fd':'#f3f4f6', color:form.sensoryTriggers?.includes(tr)?'#fff':'#444', transition:'all 0.2s' }}>{tr}</div>)}
        </div>
      </div>

      <div className="form-card">
        <h3>{t('calmingStrategies')}</h3>
        <p style={{ fontSize:13, color:'#888', marginBottom:12 }}>{t('selectHelp')}</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          {CALMING.map(c => <div key={c} onClick={() => toggleArray('calmingStrategies',c)} style={{ padding:'8px 16px', borderRadius:20, fontSize:13, cursor:'pointer', background:form.calmingStrategies?.includes(c)?'#22c55e':'#f3f4f6', color:form.calmingStrategies?.includes(c)?'#fff':'#444', transition:'all 0.2s' }}>{c}</div>)}
        </div>
      </div>

      <div className="form-card">
        <h3>{t('sensitivities')}</h3>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          {SENSORY.map(s => <div key={s} onClick={() => toggleArray('sensoryNeeds',s)} style={{ padding:'8px 16px', borderRadius:20, fontSize:13, cursor:'pointer', background:form.sensoryNeeds?.includes(s)?'#f59e0b':'#f3f4f6', color:form.sensoryNeeds?.includes(s)?'#fff':'#444', transition:'all 0.2s' }}>{s}</div>)}
        </div>
      </div>

      <div className="form-card">
        <h3>{t('additionalNotes')}</h3>
        <div className="form-group"><textarea name="notes" rows="4" style={{ width:'100%' }} value={form.notes} onChange={handle} /></div>
      </div>
      <button className="btn btn-primary" style={{ padding:'14px 40px', fontSize:15 }} onClick={save}>{t('saveProfile')}</button>
    </div>
  )
}