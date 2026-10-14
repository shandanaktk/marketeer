import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdsStudio, CampaignsView, LeadsView, OptimizeView } from './AdsWorkspace.jsx'
import { ContentCalendar, ContentCreate, ContentLibrary } from './ContentWorkspace.jsx'
import {
  connectChannel, connectMetaAds, disconnectChannel, disconnectMetaAds, getAdsStatus, getChannels, getKnowledge, getLeads,
  getNotifications, getOverview, getSettings, initialsOf, logout as endSession, markNotificationsRead, money, refreshMetaAds,
  relativeTime, saveSettings, selectChannel, setAdsSelection, toPostRecord, useResource,
} from './api.js'
import { BrandContext } from './brandContext.js'
import { Badge, Button, ChannelLogo, CreativeArt, ErrorState, Field, Icon, LoadingState, PageIntro, Toggle } from './dashboardUI.jsx'
import { KnowledgeBaseView, ReportingView, VacanciesView } from './SrsWorkspace.jsx'
import { ThemeButton } from './theme.jsx'
import AccountMenu from './AccountMenu.jsx'
import './dashboard.css'
import './dashboardVisuals.css'
import './dashboardOverview.css'
import './dashboardContent.css'
import './dashboardAds.css'
import './dashboardManagement.css'
import './dashboardWorkspace.css'
import './dashboardResponsive.css'
import './dashboardReadable.css'

function Toast({ toast, onClose }) {
  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(onClose, toast.type === 'error' ? 6500 : 3600); return () => window.clearTimeout(timer) }, [toast, onClose])
  if (!toast) return null
  return <div className={`db-toast ${toast.type || ''}`}><span><Icon name={toast.type === 'error' ? 'close' : 'check'} size={15} /></span><p>{toast.message}</p><button onClick={onClose} aria-label="Dismiss"><Icon name="close" size={14} /></button></div>
}

function sparkGeometry(raw) {
  const values = raw && raw.length > 1 ? raw : [0, 0]
  const width = 160
  const height = 52
  const low = Math.min(...values)
  const high = Math.max(...values)
  const span = high - low || 1
  const points = values.map((value, index) => [
    (index / (values.length - 1)) * width,
    8 + (1 - (value - low) / span) * (height - 16),
  ])
  let line = `M${points[0][0]},${points[0][1]}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const prev = points[index - 1] || points[index]
    const current = points[index]
    const next = points[index + 1]
    const after = points[index + 2] || next
    const c1 = [current[0] + (next[0] - prev[0]) / 6, current[1] + (next[1] - prev[1]) / 6]
    const c2 = [next[0] - (after[0] - current[0]) / 6, next[1] - (after[1] - current[1]) / 6]
    line += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${next[0]},${next[1]}`
  }
  return { width, height, line, area: `${line} L${width},${height} L0,${height} Z`, end: points[points.length - 1] }
}

function Sparkline({ id, values }) {
  const { width, height, line, area, end } = sparkGeometry(values)
  return <div className="db-sparkline"><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3e92cc" stopOpacity="0.22" /><stop offset="100%" stopColor="#3e92cc" stopOpacity="0" /></linearGradient></defs><path className="db-spark-fill" d={area} fill={`url(#${id})`} /><path className="db-spark-line" d={line} /></svg><i style={{ top: `${(end[1] / height) * 100}%` }} /></div>
}

function GreetingMark() {
  return <div className="db-overview-orbit db-walker" aria-hidden="true"><img className="db-mascot" src="/mascot/marketeer-m.png" alt="" /></div>
}

function hostnameOf(website) {
  if (!website) return ''
  try { return new URL(website.startsWith('http') ? website : `https://${website}`).hostname.replace(/^www\./, '') } catch { return '' }
}

