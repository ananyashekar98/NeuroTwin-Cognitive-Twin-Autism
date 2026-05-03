import { useState, useEffect } from 'react'
import axios from 'axios'
const API = 'http://localhost:5000/api'

export default function ModelTraining({ user }) {
  const [status, setStatus]       = useState(null)
  const [bdFile, setBdFile]       = useState(null)
  const [scFile, setScFile]       = useState(null)
  const [bdMsg, setBdMsg]         = useState('')
  const [scMsg, setScMsg]         = useState('')
  const [bdLoading, setBdLoading] = useState(false)
  const [scLoading, setScLoading] = useState(false)

  const loadStatus = () => {
    axios.get(`${API}/retrain/status/${user.id}`)
      .then(r => setStatus(r.data)).catch(() => {})
  }
  useEffect(() => { loadStatus() }, [])

  const uploadBreakdown = async () => {
    if (!bdFile) return setBdMsg('❌ Please select a CSV file')
    setBdLoading(true); setBdMsg('')
    const form = new FormData()
    form.append('file', bdFile)
    try {
      const { data } = await axios.post(`${API}/retrain/breakdown/${user.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setBdMsg(`✅ ${data.message}`)
      loadStatus()
    } catch (err) {
      setBdMsg(`❌ ${err.response?.data?.error || 'Upload failed'}`)
    }
    setBdLoading(false)
  }

  const uploadSchedule = async () => {
    if (!scFile) return setScMsg('❌ Please select a CSV file')
    setScLoading(true); setScMsg('')
    const form = new FormData()
    form.append('file', scFile)
    try {
      const { data } = await axios.post(`${API}/retrain/schedule/${user.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setScMsg(`✅ ${data.message}`)
      loadStatus()
    } catch (err) {
      setScMsg(`❌ ${err.response?.data?.error || 'Upload failed'}`)
    }
    setScLoading(false)
  }

  const downloadTemplate = (type) => {
    const headers = type === 'breakdown'
      ? 'trigger,intensity,duration,location,sensory\n'
      : 'activity,type,environment,time,risk_score\n'
    const sampleRows = type === 'breakdown'
      ? 'Sensory overload,8,20,School,1\nLoud noise,7,15,Mall,1\nRoutine change,5,10,Home,0\nSocial interaction,6,20,School,0\nTransition,7,25,Bus,0\n'
      : 'School assembly,social,crowded,09:00,85\nTherapy session,therapy,indoor,10:00,15\nLunch break,unstructured,noisy,13:00,55\nArt class,structured,indoor,14:00,20\nBus ride home,transition,public,15:00,80\n'
    const blob = new Blob([headers + sampleRows], { type:'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `sample_${type}_data.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="page-header">
        <h1>🤖 Personalized ML Model Training</h1>
        <p>Upload patient data to retrain ML models specifically for this individual</p>
      </div>

      {/* How it works */}
      <div className="form-card" style={{ background:'linear-gradient(135deg,#f0f4ff,#fff)', border:'1px solid #e0e7ff', marginBottom:24 }}>
        <h3>💡 How Personalized ML Works</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12, marginTop:12 }}>
          {[
            ['📤','Upload CSV','Upload patient historical data as CSV'],
            ['🔄','Retrain','ML model retrains on this patient\'s data'],
            ['🧠','Personalize','Model learns THIS patient\'s patterns'],
            ['🎯','Predict','Future predictions are now personalized'],
          ].map(([icon,title,desc]) => (
            <div key={title} style={{ background:'#fff', borderRadius:12, padding:'14px', textAlign:'center' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>{title}</div>
              <div style={{ fontSize:12, color:'#888' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Status */}
      <div className="cards-grid" style={{ marginBottom:24 }}>
        <div className="card" style={{ border:`2px solid ${status?.breakdown_model?.trained ? '#22c55e' : '#e5e7eb'}` }}>
          <div className="card-icon">⚡</div>
          <div className="card-value" style={{ fontSize:18, color: status?.breakdown_model?.trained ? '#22c55e' : '#f59e0b' }}>
            {status?.breakdown_model?.trained ? '✅ Personalized' : '⚠️ Base Model'}
          </div>
          <div className="card-label">Breakdown Model</div>
          {status?.breakdown_model?.info && (
            <div style={{ fontSize:11, color:'#888', marginTop:6 }}>
              {status.breakdown_model.info.samples} samples · {new Date(status.breakdown_model.info.trained_at).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="card" style={{ border:`2px solid ${status?.schedule_model?.trained ? '#22c55e' : '#e5e7eb'}` }}>
          <div className="card-icon">📅</div>
          <div className="card-value" style={{ fontSize:18, color: status?.schedule_model?.trained ? '#22c55e' : '#f59e0b' }}>
            {status?.schedule_model?.trained ? '✅ Personalized' : '⚠️ Base Model'}
          </div>
          <div className="card-label">Schedule Risk Model</div>
          {status?.schedule_model?.info && (
            <div style={{ fontSize:11, color:'#888', marginTop:6 }}>
              {status.schedule_model.info.samples} samples · {new Date(status.schedule_model.info.trained_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Model Upload */}
      <div className="form-card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3>⚡ Train Breakdown Prediction Model</h3>
          <button className="btn" style={{ background:'#f0f4ff', color:'#7c83fd', fontSize:13 }} onClick={() => downloadTemplate('breakdown')}>
            📥 Download Template CSV
          </button>
        </div>

        <div style={{ background:'#f9f9f9', borderRadius:10, padding:'14px', marginBottom:16, fontSize:13, color:'#666' }}>
          <strong>CSV Format Required:</strong>
          <code style={{ display:'block', marginTop:6, padding:'8px', background:'#f0f4ff', borderRadius:8, fontSize:12 }}>
            trigger, intensity (1-10), duration (minutes), location, sensory (0 or 1)
          </code>
          <p style={{ marginTop:6 }}>⚠️ Minimum 10 rows required. More data = better predictions!</p>
        </div>

        {bdMsg && <div className={`alert ${bdMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom:14 }}>{bdMsg}</div>}

        <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
          <input type="file" accept=".csv" onChange={e => setBdFile(e.target.files[0])}
            style={{ flex:1, padding:'10px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14 }} />
          <button className="btn btn-primary" onClick={uploadBreakdown} disabled={bdLoading}>
            {bdLoading ? '⏳ Training...' : '🚀 Upload & Retrain'}
          </button>
        </div>

        {bdLoading && (
          <div style={{ marginTop:16, padding:'12px', background:'#f0f4ff', borderRadius:10, fontSize:13, color:'#7c83fd' }}>
            🔄 Parsing CSV → Extracting features → Training Random Forest → Saving personalized model...
          </div>
        )}
      </div>

      {/* Schedule Model Upload */}
      <div className="form-card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3>📅 Train Schedule Risk Model</h3>
          <button className="btn" style={{ background:'#f0f4ff', color:'#7c83fd', fontSize:13 }} onClick={() => downloadTemplate('schedule')}>
            📥 Download Template CSV
          </button>
        </div>

        <div style={{ background:'#f9f9f9', borderRadius:10, padding:'14px', marginBottom:16, fontSize:13, color:'#666' }}>
          <strong>CSV Format Required:</strong>
          <code style={{ display:'block', marginTop:6, padding:'8px', background:'#f0f4ff', borderRadius:8, fontSize:12 }}>
            activity, type (structured/social/therapy/transition/unstructured), environment (indoor/outdoor/crowded/noisy/public), time (HH:MM), risk_score (0-100)
          </code>
          <p style={{ marginTop:6 }}>⚠️ Minimum 5 rows required. More data = better predictions!</p>
        </div>

        {scMsg && <div className={`alert ${scMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom:14 }}>{scMsg}</div>}

        <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
          <input type="file" accept=".csv" onChange={e => setScFile(e.target.files[0])}
            style={{ flex:1, padding:'10px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14 }} />
          <button className="btn btn-primary" onClick={uploadSchedule} disabled={scLoading}>
            {scLoading ? '⏳ Training...' : '🚀 Upload & Retrain'}
          </button>
        </div>

        {scLoading && (
          <div style={{ marginTop:16, padding:'12px', background:'#f0f4ff', borderRadius:10, fontSize:13, color:'#7c83fd' }}>
            🔄 Parsing CSV → Extracting features → Training Gradient Boosting → Saving personalized model...
          </div>
        )}
      </div>

      {/* Info */}
      <div className="form-card" style={{ background:'#f0fdf4', border:'1px solid #bbf7d0' }}>
        <h3 style={{ color:'#166534' }}>✅ After Retraining</h3>
        <ul style={{ fontSize:14, color:'#166534', lineHeight:2, paddingLeft:20, marginTop:8 }}>
          <li>The ML model is now trained on <strong>this patient's specific data</strong></li>
          <li>Schedule Risk Predictor will give <strong>personalized risk scores</strong></li>
          <li>Breakdown Log will show <strong>patient-specific ML predictions</strong></li>
          <li>A <strong>🎯 Personalized</strong> badge will appear on predictions</li>
          <li>The uploaded data is also saved to patient history automatically</li>
        </ul>
      </div>
    </div>
  )
}