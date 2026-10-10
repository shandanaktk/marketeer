import { useState } from 'react'
import { Badge, Button, Field, Icon, PageIntro, Toggle } from './dashboardUI.jsx'
import { knowledgeBaseSeed, reportingSeed, vacancySeed } from './srsMockData.js'

function SectionHeading({ icon, title, copy }) {
  return <div className="db-section-heading"><span><Icon name={icon} size={18} /></span><div><h2>{title}</h2><p>{copy}</p></div></div>
}

const KNOWLEDGE_KEY = 'marketeer-knowledge-base'
const KNOWLEDGE_TABS = [
  ['brand', 'Identity'],
  ['audience', 'Audience'],
  ['voice', 'Voice'],
  ['offerings', 'Offerings'],
  ['messaging', 'Messaging'],
  ['visual', 'Look'],
  ['posting', 'Publishing'],
  ['metaRules', 'Ads'],
]

function mergeKnowledge(extra) {
  const next = structuredClone(knowledgeBaseSeed)
  if (!extra || typeof extra !== 'object') return next
  for (const key of Object.keys(next)) {
    if (Array.isArray(next[key])) next[key] = Array.isArray(extra[key]) ? extra[key] : next[key]
    else next[key] = { ...next[key], ...(extra[key] && typeof extra[key] === 'object' ? extra[key] : {}) }
  }
  return next
}

function loadKnowledge() {
  try {
    const raw = window.localStorage.getItem(KNOWLEDGE_KEY)
    return raw ? mergeKnowledge(JSON.parse(raw)) : structuredClone(knowledgeBaseSeed)
  } catch {
    return structuredClone(knowledgeBaseSeed)
  }
}

function knowledgeScore(data) {
  const values = [
    data.brand.name, data.brand.website, data.brand.tagline, data.brand.industry, data.brand.location, data.brand.description, data.brand.story, data.brand.mission,
    data.audience.primary, data.audience.secondary, data.audience.pains, data.audience.markets,
    data.voice.tone, data.voice.personality, data.voice.languages, data.voice.sample,
    data.messaging.pillars, data.messaging.proof, data.messaging.required, data.messaging.restricted, data.messaging.differentiator, data.messaging.cta,
    data.visual.imageStyle, data.visual.typeStyle, data.visual.colors.join(''),
    data.posting.frequency, data.posting.timezone, data.posting.bestTimes, data.posting.hashtags, data.posting.mix, data.posting.platforms.join(''),
    data.metaRules.countries, data.metaRules.objective, String(data.metaRules.dailyBudget || ''),
    ...data.offerings.flatMap((item) => [item.name, item.detail]),
  ]
  const filled = values.filter((item) => String(item || '').trim()).length
  return { filled, total: values.length }
}