const greeting = () => { const hour = new Date().getHours(); return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening' }
const channelLogo = (name) => `/social_logos/${String(name).toLowerCase().includes('facebook') ? 'facebook' : 'instagram'}.png`

function Overview({ firstName, onGo, onLeadCount }) {
  const { data, error, loading, reload } = useResource(getOverview)
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  useEffect(() => { if (data) onLeadCount?.(data.new_leads) }, [data, onLeadCount])
  const upcoming = (data?.upcoming || []).map(toPostRecord)
  return <div className="db-page db-overview">
    <section className="db-overview-hero"><div><span className="db-eyebrow"><Icon name="spark" size={14} /> {today}</span><h1>{greeting()}, {firstName}.<br /><em>Let’s make something matter.</em></h1><p>{data?.ads_error ? 'Your content is up to date. Meta Ads needs attention in Connections.' : 'Here is where your paid and organic work stands, and where to focus next.'}</p><div><Button icon="create" onClick={() => onGo('create')}>Create content</Button><Button variant="secondary" icon="ads" onClick={() => onGo('adstudio')}>Build a campaign</Button></div></div><GreetingMark /></section>
    {loading && !data ? <LoadingState label="Loading your command center…" /> : error && !data ? <ErrorState error={error} onRetry={reload} /> : <>
      <section className="db-metric-grid four overview">{data.metrics.map((metric) => <article className={`db-card ${metric.tone}`} key={metric.label}><span className="db-metric-icon"><Icon name={metric.icon} size={18} /></span><small>Last 30 days</small><p>{metric.label}</p><strong>{metric.value}</strong><em>{metric.delta}</em><Sparkline id={`spark-${metric.label.replace(/\s+/g, '-')}`} values={metric.series} /></article>)}</section>
      <div className="db-overview-layout"><section className="db-card db-action-card"><span className="db-eyebrow">Create something</span><h2>Where should we begin?</h2><div><button onClick={() => onGo('adstudio')}><span className="lime"><Icon name="ads" size={22} /></span><div><b>Build a Meta lead campaign</b><small>Strategy, creative, audience, lead form, and launch</small></div><Icon name="arrow" size={18} /></button><button onClick={() => onGo('create')}><span className="blue"><Icon name="create" size={22} /></span><div><b>Create social content</b><small>Prompt, generate, refine, and schedule everywhere</small></div><Icon name="arrow" size={18} /></button></div><div className="db-overview-insight"><Icon name="spark" size={17} /><p><b>Opportunity:</b> {data.insight}</p><Button variant="ghost" onClick={() => onGo('calendar')}>View calendar</Button></div></section>
        <section className="db-card db-live-campaigns"><header><div><span className="db-eyebrow">Live campaigns</span><h2>Performance pulse</h2></div><Button variant="ghost" icon="arrow" onClick={() => onGo('campaigns')}>View all</Button></header>{data.campaigns.length ? data.campaigns.map((campaign) => <button onClick={() => onGo('campaigns')} key={campaign.id}>{campaign.image ? <img className="db-shot" src={campaign.image} alt="" /> : <CreativeArt compact theme={campaign.name.toUpperCase()} />}<div><Badge tone={campaign.status === 'active' ? 'lime' : 'blue'}>{campaign.delivery}</Badge><b>{campaign.name}</b><small>{campaign.objective} · {money(campaign.budget, data.currency, 0)}/day</small></div><span><b>{campaign.leads}</b><small>leads</small></span><span><b>{campaign.leads ? money(campaign.cpl, data.currency) : '—'}</b><small>CPL</small></span></button>) : <p className="db-helper">{data.ads_error || 'No live campaigns yet. Build one from a vacancy to see it here.'}</p>}</section>
        <section className="db-card db-lead-pulse"><header><div><span className="db-eyebrow">Lead activity</span><h2>Fresh conversations</h2></div><Badge tone="blue">{data.new_leads} new</Badge></header>{data.leads.length ? data.leads.map((lead) => <button onClick={() => onGo('leads')} key={lead.id}><span className="db-lead-mark" aria-hidden="true">{initialsOf(lead.name)}</span><div><b>{lead.name}</b><small>{lead.campaign} · {relativeTime(lead.received)}</small></div><img className="db-queue-logo" src={channelLogo(lead.source)} alt="" /><Icon name="arrow" size={15} /></button>) : <p className="db-helper">Lead-form submissions from your Meta campaigns arrive here.</p>}<Button variant="soft" className="full" onClick={() => onGo('leads')}>Open lead center</Button></section>
        <section className="db-card db-upcoming"><header><div><span className="db-eyebrow">Up next</span><h2>Content queue</h2></div><Button variant="ghost" icon="arrow" onClick={() => onGo('calendar')}>Calendar</Button></header>{upcoming.length ? upcoming.map((item) => { const when = new Date(item.scheduled_at); return <button onClick={() => onGo('content')} key={item.id}>{item.image ? <img className="db-shot" src={item.image} alt="" /> : <CreativeArt compact palette={item.palette} theme={item.theme || item.title.toUpperCase()} />}<div><b>{item.title}</b><small>{when.toLocaleString('en-US', { month: 'short', day: 'numeric' })} · {item.time} · {item.format}</small><span>{item.platforms.map((platform) => <img className="db-queue-logo" src={channelLogo(platform)} alt={platform} key={platform} />)}</span></div><Icon name="arrow" size={16} /></button> }) : <p className="db-helper">Nothing scheduled yet. Create a post and pick a time.</p>}</section>
      </div>
    </>}
  </div>
}

function FactSelect({ value, options, onChange, disabled }) {
  if (options.length <= 1) return options[0]?.label || '—'
  return <select className="db-fact-select" value={value || ''} disabled={disabled} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select>
}

function Connections({ ads, onAdsChange, notify }) {
  const [busy, setBusy] = useState('')
  const channels = useResource(getChannels)
  const status = ads.data
  const list = channels.data || []
  const connectedCount = list.filter((item) => item.connected).length

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('social') === 'connected') notify(`${params.get('platform') === 'instagram' ? 'Instagram' : 'Facebook'} connected.`)
    if (params.get('social') === 'error') notify(params.get('message') || 'The connection did not complete.', 'error')
    if (params.get('meta') === 'ads' && params.get('success') === 'true') notify('Meta Ads connected.')
    if (params.get('meta') === 'ads' && params.get('success') === 'false') notify(params.get('error') || 'Meta Ads authorization did not complete.', 'error')
    if (params.get('social') || params.get('meta')) window.history.replaceState({}, '', `${window.location.pathname}?view=dashboard&tab=connections`)
  }, [notify])

  const run = async (key, work, success) => {
    setBusy(key)
    try {
      const result = await work()
      if (success) notify(success)
      return result
    } catch (failure) {
      notify(failure.message, 'error')
      return undefined
    } finally {
      setBusy('')
    }
  }
  const changeChannel = (channel, connect) => run(channel.id, async () => {
    if (connect) return connectChannel(channel.id)
    const next = await disconnectChannel(channel.id)
    channels.setData(next)
    return next
  }, connect ? null : `${channel.name} disconnected.`)
  const chooseChannel = (channel, pageId) => run(channel.id, async () => channels.setData(await selectChannel(channel.id, pageId)), `${channel.name} account updated.`)
  const changeMeta = (connect) => run('meta', async () => {
    if (connect) return connectMetaAds()
    onAdsChange(await disconnectMetaAds())
    return true
  }, connect ? null : 'Meta Ads disconnected.')
  const refreshMeta = () => run('meta', async () => { await refreshMetaAds(status.connection.id); await ads.reload() }, 'Meta assets and permissions refreshed.')
  const select = (patch) => run('meta', async () => onAdsChange(await setAdsSelection(patch)), 'Meta Ads selection saved.')

  return <div className="db-page db-connections"><PageIntro eyebrow="Connections" icon="link" title="Connect once. Create everywhere." description="Organic publishing and Meta Ads use separate permissions, so each connection stays clear and controllable." />
    <section className="db-card db-connect-meta">
      <img className="db-meta-logo" src="/social_logos/meta.png" alt="" />
      <div><span className="db-eyebrow">Paid ads</span><h2>Meta Ads</h2><p>Campaigns, lead forms, reporting, and delivery{status?.business_name ? ` for ${status.business_name}` : ''}.</p></div>
      <div className="db-connect-actions">{status?.connected ? <span className="db-meta-health"><i /> Connected</span> : <Badge tone="gray">{ads.loading ? 'Checking…' : 'Not connected'}</Badge>}{status?.connected ? <><Button variant="secondary" icon="refresh" disabled={busy === 'meta'} onClick={refreshMeta}>{busy === 'meta' ? 'Working…' : 'Refresh'}</Button><Button variant="ghost" disabled={busy === 'meta'} onClick={() => changeMeta(false)}>Disconnect</Button></> : <Button icon="link" disabled={busy === 'meta' || ads.loading} onClick={() => changeMeta(true)}>{busy === 'meta' ? 'Connecting…' : 'Connect Meta Ads'}</Button>}</div>
      {status?.connected && <dl className="db-connect-facts"><div><dt>Ad account</dt><dd><FactSelect disabled={busy === 'meta'} value={status.ad_account?.ad_account_id} options={status.ad_accounts.map((item) => ({ value: item.ad_account_id, label: `${item.name}${item.is_billable ? '' : ' (no payment method)'}` }))} onChange={(value) => select({ ad_account_id: value })} /></dd></div><div><dt>Facebook Page</dt><dd><FactSelect disabled={busy === 'meta'} value={status.page?.page_id} options={status.pages.map((item) => ({ value: item.page_id, label: item.page_name }))} onChange={(value) => select({ page_id: value })} /></dd></div><div><dt>Signed in as</dt><dd>{status.connection?.user_name || '—'}</dd></div><div><dt>Lead delivery</dt><dd title={status.page?.leadgen_error || ''}>{status.lead_delivery ? 'Active' : 'Not subscribed'}</dd></div></dl>}
    </section>
    <section className="db-card db-connect-channels"><header><div><h2>Publishing</h2><p>Accounts used when you create and schedule content.</p></div><span>{connectedCount} of {list.length || 2} connected</span></header>{channels.error && !channels.data ? <ErrorState error={channels.error} onRetry={channels.reload} /> : <div className="db-connect-list">{list.map((channel) => <article key={channel.id}><ChannelLogo platform={channel.name} /><div><b>{channel.name}</b><small>{channel.connected ? channel.handle : 'Not connected'} · {channel.detail}</small>{channel.connected && channel.options.length > 1 && <select className="db-fact-select" value={channel.page_id || ''} disabled={busy === channel.id} onChange={(event) => chooseChannel(channel, event.target.value)}>{channel.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select>}</div>{channel.connected ? <Button variant="ghost" disabled={busy === channel.id} onClick={() => changeChannel(channel, false)}>{busy === channel.id ? 'Working…' : 'Disconnect'}</Button> : <Button variant="secondary" icon="link" disabled={busy === channel.id} onClick={() => changeChannel(channel, true)}>{busy === channel.id ? 'Connecting…' : 'Connect'}</Button>}</article>)}</div>}</section>
    <section className="db-card db-permission-note"><span><Icon name="info" size={18} /></span><div><h3>Credentials stay with each platform.</h3><p>Connections use each platform’s own sign-in. Marketeer never asks for a social account password.</p></div></section>
  </div>
}

