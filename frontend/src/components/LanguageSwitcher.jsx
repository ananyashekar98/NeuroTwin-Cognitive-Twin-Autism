import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'hi', label: 'हि', full: 'Hindi' },
  { code: 'te', label: 'తె', full: 'Telugu' },
  { code: 'kn', label: 'ಕ', full: 'Kannada' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div style={{ display:'flex', gap:6, padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.08)', flexWrap:'wrap' }}>
      {LANGUAGES.map(lang => (
        <button key={lang.code} onClick={() => i18n.changeLanguage(lang.code)}
          title={lang.full}
          style={{
            flex: 1, padding:'6px 4px', borderRadius:8, border:'none', cursor:'pointer',
            fontSize: 13, fontWeight: 700,
            background: i18n.language === lang.code ? '#7c83fd' : 'rgba(255,255,255,0.08)',
            color: i18n.language === lang.code ? '#fff' : '#aaa',
            transition: 'all 0.2s'
          }}>
          {lang.label}
        </button>
      ))}
    </div>
  )
}