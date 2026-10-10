import { useEffect, useState } from 'react'

/* eslint-disable react-refresh/only-export-components */

function preferredTheme() {
  const saved = window.localStorage.getItem('marketeer-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState(preferredTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem('marketeer-theme', theme)
  }, [theme])

  return [theme, () => setTheme((current) => current === 'dark' ? 'light' : 'dark')]
}

function ThemeGlyph({ theme }) {
  if (theme === 'dark') {
    return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  }
  return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15.2 14.6A6.1 6.1 0 0 1 9.4 4.8 6.5 6.5 0 1 0 15.2 14.6Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
}

export function ThemeButton({ theme, onToggle, className = '' }) {
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button className={`theme-button ${className}`} type="button" onClick={onToggle} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      <span aria-hidden="true"><ThemeGlyph theme={theme} /></span>
      <small>{theme === 'dark' ? 'Light' : 'Dark'}</small>
    </button>
  )
}
