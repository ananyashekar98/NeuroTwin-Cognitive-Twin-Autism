import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const API = 'http://localhost:5000/api'
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6']

export default function Dashboard({ user }) {
  const [data, setData]           = useState(null)
  const [schedules, setSchedules] = useState([])
  const [breakdowns, setBreakdowns] = useState([])

  useEffect(() => {
    axios.get(`${API}/dashboard/${user.id}`).then(r => setData(r.data)).catch(() => {})
    axios.get(`${API}/schedule/${user.id}`).then(r => setSchedules(r.data)).catch(() => {})
    axios.get(`${API}/breakdown/history/${user.id}`).then(r => setBreakdowns(r.data)).catch(() => {})
  }, [user.id])

  const cards = [
    { icon: '⚡', value: data?.totalBreakdowns ?? 0,        label: 'Total Breakdowns' },
    { icon: '📅', value: data?.totalSchedules ?? 0,         label: 'Schedules Logged' },
    { icon: '🎯', value: `${data?.avgRiskScore ?? 0}%`,     label: 'Avg Risk Score' },
    { icon: '✅', value: `${data?.routineAdherence ?? 0}%`, label: 'Routine Adherence' },
  ]

  // Chart data — risk scores per activity
  const riskChartData = schedules.slice(0, 6).map(s => ({
    name: s.activity.length > 10 ? s.activity.slice(0, 10) + '…' : s.activity,
    risk: s.riskScore
  }))

  // Trigger breakdown pie chart
  const triggerCounts = {}
  breakdowns.forEach(b => { triggerCounts[b.trigger] = (triggerCounts[b.trigger] || 0) + 1 })
  const pieData = Object.entries(triggerCounts).map(([name, value]) => ({ name, value }))

  // Intensity over time bar chart
  const intensityData = breakdowns.slice(0, 7).reverse().map((b, i) => ({
    day: `Event ${i + 1}`,
    intensity: b.intensity
  }))

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user.name} 👋</h1>
        <p>Here's today's overview for your ASD support dashboard</p>
      </div>

      {/* Summary Cards */}
      <div className="cards-grid">
        {cards.map((c, i) => (
          <div className="card" key={i}>
            <div className="card-icon">{c.icon}</div>
            <div className="card-value">{c.value}</div>
            <div className="card-label">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Risk Score Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>📊 Activity Risk Scores</h3>
          {riskChartData.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Risk']} />
                <Bar dataKey="risk" fill="#7c83fd" radius={[6, 6, 0, 0]}
                  label={{ position: 'top', fontSize: 10, formatter: v => `${v}%` }} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="alert alert-info">Add schedules to see chart</div>
          )}
        </div>

        {/* Trigger Pie Chart */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>🥧 Breakdown Triggers</h3>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="alert alert-info">Log breakdowns to see chart</div>
          )}
        </div>
      </div>

      {/* Intensity Over Time */}
      {intensityData.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>📈 Breakdown Intensity Over Time</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={intensityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="intensity" radius={[6, 6, 0, 0]}
                fill="#ef4444"
                label={{ position: 'top', fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Breakdown Table */}
      <div className="form-card">
        <h3>📋 Recent Breakdown Events</h3>
        {data?.recentBreakdowns?.length ? (
          <table>
            <thead>
              <tr><th>Date</th><th>Trigger</th><th>Intensity</th><th>Duration</th></tr>
            </thead>
            <tbody>
              {data.recentBreakdowns.map(b => (
                <tr key={b.id}>
                  <td>{new Date(b.date).toLocaleDateString()}</td>
                  <td>{b.trigger}</td>
                  <td>
                    <span className={b.intensity > 6 ? 'risk-high' : b.intensity > 3 ? 'risk-medium' : 'risk-low'}>
                      {b.intensity}/10
                    </span>
                  </td>
                  <td>{b.duration} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-info">No breakdown events logged yet.</div>
        )}
      </div>
    </div>
  )
}