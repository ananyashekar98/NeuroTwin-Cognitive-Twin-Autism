import { useState, useEffect } from 'react'
import axios from 'axios'
const API = 'http://localhost:5000/api'

const COLORS = ['#7c83fd','#ef4444','#22c55e','#f59e0b','#8b5cf6','#06b6d4','#ec4899','#f97316']

export default function PatientSelector({ caregiver, onSelectPatient }) {
  const [patients, setPatients]   = useState([])
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ name:'', age:'', gender:'', supportLevel:'2', diagnosis:'', school:'', therapist:'', avatarColor:'#7c83fd' })
  const [msg, setMsg]             = useState('')
  const [search, setSearch]       = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const load = () => axios.get(`${API}/patients/list/${caregiver.id}`).then(r => setPatients(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const create = async () => {
    if (!form.name || !form.age) return setMsg('❌ Name and age are required!')
    try {
      await axios.post(`${API}/patients/create`, { ...form, caregiverId: caregiver.id })
      setMsg('✅ Patient added successfully!')
      setForm({ name:'', age:'', gender:'', supportLevel:'2', diagnosis:'', school:'', therapist:'', avatarColor:'#7c83fd' })
      setShowForm(false)
      load()
      setTimeout(() => setMsg(''), 3000)
    } catch { setMsg('❌ Error creating patient') }
  }

  const deletePatient = async (id) => {
    await axios.delete(`${API}/patients/delete/${id}`)
    setDeleteConfirm(null)
    load()
  }

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  const initials  = name => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '?'
  const levelLabel = l => l === '1' ? 'Level 1' : l === '2' ? 'Level 2' : 'Level 3'

  return (
    <div style={{ minHeight:'100vh', background:'#f0f4ff', padding:32 }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, color:'#1a1a2e' }}>
            👋 Welcome, {caregiver.name}
          </h1>
          <p style={{ color:'#888', marginTop:4 }}>
            Select a patient to view their dashboard and records
          </p>
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div style={{ background:'#fff', borderRadius:10, padding:'6px 14px', fontSize:13, color:'#888', border:'1px solid #e5e7eb' }}>
            🩺 {caregiver.role} · {patients.length} patient{patients.length !== 1 ? 's' : ''}
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Patient'}
          </button>
        </div>
      </div>

      {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom:20 }}>{msg}</div>}

      {/* Add Patient Form */}
      {showForm && (
        <div className="form-card" style={{ marginBottom:28 }}>
          <h3>👤 Add New Patient</h3>
          <div className="form-grid">
            <div className="form-group"><label>Full Name *</label><input name="name" placeholder="Patient's full name" value={form.name} onChange={handle} /></div>
            <div className="form-group"><label>Age *</label><input name="age" type="number" placeholder="Age" value={form.age} onChange={handle} /></div>
            <div className="form-group"><label>Gender</label>
              <select name="gender" value={form.gender} onChange={handle}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Non-binary</option>
              </select>
            </div>
            <div className="form-group"><label>ASD Support Level</label>
              <select name="supportLevel" value={form.supportLevel} onChange={handle}>
                <option value="1">Level 1 — Requiring support</option>
                <option value="2">Level 2 — Substantial support</option>
                <option value="3">Level 3 — Very substantial support</option>
              </select>
            </div>
            <div className="form-group"><label>School / Institution</label><input name="school" placeholder="School name" value={form.school} onChange={handle} /></div>
            <div className="form-group"><label>Therapist Name</label><input name="therapist" placeholder="Therapist name" value={form.therapist} onChange={handle} /></div>
            <div className="form-group full-width"><label>Diagnosis Notes</label><input name="diagnosis" placeholder="Any additional diagnosis information" value={form.diagnosis} onChange={handle} /></div>
          </div>

          {/* Avatar color */}
          <div style={{ marginTop:16, marginBottom:20 }}>
            <label style={{ fontSize:13, fontWeight:500, color:'#444', display:'block', marginBottom:8 }}>Avatar Color</label>
            <div style={{ display:'flex', gap:10 }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setForm({ ...form, avatarColor:c })}
                  style={{ width:32, height:32, borderRadius:'50%', background:c, cursor:'pointer', border: form.avatarColor===c ? '3px solid #1a1a2e' : '3px solid transparent', transition:'transform 0.2s', transform: form.avatarColor===c ? 'scale(1.2)' : 'scale(1)' }} />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{ display:'flex', alignItems:'center', gap:16, padding:'14px', background:'#f9f9ff', borderRadius:12, marginBottom:16 }}>
            <div style={{ width:50, height:50, borderRadius:'50%', background:form.avatarColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#fff' }}>
              {form.name ? initials(form.name) : '?'}
            </div>
            <div>
              <p style={{ fontWeight:700, fontSize:15 }}>{form.name || 'Patient Name'}</p>
              <p style={{ fontSize:13, color:'#888' }}>Age: {form.age || '—'} · {levelLabel(form.supportLevel)}</p>
            </div>
          </div>

          <button className="btn btn-primary" onClick={create}>✅ Create Patient</button>
        </div>
      )}

      {/* Search */}
      {patients.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <input
            placeholder="🔍 Search patients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width:'100%', maxWidth:400, padding:'10px 16px', border:'1.5px solid #e5e7eb', borderRadius:12, fontSize:14, outline:'none' }}
          />
        </div>
      )}

      {/* Patient Cards Grid */}
      {filtered.length > 0 ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
          {filtered.map(patient => (
            <div key={patient.id}
              style={{ background:'#fff', borderRadius:20, padding:'24px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', cursor:'pointer', transition:'all 0.2s', border:'2px solid transparent', position:'relative' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.border=`2px solid ${patient.avatarColor}` }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.border='2px solid transparent' }}
              onClick={() => onSelectPatient(patient)}>

              {/* Delete button */}
              <button
                onClick={e => { e.stopPropagation(); setDeleteConfirm(patient.id) }}
                style={{ position:'absolute', top:12, right:12, background:'#fef2f2', border:'none', borderRadius:8, padding:'4px 8px', cursor:'pointer', fontSize:12, color:'#ef4444' }}>
                🗑️
              </button>

              {/* Avatar */}
              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:patient.avatarColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700, color:'#fff', boxShadow:`0 4px 16px ${patient.avatarColor}44` }}>
                  {initials(patient.name)}
                </div>
                <div>
                  <h3 style={{ fontSize:18, fontWeight:700, color:'#1a1a2e', marginBottom:4 }}>{patient.name}</h3>
                  <p style={{ fontSize:13, color:'#888' }}>Age: {patient.age} · {patient.gender || 'N/A'}</p>
                </div>
              </div>

              {/* Info */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
                <span style={{ background:`${patient.avatarColor}22`, color:patient.avatarColor, padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700 }}>
                  ASD {levelLabel(patient.supportLevel)}
                </span>
                {patient.school && (
                  <span style={{ background:'#f3f4f6', color:'#555', padding:'4px 12px', borderRadius:20, fontSize:12 }}>
                    🏫 {patient.school}
                  </span>
                )}
              </div>

              {patient.therapist && (
                <p style={{ fontSize:13, color:'#888', marginBottom:8 }}>👨‍⚕️ Dr. {patient.therapist}</p>
              )}

              {patient.diagnosis && (
                <p style={{ fontSize:12, color:'#aaa', marginBottom:12 }}>{patient.diagnosis}</p>
              )}

              {/* Click hint */}
              <div style={{ background:'#f0f4ff', borderRadius:10, padding:'8px 12px', textAlign:'center', fontSize:13, color:'#7c83fd', fontWeight:600 }}>
                👆 Click to open dashboard
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ fontSize:64, marginBottom:16 }}>👥</div>
          <h3 style={{ fontSize:20, color:'#1a1a2e', marginBottom:8 }}>
            {search ? 'No patients found' : 'No patients yet'}
          </h3>
          <p style={{ color:'#888', marginBottom:24 }}>
            {search ? 'Try a different search term' : 'Add your first patient to get started'}
          </p>
          {!search && (
            <button className="btn btn-primary" style={{ padding:'12px 32px' }} onClick={() => setShowForm(true)}>
              + Add First Patient
            </button>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <>
          <div onClick={() => setDeleteConfirm(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:998 }} />
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#fff', borderRadius:20, padding:'32px', zIndex:999, width:320, textAlign:'center', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>Delete Patient?</h3>
            <p style={{ color:'#888', fontSize:14, marginBottom:24 }}>This will permanently delete the patient and all their data.</p>
            <div style={{ display:'flex', gap:12 }}>
              <button className="btn" style={{ flex:1, background:'#f3f4f6' }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={() => deletePatient(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}