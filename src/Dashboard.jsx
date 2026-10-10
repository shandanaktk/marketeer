import { useEffect, useState } from 'react'
import { AdsLibraryView, AdsStudio, CampaignsView, LeadsView, OptimizeView } from './AdsWorkspace.jsx'
import { ContentCalendar, ContentCreate, ContentLibrary } from './ContentWorkspace.jsx'
import { campaigns, calendarContent, connectedChannels, dashboardMockService, leadRecords, metaConnection, overviewMetrics } from './dashboardMockData.js'
import { Badge, Button, Field, Icon, PageIntro, PlatformMark, Toggle } from './dashboardUI.jsx'
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
  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(onClose, 3600); return () => window.clearTimeout(timer) }, [toast, onClose])
  if (!toast) return null
  return <div className={`db-toast ${toast.type || ''}`}><span><Icon name={toast.type === 'error' ? 'close' : 'check'} size={15} /></span><p>{toast.message}</p><button onClick={onClose} aria-label="Dismiss"><Icon name="close" size={14} /></button></div>
}

function sparkGeometry(values) {
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

function Overview({ firstName, onGo }) {
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  const activeCampaigns = campaigns.filter((item) => item.status === 'active' || item.status === 'learning').slice(0, 3)
  const upcoming = calendarContent.filter((item) => item.status === 'scheduled').slice(0, 4)
  const channelLogo = (name) => `/social_logos/${String(name).toLowerCase().includes('facebook') ? 'facebook' : 'instagram'}.png`
  return <div className="db-page db-overview">
    <section className="db-overview-hero"><div><span className="db-eyebrow"><Icon name="spark" size={14} /> {today}</span><h1>Good evening, {firstName}.<br /><em>Let’s make something matter.</em></h1><p>Your paid and organic work is moving in the right direction. Here is where to focus next.</p><div><Button icon="create" onClick={() => onGo('create')}>Create content</Button><Button variant="secondary" icon="ads" onClick={() => onGo('adstudio')}>Build a campaign</Button></div></div><GreetingMark /></section>
    <section className="db-metric-grid four overview">{overviewMetrics.map((metric) => <article className={`db-card ${metric.tone}`} key={metric.label}><span className="db-metric-icon"><Icon name={metric.icon} size={18} /></span><small>Last 30 days</small><p>{metric.label}</p><strong>{metric.value}</strong><em>{metric.delta}</em><Sparkline id={`spark-${metric.label.replace(/\s+/g, '-')}`} values={metric.series} /></article>)}</section>
    <div className="db-overview-layout"><section className="db-card db-action-card"><span className="db-eyebrow">Create something</span><h2>Where should we begin?</h2><div><button onClick={() => onGo('adstudio')}><span className="lime"><Icon name="ads" size={22} /></span><div><b>Build a Meta lead campaign</b><small>Strategy, creative, audience, lead form, and launch</small></div><Icon name="arrow" size={18} /></button><button onClick={() => onGo('create')}><span className="blue"><Icon name="create" size={22} /></span><div><b>Create social content</b><small>Prompt, generate, refine, and schedule everywhere</small></div><Icon name="arrow" size={18} /></button></div><div className="db-overview-insight"><Icon name="spark" size={17} /><p><b>Opportunity:</b> Your audience responds best between 5–7 PM. Two open calendar slots match that window this week.</p><Button variant="ghost" onClick={() => onGo('calendar')}>View calendar</Button></div></section>
      <section className="db-card db-live-campaigns"><header><div><span className="db-eyebrow">Live campaigns</span><h2>Performance pulse</h2></div><Button variant="ghost" icon="arrow" onClick={() => onGo('campaigns')}>View all</Button></header>{activeCampaigns.map((campaign) => <button onClick={() => onGo('campaigns')} key={campaign.id}><img className="db-shot" src={campaign.image} alt="" /><div><Badge tone={campaign.status === 'active' ? 'lime' : 'blue'}>{campaign.delivery}</Badge><b>{campaign.name}</b><small>{campaign.objective} · ${campaign.budget}/day</small></div><span><b>{campaign.leads}</b><small>leads</small></span><span><b>${campaign.cpl}</b><small>CPL</small></span></button>)}</section>
      <section className="db-card db-lead-pulse"><header><div><span className="db-eyebrow">Lead activity</span><h2>Fresh conversations</h2></div><Badge tone="blue">{leadRecords.filter((lead) => lead.status === 'new').length} new</Badge></header>{leadRecords.slice(0, 3).map((lead) => <button onClick={() => onGo('leads')} key={lead.id}><img className="db-lead-photo" src={lead.avatar} alt="" /><div><b>{lead.name}</b><small>{lead.campaign} · {lead.received}</small></div><img className="db-queue-logo" src={channelLogo(lead.source)} alt="" /><Icon name="arrow" size={15} /></button>)}<Button variant="soft" className="full" onClick={() => onGo('leads')}>Open lead center</Button></section>
      <section className="db-card db-upcoming"><header><div><span className="db-eyebrow">Up next</span><h2>Content queue</h2></div><Button variant="ghost" icon="arrow" onClick={() => onGo('calendar')}>Calendar</Button></header>{upcoming.map((item) => { const when = new Date(`${item.date}T12:00:00`); return <button onClick={() => onGo('content')} key={item.id}><img className="db-shot" src={item.image} alt="" /><div><b>{item.title}</b><small>{when.toLocaleString('en-US', { month: 'short', day: 'numeric' })} · {item.time} · {item.format}</small><span>{item.platforms.map((platform) => <img className="db-queue-logo" src={channelLogo(platform)} alt={platform} key={platform} />)}</span></div><Icon name="arrow" size={16} /></button> })}</section>
    </div>
  </div>
}

function Connections({ channels, setChannels, metaConnected, setMetaConnected, notify }) {
  const [busy, setBusy] = useState('')
  const changeChannel = async (id, connect) => { setBusy(id); await dashboardMockService.save(); setChannels((current) => current.map((item) => item.id === id ? { ...item, connected: connect, handle: connect ? item.handle || `@marketeer.${id}` : item.handle } : item)); setBusy(''); notify(`${channels.find((item) => item.id === id)?.name} ${connect ? 'connected' : 'disconnected'}.`) }
  const changeMeta = async (connect) => { setBusy('meta'); await dashboardMockService.save(); setMetaConnected(connect); setBusy(''); notify(`Meta Ads ${connect ? 'connected' : 'disconnected'} in demo mode.`) }
  return <div className="db-page"><PageIntro eyebrow="Connections" icon="link" title="Connect once. Create everywhere." description="Organic publishing and Meta Ads use separate permissions, so each connection stays clear and controllable." />
    <section className="db-card db-meta-connection-card"><div className="db-meta-connection-visual"><span>∞</span><i /><i /></div><div className="db-meta-connection-copy"><Badge tone={metaConnected ? 'lime' : 'gray'}>{metaConnected ? 'Active connection' : 'Not connected'}</Badge><h2>Meta Ads</h2><p>Campaign creation, lead forms, ad account reporting, lead delivery, and optimization.</p>{metaConnected && <div className="db-connection-details"><span><small>Meta user</small><b>{metaConnection.userName}</b></span><span><small>Business</small><b>{metaConnection.businessName}</b></span><span><small>Ad account</small><b>{metaConnection.account.name}</b></span><span><small>Facebook Page</small><b>{metaConnection.page.name}</b></span></div>}</div><div className="db-meta-connection-actions">{metaConnected ? <><Badge>Lead delivery active</Badge><Button variant="secondary" icon="refresh" disabled={busy === 'meta'} onClick={() => notify('Meta assets and permissions refreshed.')}>Refresh assets</Button><Button variant="danger" icon="link" disabled={busy === 'meta'} onClick={() => changeMeta(false)}>Disconnect</Button></> : <Button icon="link" disabled={busy === 'meta'} onClick={() => changeMeta(true)}>{busy === 'meta' ? 'Connecting…' : 'Connect Meta Ads'}</Button>}</div></section>
    <div className="db-connection-heading"><div><span className="db-eyebrow">Publishing channels</span><h2>Organic social accounts</h2><p>Use these accounts when creating and scheduling content.</p></div><span className="db-connection-count"><b>{channels.filter((item) => item.connected).length}</b><small>of {channels.length} connected</small></span></div>
    <div className="db-connection-grid">{channels.map((channel) => <article className={`db-card ${channel.color}`} key={channel.id}><PlatformMark platform={channel.name} /><Badge tone={channel.connected ? 'lime' : 'gray'}>{channel.connected ? 'Connected' : 'Available'}</Badge><h3>{channel.name}</h3><p>{channel.detail}</p><small>{channel.connected ? channel.handle : 'Secure OAuth connection'}</small>{channel.connected ? <Button variant="ghost" disabled={busy === channel.id} onClick={() => changeChannel(channel.id, false)}>Disconnect</Button> : <Button variant="secondary" icon="link" disabled={busy === channel.id} onClick={() => changeChannel(channel.id, true)}>{busy === channel.id ? 'Connecting…' : `Connect ${channel.name}`}</Button>}</article>)}</div>
    <section className="db-card db-permission-note"><span><Icon name="info" size={20} /></span><div><h3>Your credentials stay with each platform.</h3><p>Connections use OAuth-style permissions. Marketeer never asks for or stores your social account passwords.</p></div></section>
  </div>
}

function SettingsView({ data, notify }) {
  const [brand, setBrand] = useState({ name: data.workspaceName || 'Marketeer Studio', website: 'https://marketeer.co', industry: data.industry || 'Creative services', tone: data.voice || 'Bold & warm', description: 'AI-powered campaign and content creation for ambitious small teams.', locations: 'United States', banned: 'cheap, guaranteed', required: 'Marketeer' })
  const [defaults, setDefaults] = useState({ review: true, aiImages: true, autoHashtags: false, approval: true, email: true, performance: true })
  const save = async () => { await dashboardMockService.save(); notify('Workspace preferences saved.') }
  return <div className="db-page"><PageIntro eyebrow="Workspace settings" icon="settings" title="Keep every creation on brand." description="These defaults guide content generation and campaign plans across the workspace." actions={<Button icon="check" onClick={save}>Save changes</Button>} />
    <div className="db-settings-layout"><nav className="db-card"><button className="active"><Icon name="target" size={17} /> Brand profile</button><button><Icon name="spark" size={17} /> AI defaults</button><button><Icon name="bell" size={17} /> Notifications</button><button><Icon name="leads" size={17} /> Team & access</button></nav><div className="db-settings-stack"><section className="db-card"><div className="db-section-heading"><span><Icon name="target" size={18} /></span><div><h2>Brand profile</h2><p>Shared context for organic content and paid campaigns.</p></div></div><div className="db-form-grid two"><Field label="Workspace name"><input value={brand.name} onChange={(event) => setBrand({ ...brand, name: event.target.value })} /></Field><Field label="Website"><input value={brand.website} onChange={(event) => setBrand({ ...brand, website: event.target.value })} /></Field><Field label="Industry"><input value={brand.industry} onChange={(event) => setBrand({ ...brand, industry: event.target.value })} /></Field><Field label="Default tone"><select value={brand.tone} onChange={(event) => setBrand({ ...brand, tone: event.target.value })}><option>Bold & warm</option><option>Professional</option><option>Playful</option><option>Luxury</option><option>Editorial</option></select></Field><Field label="Business description" className="span-two"><textarea rows="4" value={brand.description} onChange={(event) => setBrand({ ...brand, description: event.target.value })} /></Field><Field label="Primary markets"><input value={brand.locations} onChange={(event) => setBrand({ ...brand, locations: event.target.value })} /></Field><Field label="Must include"><input value={brand.required} onChange={(event) => setBrand({ ...brand, required: event.target.value })} /></Field><Field label="Never use" className="span-two"><input value={brand.banned} onChange={(event) => setBrand({ ...brand, banned: event.target.value })} /></Field></div></section>
      <section className="db-card"><div className="db-section-heading compact"><span><Icon name="spark" size={18} /></span><div><h2>AI creation defaults</h2><p>Set a consistent quality and approval baseline.</p></div></div><div className="db-settings-toggles"><Toggle checked={defaults.review} onChange={(value) => setDefaults({ ...defaults, review: value })} label="Professional quality review" hint="Check finished designs for weak layout or artwork." /><Toggle checked={defaults.aiImages} onChange={(value) => setDefaults({ ...defaults, aiImages: value })} label="Generate visual directions" hint="Include new AI-styled images in campaign plans." /><Toggle checked={defaults.autoHashtags} onChange={(value) => setDefaults({ ...defaults, autoHashtags: value })} label="Add hashtags automatically" hint="Preselect suggested tags during content refinement." /><Toggle checked={defaults.approval} onChange={(value) => setDefaults({ ...defaults, approval: value })} label="Always require approval" hint="Never publish content or ads without a final confirmation." /></div></section>
      <section className="db-card"><div className="db-section-heading compact"><span><Icon name="bell" size={18} /></span><div><h2>Notifications</h2><p>Choose the workspace events worth interrupting you for.</p></div></div><div className="db-settings-toggles"><Toggle checked={defaults.email} onChange={(value) => setDefaults({ ...defaults, email: value })} label="New lead alerts" hint="Email the workspace when a lead form is submitted." /><Toggle checked={defaults.performance} onChange={(value) => setDefaults({ ...defaults, performance: value })} label="Performance alerts" hint="Flag budget, delivery, or creative fatigue risks." /></div></section></div></div>
  </div>
}

const NAV_GROUPS = [
  { label: 'Workspace', items: [['overview', 'Overview', 'home'], ['knowledge', 'Knowledge Base', 'spark'], ['vacancies', 'Vacancies', 'file']] },
  { label: 'Content', items: [['create', 'Create', 'create'], ['content', 'Content library', 'content'], ['calendar', 'Calendar', 'calendar']] },
  { label: 'Meta ads', items: [['adstudio', 'Campaign studio', 'ads'], ['campaigns', 'Campaigns', 'campaigns'], ['reporting', 'Reporting', 'campaigns'], ['leads', 'Leads', 'leads'], ['optimize', 'Optimize', 'optimize'], ['assets', 'Asset library', 'library']] },
  { label: 'Manage', items: [['connections', 'Connections', 'link'], ['settings', 'Settings', 'settings']] },
]
const VALID_SECTIONS = NAV_GROUPS.flatMap((group) => group.items.map((item) => item[0]))
const LABELS = Object.fromEntries(NAV_GROUPS.flatMap((group) => group.items.map(([id, label]) => [id, label])))

function Dashboard({ data = {}, onNavigate, theme, onToggleTheme }) {
  const initial = new URLSearchParams(window.location.search).get('tab')
  const [section, setSection] = useState(VALID_SECTIONS.includes(initial) ? initial : 'overview')
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = window.localStorage.getItem('marketeer-sidebar')
    if (saved === 'closed') return false
    if (saved === 'open') return true
    return window.matchMedia('(min-width: 981px)').matches
  })
  const [toast, setToast] = useState(null)
  const [channels, setChannels] = useState(connectedChannels)
  const [metaConnected, setMetaConnected] = useState(metaConnection.connected)
  // Search is hidden until its endpoint is connected.
  // const [search, setSearch] = useState('')
  const name = data.name || 'Alex Morgan'
  const initials = name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const notify = (message, type = 'success') => setToast({ message, type, id: Date.now() })
  const go = (next) => {
    if (!VALID_SECTIONS.includes(next)) return
    setSection(next)
    if (window.matchMedia('(max-width: 980px)').matches) setSidebarOpen(false)
    const url = new URL(window.location.href)
    url.searchParams.set('view', 'dashboard')
    if (next === 'overview') url.searchParams.delete('tab'); else url.searchParams.set('tab', next)
    window.history.replaceState({}, '', `${url.pathname}${url.search}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  // const onSearch = (event) => { if (event.key === 'Enter' && search.trim()) notify(`Search is ready for “${search.trim()}” when the search endpoint is connected.`) }
  const logout = () => {
    // This is the token read by dashboardApi.js. Keep theme and unrelated data.
    window.localStorage.removeItem('access_token')
    // A full navigation also drops the demo workspace's in-memory state.
    // Add server-side session revocation here when real authentication is wired.
    window.location.replace(`${window.location.pathname}?view=signin`)
  }
  const sharedAds = { connected: metaConnected, onManage: () => go('connections'), notify }

  const setSidebar = (open) => { setSidebarOpen(open); window.localStorage.setItem('marketeer-sidebar', open ? 'open' : 'closed') }
  return <main className={`db-dashboard ${sidebarOpen ? '' : 'sidebar-closed'}`}>
    <div className="db-ambient" aria-hidden="true"><span /><span /><span /></div>
    <aside className={`db-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="db-sidebar-brand"><button onClick={() => onNavigate?.('home')} aria-label="Marketeer home"><em className="db-brand-full">Marketeer</em><span>.</span><em className="db-brand-mark" aria-hidden="true">m</em></button><button className="db-mobile-close" onClick={() => setSidebar(false)} aria-label="Close sidebar"><Icon name="close" size={19} /></button></div>
      <nav>{NAV_GROUPS.map((group) => <div className="db-nav-group" key={group.label}><small>{group.label}</small>{group.items.map(([id, label, icon]) => <button className={section === id ? 'active' : ''} onClick={() => go(id)} key={id} aria-label={label} title={label}><span><Icon name={icon} size={18} /></span><b>{label}</b>{id === 'leads' && <i>{leadRecords.filter((lead) => lead.status === 'new').length}</i>}{id === 'connections' && <em className={metaConnected ? 'connected' : ''} />}</button>)}</div>)}</nav>
      <div className="db-sidebar-bottom"><div className="db-usage"><span><Icon name="spark" size={14} /> AI creations</span><b>18 <small>/ 30 this month</small></b><i><em /></i><button onClick={() => notify('Plan management will open here once billing is connected.')}>Upgrade plan <Icon name="arrow" size={13} /></button></div><div className="db-profile"><span>{initials}<i /></span><div><b>{name}</b><small>demo@marketeer.ai</small></div></div></div>
    </aside>
    {sidebarOpen && <button className="db-nav-scrim" onClick={() => setSidebar(false)} aria-label="Close navigation" />}
    <div className="db-main-shell"><header className="db-topbar"><div className="db-topbar-left"><button className="db-menu-button" aria-expanded={sidebarOpen} onClick={() => setSidebar(!sidebarOpen)} aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}><Icon name="sidebar" size={18} /></button><div className="db-breadcrumb"><span>{section === 'overview' ? 'Command center' : ['create', 'content', 'calendar'].includes(section) ? 'Content' : ['adstudio', 'campaigns', 'reporting', 'leads', 'optimize', 'assets'].includes(section) ? 'Meta ads' : 'Workspace'}</span><i>/</i><b>{LABELS[section]}</b></div></div><div className="db-top-actions">
        {/* Search temporarily hidden; retain for future endpoint integration.
        <label className="db-search"><Icon name="search" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={onSearch} placeholder="Search workspace…" /></label>
        */}
        <ThemeButton theme={theme} onToggle={onToggleTheme} className="db-theme-button" /><span className="db-demo-badge"><i /> Demo data</span><button className="db-icon-button" onClick={() => notify('You are all caught up.')} aria-label="Notifications"><Icon name="bell" size={17} /><i /></button>
        <AccountMenu name={name} email={data.email || 'demo@marketeer.ai'} initials={initials} onSettings={() => go('settings')} onLogout={logout} />
      </div></header>
      <div className="db-main-content" key={section}>
        {section === 'overview' && <Overview firstName={name.split(' ')[0]} onGo={go} />}
        {section === 'knowledge' && <KnowledgeBaseView notify={notify} />}
        {section === 'vacancies' && <VacanciesView notify={notify} onGo={go} />}
        {section === 'create' && <ContentCreate notify={notify} onGo={go} />}
        {section === 'content' && <ContentLibrary notify={notify} onGo={go} />}
        {section === 'calendar' && <ContentCalendar notify={notify} onGo={go} />}
        {section === 'adstudio' && <AdsStudio {...sharedAds} onGo={go} />}
        {section === 'campaigns' && <CampaignsView {...sharedAds} />}
        {section === 'reporting' && <ReportingView notify={notify} />}
        {section === 'leads' && <LeadsView {...sharedAds} />}
        {section === 'optimize' && <OptimizeView {...sharedAds} />}
        {section === 'assets' && <AdsLibraryView {...sharedAds} onGo={go} />}
        {section === 'connections' && <Connections channels={channels} setChannels={setChannels} metaConnected={metaConnected} setMetaConnected={setMetaConnected} notify={notify} />}
        {section === 'settings' && <SettingsView data={data} notify={notify} />}
      </div>
    </div>
    <Toast toast={toast} onClose={() => setToast(null)} />
  </main>
}

export default Dashboard
