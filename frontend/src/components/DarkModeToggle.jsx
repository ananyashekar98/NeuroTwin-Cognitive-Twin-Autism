import { useEffect, useState } from 'react'

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <button onClick={() => setDark(!dark)}
      style={{
        width:'100%', padding:'8px 12px', borderRadius:10, border:'none',
        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between',
        background: dark ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.05)',
        color: dark ? '#7c83fd' : '#aaa',
        fontSize:13, fontWeight:600, transition:'all 0.2s', marginBottom:8
      }}>
      <span>{dark ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
      <div style={{
        width:36, height:20, borderRadius:10,
        background: dark ? '#7c83fd' : '#4a5568',
        position:'relative', transition:'background 0.3s'
      }}>
        <div style={{
          width:16, height:16, borderRadius:'50%', background:'#fff',
          position:'absolute', top:2,
          left: dark ? 18 : 2,
          transition:'left 0.3s'
        }} />
      </div>
    </button>
  )
}