function savedWhen(iso) {
  if (!iso) return 'Saved with your workspace'
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return 'Saved just now'
  if (minutes < 60) return `Saved ${minutes} min ago`
  return `Saved ${new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
}

function KnowledgePreview({ data, savedAt }) {
  const facts = [
    ['Voice', data.voice.tone],
    ['Personality', data.voice.personality],
    ['Languages', data.voice.languages],
    ['Audience', data.audience.primary],
    ['Also reaches', data.audience.secondary],
    ['Markets', data.audience.markets],
  ].filter(([, value]) => value)
  return <div className="db-kb-preview">
    <article className="db-card db-kb-cover">
      <div>
        <span className="db-eyebrow"><Icon name="spark" size={14} /> {savedWhen(savedAt)}</span>
        <h2>{data.brand.name || 'Your brand'}</h2>
        {data.brand.tagline && <p className="db-kb-tagline">{data.brand.tagline}</p>}
        <div className="db-kb-meta">{[data.brand.industry, data.brand.location, data.brand.website].filter(Boolean).map((item) => <span key={item}>{item}</span>)}</div>
      </div>
      {data.visual.colors.length > 0 && <div className="db-kb-swatches">{data.visual.colors.map((color) => <i style={{ background: color }} key={color} title={color} />)}</div>}
      {data.brand.description && <p>{data.brand.description}</p>}
    </article>
    {(data.brand.mission || data.brand.story) && <div className="db-kb-split">
      {data.brand.mission && <article className="db-card"><small>Mission</small><p>{data.brand.mission}</p></article>}
      {data.brand.story && <article className="db-card"><small>Origin</small><p>{data.brand.story}</p></article>}
    </div>}
    {facts.length > 0 && <div className="db-kb-facts">{facts.map(([label, value]) => <article className="db-card" key={label}><small>{label}</small><b>{value}</b></article>)}</div>}
    {data.audience.pains && <article className="db-card db-kb-note"><small>What they are tired of</small><p>{data.audience.pains}</p></article>}
    {data.voice.sample && <article className="db-card db-kb-quote"><small>How it should sound</small><p>{data.voice.sample}</p></article>}
    {data.offerings.length > 0 && <section className="db-kb-block"><header><h3>What you offer</h3></header><div className="db-kb-offers">{data.offerings.map((item) => <article className="db-card" key={item.id}><b>{item.name}</b>{item.who && <em>{item.who}</em>}<p>{item.detail}</p></article>)}</div></section>}
    <section className="db-kb-block"><header><h3>What every piece should say</h3></header><div className="db-kb-messages">{[
      ['Pillars', data.messaging.pillars],
      ['Proof', data.messaging.proof],
      ['Always include', data.messaging.required],
      ['Never say', data.messaging.restricted],
      ['Difference', data.messaging.differentiator],
      ['Call to action', data.messaging.cta],
    ].filter(([, value]) => value).map(([label, value]) => <article className="db-card" key={label}><small>{label}</small><p>{value}</p></article>)}</div></section>
    <div className="db-kb-split">
      <article className="db-card db-kb-publish">
        <small>Publishing</small>
        <div className="db-kb-logos">{data.posting.platforms.map((platform) => <img src={`/social_logos/${platform.toLowerCase()}.png`} alt={platform} key={platform} />)}</div>
        <ul>{[data.posting.frequency, data.posting.timezone, data.posting.bestTimes, data.posting.mix, data.posting.hashtags, data.posting.autoPublish ? 'Publishes automatically after approval' : 'Holds every post for a manual publish'].filter(Boolean).map((item) => <li key={item}>{item}</li>)}</ul>
      </article>
      <article className="db-card db-kb-publish">
        <small>Meta ads</small>
        <strong>${data.metaRules.dailyBudget}/day · {data.metaRules.duration} days</strong>
        <ul>{[data.metaRules.objective, data.metaRules.countries, data.metaRules.leadForm, data.metaRules.category, data.visual.imageStyle, data.visual.typeStyle, data.metaRules.reviewMode ? 'Review before launch' : '', data.metaRules.optimize ? 'Budget pacing on' : ''].filter(Boolean).map((item) => <li key={item}>{item}</li>)}</ul>
      </article>
    </div>
  </div>
}

export function KnowledgeBaseView({ notify }) {
  const [tab, setTab] = useState('brand')
  const [saved, setSaved] = useState(loadKnowledge)
  const [draft, setDraft] = useState(saved)
  const [mode, setMode] = useState('preview')
  const [savedAt, setSavedAt] = useState(() => window.localStorage.getItem(`${KNOWLEDGE_KEY}-at`))
  const [newOffering, setNewOffering] = useState('')
  const data = mode === 'preview' ? saved : draft
  const score = knowledgeScore(saved)
  const update = (group, key, value) => setDraft((current) => ({ ...current, [group]: { ...current[group], [key]: value } }))
  const addOffering = () => {
    if (!newOffering.trim()) return
    setDraft((current) => ({ ...current, offerings: [...current.offerings, { id: `service-${Date.now()}`, name: newOffering.trim(), detail: '', who: '' }] }))
    setNewOffering('')
  }
  const save = () => {
    if (!draft.brand.name.trim()) { notify('Add a brand name before saving.', 'error'); setTab('brand'); return }
    const stamp = new Date().toISOString()
    setSaved(draft)
    setSavedAt(stamp)
    setMode('preview')
    window.localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(draft))
    window.localStorage.setItem(`${KNOWLEDGE_KEY}-at`, stamp)
    notify('Knowledge Base saved. This is the profile generations will use.')
  }

  return <div className="db-page db-srs-page">
    <PageIntro eyebrow="Knowledge Base" icon="spark" title={mode === 'preview' ? 'The profile behind every generation.' : 'Tell Marketeer who you are.'} description={mode === 'preview' ? 'This saved profile is what content, campaigns, and ads are written from.' : 'The more specific this is, the less generic the work becomes.'} actions={mode === 'preview' ? <Button icon="edit" onClick={() => { setDraft(saved); setMode('edit') }}>Edit knowledge</Button> : <><Button variant="secondary" onClick={() => { setDraft(saved); setMode('preview') }}>Cancel</Button><Button icon="check" onClick={save}>Save knowledge</Button></>} />
    <div className="db-context-status db-card"><span><Icon name="spark" size={18} /></span><div><b>{mode === 'preview' ? 'Saved profile' : 'Editing profile'}</b><p>{score.filled} of {score.total} details filled · {savedWhen(savedAt)}</p></div><Badge>{mode === 'preview' ? 'Ready for generation' : 'Unsaved edits'}</Badge></div>
    {mode === 'preview' ? <KnowledgePreview data={data} savedAt={savedAt} /> : <div className="db-srs-layout">
      <nav className="db-card db-srs-tabs" aria-label="Knowledge Base sections">{KNOWLEDGE_TABS.map(([id, label], index) => <button className={tab === id ? 'active' : ''} onClick={() => setTab(id)} key={id}><span>{String(index + 1).padStart(2, '0')}</span>{label}<Icon name="arrow" size={14} /></button>)}</nav>
      <section className="db-card db-srs-editor">
        {tab === 'brand' && <><SectionHeading icon="target" title="Identity" copy="The facts a stranger should be able to repeat after one look at your work." /><div className="db-form-grid two"><Field label="Brand name"><input value={draft.brand.name} onChange={(event) => update('brand', 'name', event.target.value)} /></Field><Field label="Website"><input value={draft.brand.website} onChange={(event) => update('brand', 'website', event.target.value)} /></Field><Field label="Tagline" className="span-two"><input value={draft.brand.tagline} onChange={(event) => update('brand', 'tagline', event.target.value)} placeholder="One line people should remember" /></Field><Field label="Industry"><input value={draft.brand.industry} onChange={(event) => update('brand', 'industry', event.target.value)} /></Field><Field label="Based in"><input value={draft.brand.location} onChange={(event) => update('brand', 'location', event.target.value)} /></Field><Field label="What you do" className="span-two"><textarea rows="4" value={draft.brand.description} onChange={(event) => update('brand', 'description', event.target.value)} /></Field><Field label="Mission"><textarea rows="4" value={draft.brand.mission} onChange={(event) => update('brand', 'mission', event.target.value)} /></Field><Field label="Origin story"><textarea rows="4" value={draft.brand.story} onChange={(event) => update('brand', 'story', event.target.value)} /></Field></div></>}
        {tab === 'audience' && <><SectionHeading icon="leads" title="Audience" copy="Who the work is for, and what they are already frustrated by." /><div className="db-form-grid two"><Field label="Primary audience" className="span-two"><textarea rows="3" value={draft.audience.primary} onChange={(event) => update('audience', 'primary', event.target.value)} /></Field><Field label="Secondary audience" className="span-two"><textarea rows="3" value={draft.audience.secondary} onChange={(event) => update('audience', 'secondary', event.target.value)} /></Field><Field label="Pains"><textarea rows="4" value={draft.audience.pains} onChange={(event) => update('audience', 'pains', event.target.value)} /></Field><Field label="Markets"><textarea rows="4" value={draft.audience.markets} onChange={(event) => update('audience', 'markets', event.target.value)} /></Field></div></>}
        {tab === 'voice' && <><SectionHeading icon="content" title="Voice" copy="How the brand should sound when nobody from the team is in the room." /><div className="db-form-grid two"><Field label="Tone"><input value={draft.voice.tone} onChange={(event) => update('voice', 'tone', event.target.value)} /></Field><Field label="Personality"><input value={draft.voice.personality} onChange={(event) => update('voice', 'personality', event.target.value)} placeholder="Warm, precise, confident" /></Field><Field label="Languages" className="span-two"><input value={draft.voice.languages} onChange={(event) => update('voice', 'languages', event.target.value)} /></Field><Field label="A line that sounds like you" className="span-two"><textarea rows="4" value={draft.voice.sample} onChange={(event) => update('voice', 'sample', event.target.value)} /></Field></div></>}
        {tab === 'offerings' && <><SectionHeading icon="folder" title="Offerings" copy="Each product or service the work is allowed to talk about." /><div className="db-offering-list">{draft.offerings.map((item) => <article key={item.id}><span><Icon name="spark" size={16} /></span><div><input value={item.name} aria-label="Offering name" onChange={(event) => setDraft((current) => ({ ...current, offerings: current.offerings.map((entry) => entry.id === item.id ? { ...entry, name: event.target.value } : entry) }))} /><input value={item.who || ''} aria-label="Who it is for" placeholder="Who it is for" onChange={(event) => setDraft((current) => ({ ...current, offerings: current.offerings.map((entry) => entry.id === item.id ? { ...entry, who: event.target.value } : entry) }))} /><textarea rows="2" aria-label="Offering detail" value={item.detail} onChange={(event) => setDraft((current) => ({ ...current, offerings: current.offerings.map((entry) => entry.id === item.id ? { ...entry, detail: event.target.value } : entry) }))} /></div><button onClick={() => setDraft((current) => ({ ...current, offerings: current.offerings.filter((entry) => entry.id !== item.id) }))} aria-label={`Remove ${item.name}`}><Icon name="trash" size={16} /></button></article>)}</div><div className="db-inline-add"><input value={newOffering} onChange={(event) => setNewOffering(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addOffering()} placeholder="Add another product or service" /><Button icon="plus" onClick={addOffering}>Add</Button></div></>}
        {tab === 'messaging' && <><SectionHeading icon="target" title="Messaging" copy="The claims to repeat, the proof behind them, and the lines to leave out." /><div className="db-form-grid two"><Field label="Messaging pillars" className="span-two"><textarea rows="3" value={draft.messaging.pillars} onChange={(event) => update('messaging', 'pillars', event.target.value)} /></Field><Field label="Proof points"><textarea rows="4" value={draft.messaging.proof} onChange={(event) => update('messaging', 'proof', event.target.value)} /></Field><Field label="Differentiator"><textarea rows="4" value={draft.messaging.differentiator} onChange={(event) => update('messaging', 'differentiator', event.target.value)} /></Field><Field label="Always include"><textarea rows="3" value={draft.messaging.required} onChange={(event) => update('messaging', 'required', event.target.value)} /></Field><Field label="Never say"><textarea rows="3" value={draft.messaging.restricted} onChange={(event) => update('messaging', 'restricted', event.target.value)} /></Field><Field label="Default call to action" className="span-two"><input value={draft.messaging.cta} onChange={(event) => update('messaging', 'cta', event.target.value)} /></Field></div></>}
        {tab === 'visual' && <><SectionHeading icon="image" title="Look" copy="Color, photography, and type so generated visuals stay in the same family." /><div className="db-kb-colors">{draft.visual.colors.map((color, index) => <label key={`${color}-${index}`}><input type="color" value={color} aria-label={`Brand color ${index + 1}`} onChange={(event) => update('visual', 'colors', draft.visual.colors.map((entry, entryIndex) => entryIndex === index ? event.target.value.toUpperCase() : entry))} /><b>{color}</b>{draft.visual.colors.length > 1 && <button type="button" aria-label={`Remove color ${color}`} onClick={() => update('visual', 'colors', draft.visual.colors.filter((_, entryIndex) => entryIndex !== index))}><Icon name="close" size={12} /></button>}</label>)}{draft.visual.colors.length < 6 && <button type="button" className="db-kb-add-color" onClick={() => update('visual', 'colors', [...draft.visual.colors, '#3E92CC'])}><Icon name="plus" size={14} />Add color</button>}</div><div className="db-form-grid two"><Field label="Photography"><textarea rows="3" value={draft.visual.imageStyle} onChange={(event) => update('visual', 'imageStyle', event.target.value)} /></Field><Field label="Typography"><textarea rows="3" value={draft.visual.typeStyle} onChange={(event) => update('visual', 'typeStyle', event.target.value)} /></Field></div></>}
        {tab === 'posting' && <><SectionHeading icon="calendar" title="Publishing" copy="Where, how often, and in what rhythm the content should go out." /><div className="db-kb-platforms">{['Instagram', 'Facebook'].map((platform) => <button className={draft.posting.platforms.includes(platform) ? 'active' : ''} key={platform} onClick={() => update('posting', 'platforms', draft.posting.platforms.includes(platform) ? draft.posting.platforms.filter((item) => item !== platform) : [...draft.posting.platforms, platform])}><img src={`/social_logos/${platform.toLowerCase()}.png`} alt="" />{platform}<Icon name="check" size={14} /></button>)}</div><div className="db-form-grid two"><Field label="Frequency"><select value={draft.posting.frequency} onChange={(event) => update('posting', 'frequency', event.target.value)}><option>3 posts per week</option><option>4 posts per week</option><option>5 posts per week</option><option>Daily</option></select></Field><Field label="Timezone"><input value={draft.posting.timezone} onChange={(event) => update('posting', 'timezone', event.target.value)} /></Field><Field label="Best window"><input value={draft.posting.bestTimes} onChange={(event) => update('posting', 'bestTimes', event.target.value)} /></Field><Field label="Hashtags"><input value={draft.posting.hashtags} onChange={(event) => update('posting', 'hashtags', event.target.value)} /></Field><Field label="Content mix" className="span-two"><textarea rows="3" value={draft.posting.mix} onChange={(event) => update('posting', 'mix', event.target.value)} /></Field></div><Toggle checked={draft.posting.autoPublish} onChange={(value) => update('posting', 'autoPublish', value)} label="Automatic publishing" hint="Publish approved calendar items at the scheduled time." /></>}
        {tab === 'metaRules' && <><SectionHeading icon="ads" title="Ads" copy="Defaults applied whenever a vacancy becomes a Meta campaign." /><div className="db-form-grid two"><Field label="Daily budget"><span className="db-input-prefix"><b>$</b><input type="number" value={draft.metaRules.dailyBudget} onChange={(event) => update('metaRules', 'dailyBudget', Number(event.target.value))} /></span></Field><Field label="Default duration"><select value={draft.metaRules.duration} onChange={(event) => update('metaRules', 'duration', Number(event.target.value))}><option value="14">14 days</option><option value="21">21 days</option><option value="30">30 days</option></select></Field><Field label="Objective"><select value={draft.metaRules.objective} onChange={(event) => update('metaRules', 'objective', event.target.value)}><option>Lead generation</option><option>Traffic</option><option>Awareness</option></select></Field><Field label="Lead form"><select value={draft.metaRules.leadForm} onChange={(event) => update('metaRules', 'leadForm', event.target.value)}><option>Higher intent</option><option>More volume</option></select></Field><Field label="Countries" className="span-two"><input value={draft.metaRules.countries} onChange={(event) => update('metaRules', 'countries', event.target.value)} /></Field><Field label="Special ad category"><input value={draft.metaRules.category} readOnly /></Field></div><div className="db-settings-toggles"><Toggle checked={draft.metaRules.reviewMode} onChange={(value) => update('metaRules', 'reviewMode', value)} label="Review before launch" hint="Hold every generated campaign for edits and approval." /><Toggle checked={draft.metaRules.optimize} onChange={(value) => update('metaRules', 'optimize', value)} label="Automatic budget pacing" hint="Use the saved daily budget and delivery window automatically." /></div><div className="db-employment-note"><Icon name="info" size={18} /><p><b>Employment category is locked on.</b> Recruitment campaigns use Meta’s Employment special ad category and its required targeting limitations.</p></div></>}
      </section>
    </div>}
  </div>
}

export function VacanciesView({ notify, onGo }) {
  const [vacancies, setVacancies] = useState(vacancySeed)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', location: '', department: '', type: 'Full-time', requirements: '', benefits: '', application: '' })
  const field = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const create = (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) { notify('Add a title, description, and location first.', 'error'); return }
    setVacancies((current) => [{ id: `vac-${Date.now()}`, title: form.title, location: form.location, department: form.department || 'General', type: form.type, status: 'ready', campaign: 'Ready to generate', applicants: 0, cpl: 0, updated: 'Just now' }, ...current])
    setCreating(false)
    setForm({ title: '', description: '', location: '', department: '', type: 'Full-time', requirements: '', benefits: '', application: '' })
    notify('Vacancy saved and ready for campaign generation.')
  }

  return <div className="db-page db-srs-page">
    <PageIntro eyebrow="Vacancy input" icon="file" title="Turn every open role into a campaign-ready brief." description="Add the role once. Marketeer combines it with the Knowledge Base to generate the complete Meta recruitment campaign." actions={<Button icon="plus" onClick={() => setCreating((value) => !value)}>{creating ? 'Close form' : 'Add vacancy'}</Button>} />
    {creating && <form className="db-card db-vacancy-form" onSubmit={create}><SectionHeading icon="file" title="New vacancy" copy="These fields form the standard vacancy payload for future recruiting-system integrations." /><div className="db-form-grid two"><Field label="Job title"><input value={form.title} onChange={(event) => field('title', event.target.value)} placeholder="Senior Product Designer" autoFocus /></Field><Field label="Location"><input value={form.location} onChange={(event) => field('location', event.target.value)} placeholder="Amsterdam · Hybrid" /></Field><Field label="Department"><input value={form.department} onChange={(event) => field('department', event.target.value)} placeholder="Design" /></Field><Field label="Employment type"><select value={form.type} onChange={(event) => field('type', event.target.value)}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></Field><Field label="Job description" className="span-two"><textarea rows="5" value={form.description} onChange={(event) => field('description', event.target.value)} placeholder="What will this person own and why does the role matter?" /></Field><Field label="Requirements"><textarea rows="5" value={form.requirements} onChange={(event) => field('requirements', event.target.value)} placeholder="Skills, experience, and essential criteria" /></Field><Field label="Benefits"><textarea rows="5" value={form.benefits} onChange={(event) => field('benefits', event.target.value)} placeholder="Compensation, benefits, and what makes the opportunity special" /></Field><Field label="Application details" className="span-two"><input value={form.application} onChange={(event) => field('application', event.target.value)} placeholder="Application URL or instructions" /></Field></div><footer><p><Icon name="spark" size={14} /> Brand context and Meta rules will be applied automatically.</p><Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button><Button type="submit" icon="check">Save vacancy</Button></footer></form>}
    <section className="db-card db-vacancy-table"><header><div><h2>Vacancy pipeline</h2><p>Each vacancy stays linked to its generated campaign and results.</p></div><Badge tone="blue">{vacancies.length} roles</Badge></header><div className="db-table-wrap"><table className="db-table"><thead><tr><th>Vacancy</th><th>Status</th><th>Campaign</th><th>Applicants</th><th>CPL</th><th>Updated</th><th aria-label="Actions" /></tr></thead><tbody>{vacancies.map((vacancy) => <tr key={vacancy.id}><td><div className="db-vacancy-title"><span>{vacancy.title.split(' ').slice(0, 2).map((word) => word[0]).join('')}</span><p><b>{vacancy.title}</b><small>{vacancy.location} · {vacancy.type}</small></p></div></td><td><Badge tone={vacancy.status === 'campaign live' ? 'lime' : vacancy.status === 'in review' ? 'blue' : vacancy.status === 'ready' ? 'orange' : 'gray'}>{vacancy.status}</Badge></td><td><b>{vacancy.campaign}</b></td><td>{vacancy.applicants || '—'}</td><td>{vacancy.cpl ? `$${vacancy.cpl}` : '—'}</td><td>{vacancy.updated}</td><td>{vacancy.status === 'ready' || vacancy.status === 'in review' ? <Button variant="soft" icon="spark" onClick={() => { notify(`Opening campaign builder for ${vacancy.title}.`); onGo('adstudio') }}>Build campaign</Button> : <button className="db-icon-action" onClick={() => onGo('reporting')} aria-label="View reporting"><Icon name="arrow" size={15} /></button>}</td></tr>)}</tbody></table></div></section>
  </div>
}

export function ReportingView({ notify }) {
  const [level, setLevel] = useState('Campaigns')
  const totals = reportingSeed.reduce((sum, row) => ({ spend: sum.spend + row.spend, impressions: sum.impressions + row.impressions, clicks: sum.clicks + row.clicks, leads: sum.leads + row.leads }), { spend: 0, impressions: 0, clicks: 0, leads: 0 })
  const ctr = ((totals.clicks / totals.impressions) * 100).toFixed(2)
  const cpc = (totals.spend / totals.clicks).toFixed(2)
  const cpl = (totals.spend / totals.leads).toFixed(2)

  return <div className="db-page db-srs-page">
    <PageIntro eyebrow="Meta performance" icon="campaigns" title="Every result, traced back to the vacancy." description="Automatically refreshed Meta Insights across vacancy, campaign, and ad levels." actions={<><Field label="Reporting window"><select defaultValue="30"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></Field><Button variant="secondary" icon="refresh" onClick={() => notify('Meta Insights refreshed just now.')}>Refresh</Button></>} />
    <div className="db-report-status"><span><i /> Meta data synced</span><small>Automatic refresh every 30 minutes · Updated just now</small></div>
    <section className="db-report-metrics">{[
      ['Spend', `$${totals.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'wallet'],
      ['Impressions', `${(totals.impressions / 1000).toFixed(1)}K`, 'eye'],
      ['Clicks', totals.clicks.toLocaleString(), 'target'],
      ['CTR', `${ctr}%`, 'campaigns'],
      ['CPC', `$${cpc}`, 'wallet'],
      ['Leads', totals.leads, 'leads'],
      ['Cost per lead', `$${cpl}`, 'optimize'],
    ].map(([label, value, icon]) => <article className="db-card" key={label}><span><Icon name={icon} size={17} /></span><small>{label}</small><strong>{value}</strong><em>↑ healthy</em></article>)}</section>
    <section className="db-card db-report-chart"><header><div><h2>Lead efficiency</h2><p>Spend and lead volume across the selected period.</p></div><div className="db-chart-legend"><span><i /> Leads</span><span><i /> Spend</span></div></header><div className="db-chart-bars">{[38, 52, 46, 64, 58, 78, 74, 88, 70, 96, 84, 100].map((height, index) => <i style={{ '--bar': `${height}%`, '--line': `${Math.max(28, height - 18)}%` }} key={index}><b /><span /></i>)}</div><div className="db-chart-axis"><span>Sep 09</span><span>Sep 16</span><span>Sep 23</span><span>Oct 09</span></div></section>
    <section className="db-card db-data-section db-report-table"><header><div><h2>Performance by vacancy</h2><p>Campaign results remain attached to the role that created them.</p></div><div className="db-view-switch">{['Campaigns', 'Ad sets', 'Ads'].map((item) => <button className={level === item ? 'active' : ''} onClick={() => setLevel(item)} key={item}>{item}</button>)}</div></header><div className="db-table-wrap"><table className="db-table"><thead><tr><th>Vacancy / {level.slice(0, -1)}</th><th>Status</th><th>Spend</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>CPC</th><th>Leads</th><th>CPL</th></tr></thead><tbody>{reportingSeed.map((row) => <tr key={row.id}><td><b>{row.vacancy}</b><small>{level === 'Campaigns' ? row.campaign : level === 'Ad sets' ? `${row.campaign} · Broad` : `${row.campaign} · Creative 01`}</small></td><td><Badge tone={row.status === 'Active' ? 'lime' : row.status === 'Paused' ? 'orange' : 'gray'}>{row.status}</Badge></td><td>${row.spend.toFixed(2)}</td><td>{row.impressions.toLocaleString()}</td><td>{row.clicks.toLocaleString()}</td><td>{row.ctr}%</td><td>${row.cpc}</td><td><b>{row.leads}</b></td><td><b>${row.cpl}</b></td></tr>)}</tbody></table></div></section>
  </div>
}
