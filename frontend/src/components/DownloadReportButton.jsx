import { useState } from 'react'

const API = 'http://localhost:5000/api'

export default function DownloadReportButton({ userId, userName }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleDownload = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/report/${userId}`)
      if (!res.ok) throw new Error('Failed to generate report')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `CognitiveTwin_${(userName || userId).replace(' ','_')}_Report.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError('Could not generate PDF. Is the Flask server running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={handleDownload}
        disabled={loading}
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      >
        {loading ? (
          <>
            <span style={{ display:'inline-block', width:14, height:14,
              border:'2px solid rgba(255,255,255,0.4)',
              borderTopColor:'white', borderRadius:'50%',
              animation:'spin 0.7s linear infinite' }} />
            Generating PDF…
          </>
        ) : (
          <> 📄 Download Patient Report </>
        )}
      </button>
      {error && (
        <div className="alert alert-error" style={{ marginTop: 10, fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
