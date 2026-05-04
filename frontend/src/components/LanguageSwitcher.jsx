import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'English',     flag: '🇬🇧', native: 'English' },
  { code: 'hi', label: 'Hindi',       flag: '🇮🇳', native: 'हिंदी' },
  { code: 'te', label: 'Telugu',      flag: '🇮🇳', native: 'తెలుగు' },
  { code: 'kn', label: 'Kannada',     flag: '🇮🇳', native: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'Tamil',       flag: '🇮🇳', native: 'தமிழ்' },
  { code: 'ml', label: 'Malayalam',   flag: '🇮🇳', native: 'മലയാളം' },
  { code: 'mr', label: 'Marathi',     flag: '🇮🇳', native: 'मराठी' },
  { code: 'gu', label: 'Gujarati',    flag: '🇮🇳', native: 'ગુજરાતી' },
  { code: 'bn', label: 'Bengali',     flag: '🇧🇩', native: 'বাংলা' },
  { code: 'pa', label: 'Punjabi',     flag: '🇮🇳', native: 'ਪੰਜਾਬੀ' },
  { code: 'ur', label: 'Urdu',        flag: '🇵🇰', native: 'اردو' },
  { code: 'es', label: 'Spanish',     flag: '🇪🇸', native: 'Español' },
  { code: 'fr', label: 'French',      flag: '🇫🇷', native: 'Français' },
  { code: 'de', label: 'German',      flag: '🇩🇪', native: 'Deutsch' },
  { code: 'ar', label: 'Arabic',      flag: '🇸🇦', native: 'العربية' },
  { code: 'zh', label: 'Chinese',     flag: '🇨🇳', native: '中文' },
  { code: 'ja', label: 'Japanese',    flag: '🇯🇵', native: '日本語' },
  { code: 'ko', label: 'Korean',      flag: '🇰🇷', native: '한국어' },
  { code: 'pt', label: 'Portuguese',  flag: '🇧🇷', native: 'Português' },
  { code: 'ru', label: 'Russian',     flag: '🇷🇺', native: 'Русский' },
  { code: 'it', label: 'Italian',     flag: '🇮🇹', native: 'Italiano' },
  { code: 'tr', label: 'Turkish',     flag: '🇹🇷', native: 'Türkçe' },
  { code: 'vi', label: 'Vietnamese',  flag: '🇻🇳', native: 'Tiếng Việt' },
  { code: 'th', label: 'Thai',        flag: '🇹🇭', native: 'ภาษาไทย' },
  { code: 'id', label: 'Indonesian',  flag: '🇮🇩', native: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Malay',       flag: '🇲🇾', native: 'Bahasa Melayu' },
  { code: 'sw', label: 'Swahili',     flag: '🇰🇪', native: 'Kiswahili' },
  { code: 'nl', label: 'Dutch',       flag: '🇳🇱', native: 'Nederlands' },
]

export default function LanguageSwitcher({ position = 'up' }) {
  const { i18n } = useTranslation()
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')

  const current  = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0]
  const filtered = LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(search.toLowerCase()) ||
    l.native.toLowerCase().includes(search.toLowerCase())
  )

  const select = (code) => {
    i18n.changeLanguage(code)
    setOpen(false)
    setSearch('')
  }

  // dropdown opens UP in sidebar, DOWN on login page
  const dropdownStyle = position === 'down'
    ? { top: '110%', bottom: 'auto' }
    : { bottom: '110%', top: 'auto' }

  return (
    <div style={{ position: 'relative' }}>

      {/* Trigger button */}
      <button onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: 10,
          border: position === 'down' ? '1px solid rgba(255,255,255,0.3)' : 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: position === 'down'
            ? 'rgba(255,255,255,0.15)'
            : 'rgba(255,255,255,0.08)',
          color: '#fff', fontSize: 13, fontWeight: 600,
          transition: 'all 0.2s',
          backdropFilter: position === 'down' ? 'blur(10px)' : 'none',
        }}>
        <span>{current.flag} {current.native}</span>
        <span style={{ fontSize: 10, opacity: 0.7 }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div onClick={() => { setOpen(false); setSearch('') }}
            style={{ position: 'fixed', inset: 0, zIndex: 998 }} />

          <div style={{
            position: 'absolute',
            ...dropdownStyle,
            left: 0, right: 0,
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 9999,
            minWidth: 200,
          }}>
            {/* Search */}
            <div style={{ padding: '10px 10px 6px' }}>
              <input
                autoFocus
                placeholder="🔍 Search language..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff', fontSize: 12, outline: 'none',
                }}
              />
            </div>

            {/* List */}
            <div style={{
              maxHeight: 260, overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(124,131,253,0.3) transparent'
            }}>
              {filtered.length > 0 ? filtered.map(lang => (
                <button key={lang.code} onClick={() => select(lang.code)}
                  style={{
                    width: '100%', padding: '9px 14px',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: i18n.language === lang.code
                      ? 'rgba(124,131,253,0.25)' : 'transparent',
                    color: i18n.language === lang.code ? '#7c83fd' : '#ccc',
                    fontSize: 13,
                    fontWeight: i18n.language === lang.code ? 700 : 400,
                    textAlign: 'left',
                    borderLeft: i18n.language === lang.code
                      ? '3px solid #7c83fd' : '3px solid transparent',
                  }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{lang.flag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13 }}>{lang.native}</div>
                    <div style={{ fontSize: 10, opacity: 0.5 }}>{lang.label}</div>
                  </div>
                  {i18n.language === lang.code &&
                    <span style={{ color: '#7c83fd', fontSize: 14 }}>✓</span>}
                </button>
              )) : (
                <div style={{ padding: 16, textAlign: 'center', color: '#666', fontSize: 13 }}>
                  No language found
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '6px 14px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              fontSize: 11, color: '#555', textAlign: 'center'
            }}>
              {LANGUAGES.length} languages available
            </div>
          </div>
        </>
      )}
    </div>
  )
}