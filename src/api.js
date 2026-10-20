// The one network layer for the app. Every screen talks to the Marketeer API
// through these functions; nothing renders placeholder records.
import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_CURRENCY, TIMEZONE, formatDate, locale, t } from './i18n.js'

// Local Vite proxies `/api` to the deployed backend so the browser is not blocked by CORS.
export const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '')

function resolveUrl(path) {
  return API_BASE ? new URL(`${API_BASE}${path}`) : new URL(path, window.location.origin)
}

const ACCESS = 'access_token'
const REFRESH = 'refresh_token'

export const session = {
  access: () => window.localStorage.getItem(ACCESS),
  refresh: () => window.localStorage.getItem(REFRESH),
  store({ access_token: access, refresh_token: refresh }) {
    if (access) window.localStorage.setItem(ACCESS, access)
    if (refresh) window.localStorage.setItem(REFRESH, refresh)
  },
  clear() {
    window.localStorage.removeItem(ACCESS)
    window.localStorage.removeItem(REFRESH)
  },
  active: () => Boolean(window.localStorage.getItem(ACCESS) || window.localStorage.getItem(REFRESH)),
}

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message)
    this.status = status
    this.detail = detail
  }
}

function messageOf(body, status) {
  const detail = body?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((item) => item?.msg?.replace(/^Value error, /, '')).filter(Boolean).join(' ') || 'Check the highlighted details.'
  if (detail?.message) {
    const text = detail.title ? `${detail.title}: ${detail.message}` : detail.message
    return detail.while ? `${text} (while ${detail.while})` : text
  }
  return body?.message || `Request failed (${status})`
}

let refreshing = null
async function refreshSession() {
  const token = session.refresh()
  if (!token) return false
  refreshing = refreshing || fetch(resolveUrl('/api/v1/auth/refresh'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: token }),
  }).then(async (response) => {
    if (!response.ok) return false
    session.store(await response.json())
    return true
  }).catch(() => false).finally(() => { setTimeout(() => { refreshing = null }, 0) })
  return refreshing
}

function expireSession() {
  session.clear()
  const view = new URLSearchParams(window.location.search).get('view')
  if (view === 'dashboard' || view === 'onboarding') window.location.replace(`${window.location.pathname}?view=signin&expired=1`)
}

export async function request(path, { method = 'GET', body, query, auth = true, retry = true, raw = false } = {}) {
  if (!API_BASE && !import.meta.env.DEV) throw new ApiError('The API address is not configured (VITE_API_BASE_URL).', 0)
  const url = resolveUrl(path)
  Object.entries(query || {}).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value) })
  const headers = new Headers()
  const token = session.access()
  if (auth && token) headers.set('Authorization', `Bearer ${token}`)
  const isForm = body instanceof FormData
  if (body !== undefined && !isForm) headers.set('Content-Type', 'application/json')
  let response
  try {
    response = await fetch(url, { method, headers, body: body === undefined ? undefined : isForm ? body : JSON.stringify(body) })
  } catch {
    throw new ApiError('Could not reach Marketeer. Check your connection and try again.', 0)
  }
  if (response.status === 401 && auth && retry && session.refresh()) {
    if (await refreshSession()) return request(path, { method, body, query, auth, retry: false, raw })
    expireSession()
  }
  if (!response.ok) {
    let parsed = null
    try { parsed = await response.json() } catch { /* not JSON */ }
    if (response.status === 401 && auth) expireSession()
    throw new ApiError(messageOf(parsed, response.status), response.status, parsed?.detail)
  }
  if (raw) return response
  if (response.status === 204) return {}
  return response.json().catch(() => ({}))
}

const get = (path, query) => request(path, { query })
const post = (path, body, query) => request(path, { method: 'POST', body, query })
const put = (path, body, query) => request(path, { method: 'PUT', body, query })
const patch = (path, body) => request(path, { method: 'PATCH', body })
const del = (path) => request(path, { method: 'DELETE' })
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

