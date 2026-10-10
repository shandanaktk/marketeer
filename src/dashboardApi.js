const MAIN_API = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')
const ADS_API = import.meta.env.VITE_META_ADS_API_BASE_URL?.replace(/\/$/, '')

const token = () => window.localStorage.getItem('access_token')

export const dashboardApiReady = (service = 'main') => {
  const base = service === 'ads' ? ADS_API : MAIN_API
  return Boolean(base && token())
}

async function request(base, path, options = {}) {
  if (!base) throw new Error('This backend is not configured yet.')

  const headers = new Headers(options.headers || {})
  const accessToken = token()
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${base}${path}`, {
    ...options,
    headers,
    body: options.body && !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : options.body,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const error = await response.json()
      message = error?.detail?.message || error?.detail || error?.message || message
    } catch {
      // The status message is enough for a non-JSON response.
    }
    throw new Error(typeof message === 'string' ? message : 'Something went wrong.')
  }

  if (response.status === 204) return {}
  return response.json().catch(() => ({}))
}

const get = (base, path) => request(base, path)
const post = (base, path, body) => request(base, path, { method: 'POST', body })

export async function loadAdsAssets() {
  const connections = await get(ADS_API, '/api/v1/meta/ads/connections')
  const connection = Array.isArray(connections) ? connections[0] : connections?.data?.[0]
  if (!connection) return { connections: [], pages: [], adAccounts: [] }

  const id = connection.connection_id || connection.id
  const query = id ? `?connection_id=${encodeURIComponent(id)}` : ''
  const [pages, accounts] = await Promise.all([
    get(ADS_API, `/api/v1/meta/ads/pages${query}`),
    get(ADS_API, `/api/v1/meta/ads/ad-accounts${query}`),
  ])

  return {
    connections: Array.isArray(connections) ? connections : connections?.data || [],
    pages: Array.isArray(pages) ? pages : pages?.data || [],
    adAccounts: Array.isArray(accounts) ? accounts : accounts?.data || [],
  }
}

export async function connectMetaAds() {
  const result = await post(ADS_API, '/api/v1/meta/ads/auth/init')
  if (result.authorization_url) window.location.assign(result.authorization_url)
  return result
}

export async function generateAdDraft({ adAccountId, pageId, prompt, url }) {
  const payload = {
    ad_account_id: adAccountId,
    page_id: pageId,
    campaigns_limit: 10,
    listings_limit: 10,
    insights_date_preset: 'last_14d',
    ...(prompt && { user_prompt: prompt }),
    ...(url && { promote_url: url }),
  }
  const job = await post(ADS_API, '/api/v1/meta/ads/automation/draft/start', payload)
  if (!job.job_id) return job

  for (let attempt = 0; attempt < 40; attempt += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 1000))
    const status = await get(
      ADS_API,
      `/api/v1/meta/ads/automation/draft/status?job_id=${encodeURIComponent(job.job_id)}`,
    )
    if (status.done || status.status === 'done') return status.result || status
    if (status.status === 'error') throw new Error(status.error || 'Draft generation failed.')
  }
  throw new Error('Draft generation is taking longer than expected. Please try again.')
}

export function approveAdDraft(payload) {
  return post(ADS_API, '/api/v1/meta/ads/automation/approve', payload)
}

export async function connectSocialPlatform(platform) {
  const endpoint = platform === 'instagram'
    ? '/api/v1/meta/instagram/auth/init'
    : platform === 'tiktok'
      ? '/api/v1/tiktok/auth/init'
      : '/api/v1/meta/content/auth/init'
  const result = await post(MAIN_API, endpoint, { platform })
  if (result.authorization_url) window.location.assign(result.authorization_url)
  return result
}

export async function generateSocialContent({ format, prompt, pageId }) {
  const response = await post(MAIN_API, '/api/v1/meta/content/automation/generate-specific', {
    post_type: format === 'post' ? 'photo' : format,
    ...(prompt && { prompt }),
    ...(pageId && { page_id: pageId }),
  })
  return response.data || response
}

export function publishSocialContent({ platforms, format, caption, mode, scheduledAt, media }) {
  const query = new URLSearchParams({
    platforms: platforms.join(','),
    content_format: format,
    caption,
    mode,
    ...(scheduledAt && { scheduled_publish_at: scheduledAt }),
  })
  const form = new FormData()
  if (media) form.append('media', media)
  return post(MAIN_API, `/api/v1/meta/content/publish?${query}`, form)
}

export async function loadSocialLibrary(kind = 'drafts') {
  const endpoint = kind === 'scheduled' ? 'scheduled' : 'drafts'
  const response = await get(MAIN_API, `/api/v1/meta/content/${endpoint}?limit=100`)
  return response.data || []
}