const SETTINGS_PANELS = [
  ['brand', 'Brand profile', 'target'],
  ['ai', 'AI defaults', 'spark'],
  ['notifications', 'Notifications', 'bell'],
  // ['access', 'Access', 'leads'], // Hidden until workspace access controls are ready.
]
const TONES = ['Bold & warm', 'Professional', 'Playful', 'Luxury', 'Editorial']

function SettingsView({ notify, onSaved }) {
  const settings = useResource(getSettings)
  if (!settings.data) {
    return <div className="db-page db-settings"><PageIntro eyebrow="Workspace settings" icon="settings" title="Keep every creation on brand." description="These defaults guide content generation and campaign plans across the workspace." actions={<Button icon="check" disabled>Save changes</Button>} />{settings.error ? <ErrorState error={settings.error} onRetry={settings.reload} /> : <LoadingState label="Loading settings…" />}</div>
  }
  return <SettingsForm initial={settings.data} notify={notify} onSaved={onSaved} />
}

function SettingsForm({ initial, notify, onSaved }) {
  const [panel, setPanel] = useState('brand')
  const [brand, setBrand] = useState(initial.brand)
  const [defaults, setDefaults] = useState({ ...initial.ai, ...initial.notifications })
  const [saving, setSaving] = useState(false)
  const setDefault = (key) => (value) => setDefaults((current) => ({ ...current, [key]: value }))
  const save = async () => {
    if (!brand.name.trim()) { notify('The workspace needs a name.', 'error'); setPanel('brand'); return }
    setSaving(true)
    try {
      const saved = await saveSettings({
        brand,
        ai: { review: defaults.review, aiImages: defaults.aiImages, autoHashtags: defaults.autoHashtags, approval: defaults.approval },
        notifications: { leads: defaults.leads, performance: defaults.performance, published: defaults.published, connections: defaults.connections, weekly: defaults.weekly },
      })
      setBrand(saved.brand)
      onSaved?.()
      notify('Workspace preferences saved.')
    } catch (failure) {
      notify(failure.message, 'error')
    } finally {
      setSaving(false)
    }
  }
  const tones = brand && brand.tone && !TONES.includes(brand.tone) ? [brand.tone, ...TONES] : TONES
  return <div className="db-page db-settings"><PageIntro eyebrow="Workspace settings" icon="settings" title="Keep every creation on brand." description="These defaults guide content generation and campaign plans across the workspace." actions={<Button icon="check" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save changes'}</Button>} />
    {<div className="db-settings-layout"><nav className="db-card">{SETTINGS_PANELS.map(([id, label, icon]) => <button className={panel === id ? 'active' : ''} onClick={() => setPanel(id)} key={id}><Icon name={icon} size={16} />{label}</button>)}</nav>
      {panel === 'brand' && <section className="db-card"><div className="db-section-heading"><span><Icon name="target" size={18} /></span><div><h2>Brand profile</h2><p>Shared context for organic content and paid campaigns.</p></div></div><div className="db-form-grid two"><Field label="Workspace name"><input value={brand.name} onChange={(event) => setBrand({ ...brand, name: event.target.value })} /></Field><Field label="Website"><input value={brand.website} onChange={(event) => setBrand({ ...brand, website: event.target.value })} placeholder="https://…" /></Field><Field label="Industry"><input value={brand.industry} onChange={(event) => setBrand({ ...brand, industry: event.target.value })} /></Field><Field label="Default tone"><select value={brand.tone || TONES[0]} onChange={(event) => setBrand({ ...brand, tone: event.target.value })}>{tones.map((tone) => <option key={tone}>{tone}</option>)}</select></Field><Field label="Business description" className="span-two"><textarea rows="4" value={brand.description} onChange={(event) => setBrand({ ...brand, description: event.target.value })} /></Field><Field label="Primary markets"><input value={brand.locations} onChange={(event) => setBrand({ ...brand, locations: event.target.value })} /></Field><Field label="Must include"><input value={brand.required} onChange={(event) => setBrand({ ...brand, required: event.target.value })} /></Field><Field label="Never use" className="span-two"><input value={brand.banned} onChange={(event) => setBrand({ ...brand, banned: event.target.value })} /></Field></div></section>}
      {panel === 'ai' && <section className="db-card"><div className="db-section-heading"><span><Icon name="spark" size={18} /></span><div><h2>AI defaults</h2><p>The baseline Marketeer uses before you review a draft or campaign.</p></div></div><div className="db-pref-list"><Toggle checked={defaults.review} onChange={setDefault('review')} label="Professional quality review" hint="Check finished designs for weak layout or artwork." /><Toggle checked={defaults.aiImages} onChange={setDefault('aiImages')} label="Generate visual directions" hint="Include new images in campaign plans." /><Toggle checked={defaults.autoHashtags} onChange={setDefault('autoHashtags')} label="Add hashtags automatically" hint="Preselect suggested tags during refinement." /><Toggle checked={defaults.approval} onChange={setDefault('approval')} label="Always require approval" hint="Nothing publishes without a final confirmation." /></div></section>}
      {panel === 'notifications' && <section className="db-card"><div className="db-section-heading"><span><Icon name="bell" size={18} /></span><div><h2>Notifications</h2><p>Choose which workspace events reach you.</p></div></div><div className="db-pref-list"><Toggle checked={defaults.leads} onChange={setDefault('leads')} label="New leads" hint="When a lead form is submitted." /><Toggle checked={defaults.performance} onChange={setDefault('performance')} label="Performance" hint="Budget, delivery, or creative fatigue." /><Toggle checked={defaults.published} onChange={setDefault('published')} label="Publishing" hint="When a post goes live or fails." /><Toggle checked={defaults.connections} onChange={setDefault('connections')} label="Connections" hint="When a platform needs to be reconnected." /><Toggle checked={defaults.weekly} onChange={setDefault('weekly')} label="Weekly summary" hint="A Monday note on spend, leads, and scheduled posts." /></div></section>}
      {/* Access settings intentionally commented out until workspace roles are ready. */}
    </div>}
  </div>
}

const NAV_GROUPS = [
  { label: 'Workspace', items: [['overview', 'Overview', 'home'], ['knowledge', 'Knowledge Base', 'spark'], ['vacancies', 'Vacancies', 'file']] },
  { label: 'Content', items: [['create', 'Create', 'create'], ['content', 'Content library', 'content'], ['calendar', 'Calendar', 'calendar']] },
  { label: 'Meta ads', items: [['adstudio', 'Campaign studio', 'ads'], ['campaigns', 'Campaigns', 'campaigns'], ['reporting', 'Reporting', 'campaigns'], ['leads', 'Leads', 'leads'], ['optimize', 'Optimize', 'optimize']] },
  { label: 'Manage', items: [['connections', 'Connections', 'link'], ['settings', 'Settings', 'settings']] },
]
const VALID_SECTIONS = NAV_GROUPS.flatMap((group) => group.items.map((item) => item[0]))
const LABELS = Object.fromEntries(NAV_GROUPS.flatMap((group) => group.items.map(([id, label]) => [id, label])))

function Dashboard({ account, onNavigate, theme, onToggleTheme }) {
  const initial = new URLSearchParams(window.location.search).get('tab')
  const [section, setSection] = useState(VALID_SECTIONS.includes(initial) ? initial : 'overview')
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = window.localStorage.getItem('marketeer-sidebar')
    if (saved === 'closed') return false
    if (saved === 'open') return true
    return window.matchMedia('(min-width: 981px)').matches
  })
  const [toast, setToast] = useState(null)
  const [context, setContext] = useState(null)
  const [newLeads, setNewLeads] = useState(0)
  const [unread, setUnread] = useState(0)
  const ads = useResource(getAdsStatus)
  const knowledge = useResource(getKnowledge)
  // Search is hidden until its endpoint is connected.
  // const [search, setSearch] = useState('')
  const name = account?.name || 'there'
  const email = account?.email || ''
  const initials = initialsOf(name)
  const notify = useCallback((message, type = 'success') => setToast({ message, type, id: Date.now() }), [])
  const closeToast = useCallback(() => setToast(null), [])

  const brand = useMemo(() => {
    const profile = knowledge.data?.data?.brand || {}
    const brandName = profile.name || name
    return { name: brandName, handle: brandName.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '') || 'yourbrand', initials: initialsOf(brandName), logo: profile.logo || '', domain: hostnameOf(profile.website) }
  }, [knowledge.data, name])

  useEffect(() => {
    getLeads().then((result) => setNewLeads(result.metrics.new)).catch(() => {})
    const poll = () => getNotifications().then((result) => setUnread(result.unread)).catch(() => {})
    poll()
    const timer = window.setInterval(poll, 60000)
    return () => window.clearInterval(timer)
  }, [])

  const go = (next, payload = null) => {
    if (!VALID_SECTIONS.includes(next)) return
    setContext(payload ? { section: next, payload } : null)
    setSection(next)
    if (window.matchMedia('(max-width: 980px)').matches) setSidebarOpen(false)
    const url = new URL(window.location.href)
    url.searchParams.set('view', 'dashboard')
    if (next === 'overview') url.searchParams.delete('tab'); else url.searchParams.set('tab', next)
    window.history.replaceState({}, '', `${url.pathname}${url.search}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const contextFor = (id) => (context?.section === id ? context.payload : null)
  // const onSearch = (event) => { if (event.key === 'Enter' && search.trim()) notify(`Search is ready for “${search.trim()}” when the search endpoint is connected.`) }
  const logout = async () => {
    await endSession()
    window.location.replace(`${window.location.pathname}?view=signin`)
  }
  const openNotifications = async () => {
    try {
      const result = await getNotifications()
      const fresh = result.items.filter((item) => !item.read)
      if (!fresh.length) { notify('You are all caught up.'); return }
      notify(fresh.length === 1 ? `${fresh[0].title}${fresh[0].body ? ` — ${fresh[0].body}` : ''}` : `${fresh.length} updates: ${fresh.slice(0, 3).map((item) => item.title).join(' · ')}`)
      await markNotificationsRead()
      setUnread(0)
    } catch (failure) {
      notify(failure.message, 'error')
    }
  }
  const sharedAds = { connected: Boolean(ads.data?.connected), status: ads.data, loadingStatus: ads.loading, onManage: () => go('connections'), notify }

  const setSidebar = (open) => { setSidebarOpen(open); window.localStorage.setItem('marketeer-sidebar', open ? 'open' : 'closed') }
  return <BrandContext.Provider value={brand}><main className={`db-dashboard ${sidebarOpen ? '' : 'sidebar-closed'}`}>
    <div className="db-ambient" aria-hidden="true"><span /><span /><span /></div>
    <aside className={`db-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="db-sidebar-brand"><button onClick={() => onNavigate?.('home')} aria-label="Marketeer home"><em className="db-brand-full">Marketeer</em><span>.</span><em className="db-brand-mark" aria-hidden="true">m</em></button><button className="db-mobile-close" onClick={() => setSidebar(false)} aria-label="Close sidebar"><Icon name="close" size={19} /></button></div>
      <nav>{NAV_GROUPS.map((group) => <div className="db-nav-group" key={group.label}><small>{group.label}</small>{group.items.map(([id, label, icon]) => <button className={section === id ? 'active' : ''} onClick={() => go(id)} key={id} aria-label={label} title={label}><span><Icon name={icon} size={18} /></span><b>{label}</b>{id === 'leads' && newLeads > 0 && <i>{newLeads}</i>}{id === 'connections' && <em className={ads.data?.connected ? 'connected' : ''} />}</button>)}</div>)}</nav>
      <div className="db-sidebar-bottom">{/* AI creations / Upgrade plan card intentionally commented out until billing is connected. */}<div className="db-profile"><span>{initials}<i /></span><div><b>{name}</b><small>{email}</small></div></div></div>
    </aside>
    {sidebarOpen && <button className="db-nav-scrim" onClick={() => setSidebar(false)} aria-label="Close navigation" />}
    <div className="db-main-shell"><header className="db-topbar"><div className="db-topbar-left"><button className="db-menu-button" aria-expanded={sidebarOpen} onClick={() => setSidebar(!sidebarOpen)} aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}><Icon name="sidebar" size={18} /></button><div className="db-breadcrumb"><span>{section === 'overview' ? 'Command center' : ['create', 'content', 'calendar'].includes(section) ? 'Content' : ['adstudio', 'campaigns', 'reporting', 'leads', 'optimize', 'assets'].includes(section) ? 'Meta ads' : 'Workspace'}</span><i>/</i><b>{LABELS[section]}</b></div></div><div className="db-top-actions">
        {/* Search temporarily hidden; retain for future endpoint integration.
        <label className="db-search"><Icon name="search" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={onSearch} placeholder="Search workspace…" /></label>
        */}
        <ThemeButton theme={theme} onToggle={onToggleTheme} className="db-theme-button" /><button className="db-icon-button" onClick={openNotifications} aria-label={unread ? `Notifications (${unread} unread)` : 'Notifications'}><Icon name="bell" size={17} />{unread > 0 && <i />}</button>
        <AccountMenu name={name} email={email} initials={initials} onSettings={() => go('settings')} onLogout={logout} />
      </div></header>
      <div className="db-main-content" key={section}>
        {section === 'overview' && <Overview firstName={name.split(' ')[0]} onGo={go} onLeadCount={setNewLeads} />}
        {section === 'knowledge' && <KnowledgeBaseView notify={notify} onSaved={knowledge.reload} />}
        {section === 'vacancies' && <VacanciesView notify={notify} onGo={go} />}
        {section === 'create' && <ContentCreate key={contextFor('create')?.id || 'new'} draft={contextFor('create')} notify={notify} onGo={go} />}
        {section === 'content' && <ContentLibrary notify={notify} onGo={go} />}
        {section === 'calendar' && <ContentCalendar notify={notify} onGo={go} adsConnected={Boolean(ads.data?.connected)} />}
        {section === 'adstudio' && <AdsStudio {...sharedAds} onGo={go} preset={contextFor('adstudio')} />}
        {section === 'campaigns' && <CampaignsView {...sharedAds} />}
        {section === 'reporting' && <ReportingView notify={notify} connected={sharedAds.connected} loadingStatus={ads.loading} onManage={sharedAds.onManage} />}
        {section === 'leads' && <LeadsView {...sharedAds} onNewCount={setNewLeads} />}
        {section === 'optimize' && <OptimizeView {...sharedAds} />}
        {/* Asset library tab intentionally commented out. */}
        {section === 'connections' && <Connections ads={ads} onAdsChange={ads.setData} notify={notify} />}
        {section === 'settings' && <SettingsView notify={notify} onSaved={knowledge.reload} />}
      </div>
    </div>
    <Toast toast={toast} onClose={closeToast} />
  </main></BrandContext.Provider>
}

export default Dashboard