// ── Accounts ────────────────────────────────────────────────────────────────
export async function signup({ name, email, password }) {
  const result = await request('/api/v1/auth/signup', { method: 'POST', body: { name, email, password }, auth: false })
  session.store(result)
  return result.user
}
export async function login({ email, password }) {
  const result = await request('/api/v1/auth/login', { method: 'POST', body: { email, password }, auth: false })
  session.store(result)
  return result.user
}
export async function logout() {
  const refresh = session.refresh()
  try { if (refresh) await request('/api/v1/auth/logout', { method: 'POST', body: { refresh_token: refresh }, auth: false }) } catch { /* the local session is cleared regardless */ }
  session.clear()
}
export const getMe = () => get('/api/v1/auth/me')
export const updateMe = (body) => patch('/api/v1/auth/me', body)
export async function startSocialLogin(provider, intent = 'signin') {
  const { authorization_url: url } = await request(`/api/v1/auth/oauth/${provider}/start`, { query: { intent }, auth: false })
  window.location.assign(url)
}
export async function linkSocialLogin(provider) {
  const { authorization_url: url } = await post(`/api/v1/auth/oauth/${provider}/link`)
  window.location.assign(url)
}

// ── Onboarding ──────────────────────────────────────────────────────────────
export const getOnboarding = () => get('/api/v1/onboarding')
export const saveOnboarding = (step, data) => put('/api/v1/onboarding', { step, data })
export const completeOnboarding = (data) => post('/api/v1/onboarding/complete', { data })
export const scanWebsite = (url) => post('/api/v1/onboarding/scan-website', { url })

// ── Workspace ───────────────────────────────────────────────────────────────
export function uploadMedia(file) {
  const form = new FormData()
  form.append('file', file)
  return post('/api/v1/media', form)
}
export const getKnowledge = () => get('/api/v1/knowledge-base')
export const saveKnowledge = (data) => put('/api/v1/knowledge-base', { data })
export const getSettings = () => get('/api/v1/settings')
export const saveSettings = (body) => put('/api/v1/settings', body)
export const getNotifications = () => get('/api/v1/notifications')
export const markNotificationsRead = (ids) => post('/api/v1/notifications/read', { ids })
export const getOverview = () => get('/api/v1/dashboard/overview')

// ── Vacancies ───────────────────────────────────────────────────────────────
export const listVacancies = () => get('/api/v1/vacancies')
export const createVacancy = (body) => post('/api/v1/vacancies', body)
export const updateVacancy = (id, body) => put(`/api/v1/vacancies/${id}`, body)
export const deleteVacancy = (id) => del(`/api/v1/vacancies/${id}`)

// ── Content Studio ──────────────────────────────────────────────────────────
export const fixPrompt = (prompt) => post('/api/v1/content/prompt/fix', { prompt }).then((result) => result.prompt)
export const rewriteCaption = (caption, tone, format) => post('/api/v1/content/caption/rewrite', { caption, tone, format }).then((result) => result.caption)
export const suggestHashtags = (caption) => post('/api/v1/content/hashtags', { caption }).then((result) => result.hashtags || [])
export const renderCreative = (body) => post('/api/v1/content/creative/render', body)
export const newBackground = (body) => post('/api/v1/content/creative/background', body)
export const listPosts = (query) => get('/api/v1/content/posts', query)
export const savePost = (body, id) => (id ? put(`/api/v1/content/posts/${id}`, body) : post('/api/v1/content/posts', body))
export const publishPost = (id) => post(`/api/v1/content/posts/${id}/publish`)
export const deletePost = (id) => del(`/api/v1/content/posts/${id}`)

async function pollJob(path, onProgress, { interval = 2000, attempts = 300 } = {}) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const status = await get(path)
    onProgress?.(status)
    if (status.done) {
      if (status.status === 'error') throw new ApiError(status.error || 'Something went wrong.', 500)
      return status
    }
    await wait(interval)
  }
  throw new ApiError('This is taking longer than expected. Please try again.', 504)
}

export async function generateContent(body, onProgress) {
  const { job_id: jobId } = await post('/api/v1/content/generate', body)
  return pollJob(`/api/v1/content/jobs/${jobId}`, onProgress)
}

