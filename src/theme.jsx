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

export function ThemeButton({ theme, onToggle, className = '' }) {
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button className={`theme-button ${className}`} type="button" onClick={onToggle} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '◐'}</span>
      <small>{theme === 'dark' ? 'Light' : 'Dark'}</small>
    </button>
  )
}
