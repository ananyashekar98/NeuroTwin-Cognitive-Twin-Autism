import { useEffect, useState } from 'react'
import axios from 'axios'
const API = 'http://localhost:5000/api'
export default function Recommendations({ user }) {
  const [data, setData] = useState(null)
  useEffect(() => { axios.get(`${API}/recommendations/${user.id}`).then(r => setData(r.data)).catch(() => {}) }, [user.id])
  const icons = { Urgent:'🚨', Sensory:'👂', Routine:'📅', Communication:'💬', Calming:'🧘', Environment:'🏠' }
  return (
    <div>
      <div className="page-header"><h1>💡 Recommendations</h1><p>Personalized support strategies based on logged history</p></div>
      {data && (
        <div className="cards-grid" style={{ marginBottom:28 }}>
          <div className="card"><div className="card-icon">⚡</div><div className="card-value">{data.breakdownCount}</div><div className="card-label">Breakdowns Logged</div></div>
          <div className="card"><div className="card-icon">📊</div><div className="card-value">{data.avgIntensity}</div><div className="card-label">Avg Intensity</div></div>
        </div>
      )}
      <div className="form-card">
        <h3>🎯 Personalized Strategies</h3>
        {data?.suggestions?.map(s => (
          <div key={s.id} className={`suggestion-card priority-${s.priority}`}>
            <span style={{ fontSize:24 }}>{icons[s.category]||'💡'}</span>
            <div>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                <span style={{ fontWeight:600, fontSize:14 }}>{s.category}</span>
                <span className={`badge badge-${s.priority}`}>{s.priority}</span>
              </div>
              <p style={{ fontSize:14, color:'#444', lineHeight:1.5 }}>{s.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}