// ── Publishing channels ─────────────────────────────────────────────────────
export const getChannels = () => get('/api/v1/social/channels')
export async function connectChannel(platform, returnTo = 'connections') {
  const { authorization_url: url } = await post('/api/v1/social/auth/init', { platform, return_to: returnTo })
  window.location.assign(url)
}
export const selectChannel = (platform, pageId) => put(`/api/v1/social/channels/${platform}`, { page_id: pageId })
export const disconnectChannel = (platform) => del(`/api/v1/social/channels/${platform}`)

// ── Meta Ads ────────────────────────────────────────────────────────────────
export const getAdsStatus = () => get('/api/v1/meta/ads/status')
export async function connectMetaAds() {
  const { authorization_url: url } = await post('/api/v1/meta/ads/auth/init')
  window.location.assign(url)
}
export const refreshMetaAds = (connectionId) => post(`/api/v1/meta/ads/connections/${connectionId}/refresh`)
export const disconnectMetaAds = () => post('/api/v1/meta/ads/disconnect')
export const setAdsSelection = (body) => put('/api/v1/meta/ads/selection', body)
export const getCampaignTable = ({ level = 'campaign', datePreset = 'last_14d', refresh = false } = {}) => get('/api/v1/meta/ads/table', { level, date_preset: datePreset, refresh: refresh || undefined })
export const updateEntity = (id, body) => patch(`/api/v1/meta/ads/entities/${id}`, body)
export const getDaily = ({ datePreset = 'last_14d', campaignId } = {}) => get('/api/v1/meta/ads/daily', { date_preset: datePreset, campaign_id: campaignId })
export const getReporting = ({ datePreset = 'last_30d', refresh = false } = {}) => get('/api/v1/reporting', { date_preset: datePreset, refresh: refresh || undefined })
export const getLeads = () => get('/api/v1/leads')
export const updateLead = (id, body) => patch(`/api/v1/leads/${id}`, body)
export const syncLeads = () => post('/api/v1/leads/sync')
export const getOptimize = ({ folderId, refresh } = {}) => get('/api/v1/meta/ads/optimize', { folder_id: folderId, refresh: refresh || undefined })
export const setOptimizeMode = (mode) => post('/api/v1/meta/ads/optimize/mode', { mode })
export const saveAutomation = (body) => put('/api/v1/meta/ads/optimize/automation', body)
export const getOptimizeHistory = () => get('/api/v1/meta/ads/optimize/history')
export const applyOptimizations = (adAccountId, ids, folderId) => post('/api/v1/meta/ads/optimization/apply', { ad_account_id: adAccountId, adset_ids: ids, folder_id: folderId || null })
export const undoOptimization = (auditId) => post('/api/v1/meta/ads/optimization/undo', { audit_id: auditId })
export const createOptimizationFolder = (body) => post('/api/v1/meta/ads/optimization/folders', body)

export const getStudioBrand = () => get('/api/v1/meta/ads/studio/brand')
export const saveBrandRules = (body) => put('/api/v1/meta/ads/studio/brand/rules', body)
export const getPagePosts = (pageId) => get('/api/v1/meta/ads/studio/page-posts', { page_id: pageId })
export const getTemplates = () => get('/api/v1/meta/ads/studio/templates')
export const deleteTemplate = (id) => del(`/api/v1/meta/ads/studio/templates/${id}`)
export const getLaunches = () => get('/api/v1/meta/ads/studio/launches')
export const getCreativeAssets = (folder) => get('/api/v1/meta/ads/studio/assets', { folder })
export const moveCreativeAsset = (id, folder) => request(`/api/v1/meta/ads/studio/assets/${id}`, { method: 'PUT', query: { folder } })
export const deleteCreativeAsset = (id) => del(`/api/v1/meta/ads/studio/assets/${id}`)
export async function startCampaignPlan(body) {
  const { job_id: jobId } = await post('/api/v1/meta/ads/studio/generate', body)
  return jobId
}
export const getStudioJob = (jobId) => get(`/api/v1/meta/ads/studio/jobs/${jobId}`)
export const pollStudioJob = (jobId, onProgress) => pollJob(`/api/v1/meta/ads/studio/jobs/${jobId}`, onProgress, { interval: 1500 })
export const regenerateCopy = (body) => post('/api/v1/meta/ads/studio/regenerate/copy', body)
export const regenerateImage = (body) => post('/api/v1/meta/ads/studio/regenerate/image', body)
export function uploadStudioImage(file, jobId) {
  const form = new FormData()
  form.append('file', file)
  if (jobId) form.append('job_id', jobId)
  return post('/api/v1/meta/ads/studio/assets/upload', form)
}
export async function launchCampaign(body, onProgress) {
  const { job_id: jobId } = await post('/api/v1/meta/ads/studio/launch', body)
  return pollJob(`/api/v1/meta/ads/studio/jobs/${jobId}`, onProgress, { interval: 1500 })
}

