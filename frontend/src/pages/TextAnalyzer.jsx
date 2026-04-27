import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api'

const EMOTIONS = [
  { label: 'Frustration', key: 'frustration', color: '#ef4444' },
  { label: 'Anxiety',     key: 'anxiety',     color: '#f59e0b' },
  { label: 'Happiness',   key: 'happiness',   color: '#22c55e' },
  { label: 'Sadness',     key: 'sadness',     color: '#3b82f6' },
  { label: 'Calm',        key: 'calm',        color: '#8b5cf6' },
]

const ALERT_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
const ALERT_BG     = { low: '#f0fdf4', medium: '#fffbeb', high: '#fef2f2' }

const samples = [
  "I don't want to go! It's too loud and I hate it there!",
  "I like playing with my toys. It was a good day today.",
  "I'm scared. Please don't make me go. I feel sick.",
  "Everyone always says fine but nothing is ever fine.",
  "I need my headphones. The noise is too much right now.",
]

export default function TextAnalyzer() {
  const [text, setText]       = useState('')
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const analyze = async () => {
    if (!text.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const { data } = await axios.post(`${API}/text/analyze`, { text })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Check your API key.')
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <h1>💬 AI Text Emotion Analyzer</h1>
        <p>Powered by Google Gemini AI — paste communication to detect emotional state</p>
      </div>

      <div className="form-card">
        <h3>Enter Text to Analyze</h3>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <textarea
            rows="4"
            placeholder="Type or paste what the individual said or wrote..."
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: '#888', alignSelf: 'center' }}>Try a sample:</span>
          {samples.map((s, i) => (
            <button key={i} className="btn"
              style={{ background: '#f3f4f6', fontSize: 12, padding: '6px 12px' }}
              onClick={() => setText(s)}>
              Sample {i + 1}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

        <button className="btn btn-primary" onClick={analyze} disabled={loading}>
          {loading ? '🤖 Gemini is analyzing...' : '🔍 Analyze with Gemini AI'}
        </button>
      </div>

      {result && (
        <>
          {/* Alert Level */}
          <div className="alert" style={{
            background: ALERT_BG[result.alert_level],
            color: ALERT_COLORS[result.alert_level],
            border: `1px solid ${ALERT_COLORS[result.alert_level]}`,
            marginBottom: 20, fontSize: 15, fontWeight: 600
          }}>
            🚨 Alert Level: {result.alert_level?.toUpperCase()}
            {result.sarcasm_detected && <span style={{ marginLeft: 16, fontWeight: 400 }}>⚠️ Sarcasm detected</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Emotion Scores */}
            <div className="form-card" style={{ margin: 0 }}>
              <h3>📊 Emotion Scores</h3>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
                Dominant: <strong style={{ color: '#7c83fd' }}>{result.dominant_emotion}</strong>
              </p>
              {EMOTIONS.map(e => (
                <div key={e.key} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{e.label}</span>
                    <span style={{ fontSize: 14, color: e.color, fontWeight: 600 }}>
                      {result.emotions?.[e.key] ?? 0}%
                    </span>
                  </div>
                  <div style={{ background: '#f3f4f6', borderRadius: 8, height: 10 }}>
                    <div style={{
                      width: `${result.emotions?.[e.key] ?? 0}%`,
                      background: e.color, height: 10, borderRadius: 8, transition: 'width 0.6s'
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Intent + Suggestion */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-card" style={{ margin: 0 }}>
                <h3>🎯 Detected Intent</h3>
                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, marginTop: 10 }}>
                  {result.intent}
                </p>
              </div>
              <div className="form-card" style={{ margin: 0, borderLeft: '4px solid #7c83fd' }}>
                <h3>💡 Caregiver Suggestion</h3>
                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, marginTop: 10 }}>
                  {result.caregiver_suggestion}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}