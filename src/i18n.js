// Lightweight UI translation layer. Source strings are English; `t()` looks the
// string up in the active dictionary and falls back to the key itself, so every
// screen keeps working even before a language is fully translated.
import { createContext, createElement, useContext, useEffect, useState } from 'react'
import de from './locales/de.js'

/* eslint-disable react-refresh/only-export-components */

export const LANGUAGES = [
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'en', label: 'English', short: 'EN' },
]
export const DEFAULT_LANGUAGE = 'de'
export const TIMEZONE = 'Europe/Zurich'
export const DEFAULT_CURRENCY = 'CHF'
export const DEFAULT_COUNTRY = 'Switzerland'
const STORAGE_KEY = 'marketeer-lang'
const DICTIONARIES = { de, en: {} }
const LOCALES = { de: 'de-CH', en: 'en-CH' }

const known = (code) => LANGUAGES.some((item) => item.code === code)

function preferredLanguage() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (known(saved)) return saved
  } catch { /* storage unavailable */ }
  return DEFAULT_LANGUAGE
}

let current = typeof window === 'undefined' ? DEFAULT_LANGUAGE : preferredLanguage()
if (typeof document !== 'undefined') document.documentElement.lang = current

export const getLanguage = () => current
export const locale = () => LOCALES[current] || LOCALES[DEFAULT_LANGUAGE]

function interpolate(text, vars) {
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (match, key) => (vars[key] === undefined || vars[key] === null ? match : String(vars[key])))
}

// Translate a source string. `vars` fills `{name}` placeholders in either language.
export function t(key, vars) {
  if (key === undefined || key === null || key === '') return key
  const text = DICTIONARIES[current]?.[key] ?? key
  return interpolate(text, vars)
}

// Plural helper: t2(count, 'one lead', '{n} leads').
export const tn = (count, one, many) => t(count === 1 ? one : many, { n: formatNumber(count) })

// ── Locale-aware formatting (Swiss conventions, Europe/Zurich) ─────────────
export function formatNumber(value, options) {
  const number = Number(value || 0)
  try { return new Intl.NumberFormat(locale(), options).format(number) } catch { return String(number) }
}

export function formatDate(value, options = { day: 'numeric', month: 'short' }) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  try { return new Intl.DateTimeFormat(locale(), { timeZone: TIMEZONE, ...options }).format(date) } catch { return date.toLocaleDateString() }
}

export const formatTime = (value) => formatDate(value, { hour: '2-digit', minute: '2-digit' })
export const formatDateTime = (value) => formatDate(value, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
export const formatLongDate = (value) => formatDate(value, { weekday: 'long', day: 'numeric', month: 'long' })

export const monthNames = () => Array.from({ length: 12 }, (_, index) => new Intl.DateTimeFormat(locale(), { month: 'long' }).format(new Date(2026, index, 1)))
export const weekdayShort = () => Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale(), { weekday: 'short' }).format(new Date(2026, 5, 1 + index))) // 1 June 2026 is a Monday

// ── React wiring ─────────────────────────────────────────────────────────────
const LanguageContext = createContext({ language: DEFAULT_LANGUAGE, setLanguage: () => {} })

export function LanguageProvider({ children }) {
  const [language, setState] = useState(current)
  // Keep the module-level value in sync during render so `t()` is correct for
  // every component rendered in this pass.
  current = language
  useEffect(() => {
    document.documentElement.lang = language
    try { window.localStorage.setItem(STORAGE_KEY, language) } catch { /* ignore */ }
  }, [language])
  const setLanguage = (next) => { if (known(next)) { current = next; setState(next) } }
  return createElement(LanguageContext.Provider, { value: { language, setLanguage } }, children)
}

export const useLanguage = () => useContext(LanguageContext)

// Compact DE | EN switch used in every top bar.
export function LanguageButton({ className = '' }) {
  const { language, setLanguage } = useLanguage()
  return createElement(
    'div',
    { className: `lang-switch ${className}`, role: 'group', 'aria-label': t('Language') },
    ...LANGUAGES.map((item) => createElement('button', {
      key: item.code,
      type: 'button',
      className: item.code === language ? 'active' : '',
      'aria-pressed': item.code === language,
      lang: item.code,
      title: item.label,
      onClick: () => setLanguage(item.code),
    }, item.short)),
  )
}