// ── Hooks ───────────────────────────────────────────────────────────────────
export function useResource(loader, deps = []) {
  const [state, setState] = useState({ data: undefined, error: null, loading: true })
  const latest = useRef(0)
  const load = useCallback(async (options) => {
    const ticket = latest.current + 1
    latest.current = ticket
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const data = await loader(options)
      if (latest.current === ticket) setState({ data, error: null, loading: false })
      return data
    } catch (error) {
      if (latest.current === ticket) setState((current) => ({ ...current, error, loading: false }))
      return undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  useEffect(() => { load() }, [load])
  const setData = useCallback((update) => setState((current) => ({ ...current, data: typeof update === 'function' ? update(current.data) : update })), [])
  return { ...state, reload: load, setData }
}

// ── Formatting ──────────────────────────────────────────────────────────────
const SYMBOLS = { USD: '$', EUR: '€', GBP: '£', AUD: 'A$', CAD: 'C$', INR: '₹', JPY: '¥', CHF: 'CHF ' }
export const currencySymbol = (currency = DEFAULT_CURRENCY) => SYMBOLS[currency] || `${currency} `
export function money(value, currency = DEFAULT_CURRENCY, digits = 2) {
  const amount = Number(value || 0)
  try {
    return new Intl.NumberFormat(locale(), { style: 'currency', currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(amount)
  } catch {
    return `${currencySymbol(currency)}${amount.toLocaleString(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
  }
}
export function compact(value) {
  const number = Number(value || 0)
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}M`
  if (number >= 1_000) return `${(number / 1_000).toFixed(1)}K`
  return number.toLocaleString()
}
export function relativeTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  const minutes = Math.round((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return t('just now')
  if (minutes < 60) return t('{n} min ago', { n: minutes })
  const hours = Math.round(minutes / 60)
  if (hours < 24) return t('{n} hr ago', { n: hours })
  if (hours < 48) return t('Yesterday')
  return formatDate(date, { month: 'short', day: 'numeric' })
}
function zurichParts(date, options) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TIMEZONE, hour12: false, ...options }).formatToParts(date)
}
export const isoDay = (date) => {
  const parts = Object.fromEntries(zurichParts(date, { year: 'numeric', month: '2-digit', day: '2-digit' }).map((part) => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}
export const timeLabel = (date) => formatDate(date, { hour: '2-digit', minute: '2-digit' })
export const time24 = (date) => {
  const parts = Object.fromEntries(zurichParts(date, { hour: '2-digit', minute: '2-digit' }).map((part) => [part.type, part.value]))
  return `${parts.hour}:${parts.minute}`
}
export const initialsOf = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'M'
export const deltaText = (value, suffix = '%') => (value === null || value === undefined ? 'No prior period' : `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(1)}${suffix}`)

// A post record from the API, with the date/time fields the library and calendar render.
export function toPostRecord(post) {
  const when = post.scheduled_at || post.published_at
  const date = when ? new Date(when) : null
  return {
    ...post,
    date: date ? isoDay(date) : null,
    time: date ? timeLabel(date) : null,
    time24: date ? time24(date) : null,
  }
}
