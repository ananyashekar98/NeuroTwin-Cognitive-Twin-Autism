import { useState, useRef } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

const API = 'http://localhost:5000/api'
const EMOTIONS = [
  { label:'Frustration', key:'frustration', color:'#ef4444' },
  { label:'Anxiety',     key:'anxiety',     color:'#f59e0b' },
  { label:'Happiness',   key:'happiness',   color:'#22c55e' },
  { label:'Sadness',     key:'sadness',     color:'#3b82f6' },
  { label:'Calm',        key:'calm',        color:'#8b5cf6' },
]
const ALERT_COLORS = { low:'#22c55e', medium:'#f59e0b', high:'#ef4444' }
const ALERT_BG     = { low:'#f0fdf4', medium:'#fffbeb', high:'#fef2f2' }
const samples = [
  "I don't want to go! It's too loud and I hate it there!",
  "I like playing with my toys. It was a good day today.",
  "I'm scared. Please don't make me go. I feel sick.",
  "Everyone always says fine but nothing is ever fine.",
  "I need my headphones. The noise is too much right now.",
]

export default function TextAnalyzer() {
  const { t } = useTranslation()
  const [text, setText]         = useState('')
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)

  // ── Voice Input ──────────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Please use Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => setListening(true)

    recognition.onresult = (event) => {
      let interim = ''
      let final   = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }
      setTranscript(interim)
      if (final) setText(prev => (prev + ' ' + final).trim())
    }

    recognition.onerror = (e) => {
      setError(`Microphone error: ${e.error}`)
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
      setTranscript('')
    }

    recognition.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
    setTranscript('')
  }

  const toggleVoice = () => {
    if (listening) stopListening()
    else startListening()
  }

  // ── Analysis ─────────────────────────────────────────────────
  const analyze = async () => {
    if (!text.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const { data } = await axios.post(`${API}/text/analyze`, { text })
      setResult(data)
    } catch (err) { setError(err.response?.data?.error || 'Analysis failed') }
    setLoading(false)
  }

  const clearAll = () => { setText(''); setResult(null); setError(''); setTranscript('') }

  return (
    <div>
      <div className="page-header">
        <h1>💬 {t('textTitle')}</h1>
        <p>{t('textSubtitle')}</p>
      </div>

      <div className="form-card">
        <h3>{t('enterText')}</h3>

        {/* Text area with live transcript overlay */}
        <div style={{ position:'relative', marginBottom:16 }}>
          <textarea
            rows="5"
            placeholder={listening ? '🎤 Listening... speak now' : t('textPlaceholder')}
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ width:'100%', paddingBottom: transcript ? 36 : 14, transition:'padding 0.2s', border: listening ? '2px solid #ef4444' : '1.5px solid #e5e7eb', borderRadius:10, padding:'10px 14px', fontSize:14, outline:'none', fontFamily:'inherit', resize:'vertical' }}
          />
          {/* Live interim transcript */}
          {transcript && (
            <div style={{ position:'absolute', bottom:10, left:14, right:14, fontSize:13, color:'#ef4444', fontStyle:'italic', background:'rgba(255,255,255,0.9)', borderRadius:6, padding:'2px 6px' }}>
              🎤 {transcript}...
            </div>
          )}
        </div>

        {/* Voice button + mic animation */}
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16, flexWrap:'wrap' }}>

          {/* Mic button */}
          <button onClick={toggleVoice}
            style={{
              padding:'12px 20px', borderRadius:12, border:'none', cursor:'pointer',
              fontWeight:700, fontSize:14, display:'flex', alignItems:'center', gap:8,
              background: listening ? '#fef2f2' : '#f3f4f6',
              color: listening ? '#ef4444' : '#444',
              boxShadow: listening ? '0 0 0 3px rgba(239,68,68,0.2)' : 'none',
              transition:'all 0.2s',
              animation: listening ? 'pulse 1.5s infinite' : 'none'
            }}>
            {listening ? (
              <>
                <span style={{ fontSize:20 }}>⏹</span> Stop Recording
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#ef4444', display:'inline-block', animation:'blink 1s infinite' }} />
              </>
            ) : (
              <>
                <span style={{ fontSize:20 }}>🎤</span> Speak
              </>
            )}
          </button>

          {/* Word count */}
          {text && (
            <span style={{ fontSize:12, color:'#888' }}>
              {text.split(' ').filter(Boolean).length} words
            </span>
          )}

          {/* Clear button */}
          {text && (
            <button onClick={clearAll} style={{ padding:'8px 14px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#fff', color:'#888', fontSize:13, cursor:'pointer' }}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* Mic instructions */}
        {!listening && (
          <div style={{ background:'#f0f4ff', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, color:'#555' }}>
            💡 <strong>Tip:</strong> Click <strong>Speak</strong> and talk — your speech will appear in the text box automatically. Works best in Chrome browser.
          </div>
        )}

        {/* Listening indicator */}
        {listening && (
          <div style={{ background:'#fef2f2', borderRadius:10, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ display:'flex', gap:4 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  width:4, height:16, borderRadius:2, background:'#ef4444',
                  animation:`soundwave 0.8s ease-in-out ${i*0.15}s infinite alternate`
                }} />
              ))}
            </div>
            <span style={{ color:'#ef4444', fontWeight:600, fontSize:14 }}>Recording... speak clearly</span>
            <span style={{ marginLeft:'auto', fontSize:12, color:'#888' }}>Click Stop when done</span>
          </div>
        )}

        {/* Sample buttons */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
          <span style={{ fontSize:13, color:'#888', alignSelf:'center' }}>{t('trySample')}:</span>
          {samples.map((s,i) => (
            <button key={i} className="btn"
              style={{ background:'#f3f4f6', fontSize:12, padding:'6px 12px' }}
              onClick={() => { setText(s); setResult(null) }}>
              Sample {i+1}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom:12 }}>{error}</div>}

        <button className="btn btn-primary" onClick={analyze} disabled={loading || !text.trim()}>
          {loading ? t('analyzing') : t('analyzeBtn')}
        </button>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes soundwave {
          from { transform: scaleY(0.4); opacity: 0.6; }
          to   { transform: scaleY(1.4); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(239,68,68,0.2); }
          50%       { box-shadow: 0 0 0 8px rgba(239,68,68,0.1); }
        }
      `}</style>

      {/* Results */}
      {result && (
        <>
          <div className="alert" style={{
            background: ALERT_BG[result.alert_level],
            color: ALERT_COLORS[result.alert_level],
            border: `1px solid ${ALERT_COLORS[result.alert_level]}`,
            marginBottom:20, fontSize:15, fontWeight:600
          }}>
            🚨 {t('alertLevel')}: {result.alert_level?.toUpperCase()}
            {result.sarcasm_detected && <span style={{ marginLeft:16, fontWeight:400 }}>⚠️ {t('sarcasmDetected')}</span>}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
            <div className="form-card" style={{ margin:0 }}>
              <h3>📊 {t('emotionScores')}</h3>
              <p style={{ fontSize:13, color:'#888', marginBottom:16 }}>
                {t('dominant')}: <strong style={{ color:'#7c83fd' }}>{result.dominant_emotion}</strong>
              </p>
              {EMOTIONS.map(e => (
                <div key={e.key} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:500 }}>{e.label}</span>
                    <span style={{ fontSize:14, color:e.color, fontWeight:600 }}>{result.emotions?.[e.key]??0}%</span>
                  </div>
                  <div style={{ background:'#f3f4f6', borderRadius:8, height:10 }}>
                    <div style={{ width:`${result.emotions?.[e.key]??0}%`, background:e.color, height:10, borderRadius:8, transition:'width 0.6s' }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="form-card" style={{ margin:0 }}>
                <h3>🎯 {t('detectedIntent')}</h3>
                <p style={{ fontSize:14, color:'#444', lineHeight:1.6, marginTop:10 }}>{result.intent}</p>
              </div>
              <div className="form-card" style={{ margin:0, borderLeft:'4px solid #7c83fd' }}>
                <h3>💡 {t('caregiverSuggestion')}</h3>
                <p style={{ fontSize:14, color:'#444', lineHeight:1.6, marginTop:10 }}>{result.caregiver_suggestion}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}