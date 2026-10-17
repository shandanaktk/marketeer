import { useEffect, useMemo, useState } from 'react'
import { compact, createVacancy, getAdsStatus, getKnowledge, getReporting, listVacancies, money, relativeTime, saveKnowledge, useResource } from './api.js'
import { RADII } from './countries.js'
import { Badge, Button, EmptyState, ErrorState, Field, Icon, LoadingState, PageIntro, Toggle } from './dashboardUI.jsx'

function SectionHeading({ icon, title, copy }) {
  return <div className="db-section-heading"><span><Icon name={icon} size={18} /></span><div><h2>{title}</h2><p>{copy}</p></div></div>
}

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
  if (!iso) return 'Not saved yet'
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
        <ul>{[data.metaRules.objective, data.metaRules.city ? `${data.metaRules.city} + ${data.metaRules.radius} km` : '', data.metaRules.countries, data.metaRules.leadForm, data.metaRules.category, data.visual.imageStyle, data.visual.typeStyle, data.metaRules.reviewMode ? 'Review before launch' : '', data.metaRules.optimize ? 'Budget pacing on' : ''].filter(Boolean).map((item) => <li key={item}>{item}</li>)}</ul>
      </article>
    </div>
  </div>
}

export function KnowledgeBaseView({ notify, onSaved }) {
  const knowledge = useResource(getKnowledge)
  if (!knowledge.data) {
    return <div className="db-page db-srs-page"><PageIntro eyebrow="Knowledge Base" icon="spark" title="The profile behind every generation." description="This saved profile is what content, campaigns, and ads are written from." />{knowledge.error ? <ErrorState error={knowledge.error} onRetry={knowledge.reload} /> : <LoadingState label="Loading your Knowledge Base…" />}</div>
  }
  return <KnowledgeEditor initial={knowledge.data} notify={notify} onSaved={onSaved} />
}

function KnowledgeEditor({ initial, notify, onSaved }) {
  const [tab, setTab] = useState('brand')
  const [saved, setSaved] = useState(initial.data)
  const [draft, setDraft] = useState(initial.data)
  const [mode, setMode] = useState('preview')
  const [savedAt, setSavedAt] = useState(initial.updated_at)
  const [saving, setSaving] = useState(false)
  const [newOffering, setNewOffering] = useState('')

  const data = mode === 'preview' ? saved : draft
  const score = knowledgeScore(saved)
  const update = (group, key, value) => setDraft((current) => ({ ...current, [group]: { ...current[group], [key]: value } }))
  const addOffering = () => {
    if (!newOffering.trim()) return
    setDraft((current) => ({ ...current, offerings: [...current.offerings, { id: `service-${Date.now()}`, name: newOffering.trim(), detail: '', who: '' }] }))
    setNewOffering('')
  }
  const save = async () => {
    if (!draft.brand.name.trim()) { notify('Add a brand name before saving.', 'error'); setTab('brand'); return }
    setSaving(true)
    try {
      const result = await saveKnowledge(draft)
      setSaved(result.data)
      setDraft(result.data)
      setSavedAt(result.updated_at)
      setMode('preview')
      onSaved?.()
      notify('Knowledge Base saved. This is the profile generations will use.')
    } catch (failure) {
      notify(failure.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return <div className="db-page db-srs-page">
    <PageIntro eyebrow="Knowledge Base" icon="spark" title={mode === 'preview' ? 'The profile behind every generation.' : 'Tell Marketeer who you are.'} description={mode === 'preview' ? 'This saved profile is what content, campaigns, and ads are written from.' : 'The more specific this is, the less generic the work becomes.'} actions={mode === 'preview' ? <Button icon="edit" onClick={() => { setDraft(saved); setMode('edit') }}>Edit knowledge</Button> : <><Button variant="secondary" disabled={saving} onClick={() => { setDraft(saved); setMode('preview') }}>Cancel</Button><Button icon="check" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save knowledge'}</Button></>} />
    <div className="db-context-status db-card"><span><Icon name="spark" size={18} /></span><div><b>{mode === 'preview' ? 'Saved profile' : 'Editing profile'}</b><p>{score.filled} of {score.total} details filled · {savedWhen(savedAt)}</p></div><Badge>{mode === 'preview' ? (saved.brand.name ? 'Ready for generation' : 'Add a brand name') : 'Unsaved edits'}</Badge></div>
    {mode === 'preview' ? <KnowledgePreview data={data} savedAt={savedAt} /> : <div className="db-srs-layout">
      <nav className="db-card db-srs-tabs" aria-label="Knowledge Base sections">{KNOWLEDGE_TABS.map(([id, label], index) => <button className={tab === id ? 'active' : ''} onClick={() => setTab(id)} key={id}><span>{String(index + 1).padStart(2, '0')}</span>{label}<Icon name="arrow" size={14} /></button>)}</nav>
      <section className="db-card db-srs-editor">
        {tab === 'brand' && <><SectionHeading icon="target" title="Identity" copy="The facts a stranger should be able to repeat after one look at your work." /><div className="db-form-grid two"><Field label="Brand name"><input value={draft.brand.name} onChange={(event) => update('brand', 'name', event.target.value)} /></Field><Field label="Website"><input value={draft.brand.website} onChange={(event) => update('brand', 'website', event.target.value)} /></Field><Field label="Tagline" className="span-two"><input value={draft.brand.tagline} onChange={(event) => update('brand', 'tagline', event.target.value)} placeholder="One line people should remember" /></Field><Field label="Industry"><input value={draft.brand.industry} onChange={(event) => update('brand', 'industry', event.target.value)} /></Field><Field label="Based in"><input value={draft.brand.location} onChange={(event) => update('brand', 'location', event.target.value)} /></Field><Field label="What you do" className="span-two"><textarea rows="4" value={draft.brand.description} onChange={(event) => update('brand', 'description', event.target.value)} /></Field><Field label="Mission"><textarea rows="4" value={draft.brand.mission} onChange={(event) => update('brand', 'mission', event.target.value)} /></Field><Field label="Origin story"><textarea rows="4" value={draft.brand.story} onChange={(event) => update('brand', 'story', event.target.value)} /></Field></div></>}
        {tab === 'audience' && <><SectionHeading icon="leads" title="Audience" copy="Who the work is for, and what they are already frustrated by." /><div className="db-form-grid two"><Field label="Primary audience" className="span-two"><textarea rows="3" value={draft.audience.primary} onChange={(event) => update('audience', 'primary', event.target.value)} /></Field><Field label="Secondary audience" className="span-two"><textarea rows="3" value={draft.audience.secondary} onChange={(event) => update('audience', 'secondary', event.target.value)} /></Field><Field label="Pains"><textarea rows="4" value={draft.audience.pains} onChange={(event) => update('audience', 'pains', event.target.value)} /></Field><Field label="Markets"><textarea rows="4" value={draft.audience.markets} onChange={(event) => update('audience', 'markets', event.target.value)} /></Field></div></>}
        {tab === 'voice' && <><SectionHeading icon="content" title="Voice" copy="How the brand should sound when nobody from the team is in the room." /><div className="db-form-grid two"><Field label="Tone"><input value={draft.voice.tone} onChange={(event) => update('voice', 'tone', event.target.value)} /></Field><Field label="Personality"><input value={draft.voice.personality} onChange={(event) => update('voice', 'personality', event.target.value)} placeholder="Warm, precise, confident" /></Field><Field label="Languages" className="span-two"><input value={draft.voice.languages} onChange={(event) => update('voice', 'languages', event.target.value)} /></Field><Field label="A line that sounds like you" className="span-two"><textarea rows="4" value={draft.voice.sample} onChange={(event) => update('voice', 'sample', event.target.value)} /></Field></div></>}
        {tab === 'offerings' && <><SectionHeading icon="folder" title="Offerings" copy="Each product or service the work is allowed to talk about." /><div className="db-offering-list">{draft.offerings.map((item) => <article key={item.id}><span><Icon name="spark" size={16} /></span><div><input value={item.name} aria-label="Offering name" onChange={(event) => setDraft((current) => ({ ...current, offerings: current.offerings.map((entry) => entry.id === item.id ? { ...entry, name: event.target.value } : entry) }))} /><input value={item.who || ''} aria-label="Who it is for" placeholder="Who it is for" onChange={(event) => setDraft((current) => ({ ...current, offerings: current.offerings.map((entry) => entry.id === item.id ? { ...entry, who: event.target.value } : entry) }))} /><textarea rows="2" aria-label="Offering detail" value={item.detail} onChange={(event) => setDraft((current) => ({ ...current, offerings: current.offerings.map((entry) => entry.id === item.id ? { ...entry, detail: event.target.value } : entry) }))} /></div><button onClick={() => setDraft((current) => ({ ...current, offerings: current.offerings.filter((entry) => entry.id !== item.id) }))} aria-label={`Remove ${item.name}`}><Icon name="trash" size={16} /></button></article>)}</div><div className="db-inline-add"><input value={newOffering} onChange={(event) => setNewOffering(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addOffering()} placeholder="Add another product or service" /><Button icon="plus" onClick={addOffering}>Add</Button></div></>}
        {tab === 'messaging' && <><SectionHeading icon="target" title="Messaging" copy="The claims to repeat, the proof behind them, and the lines to leave out." /><div className="db-form-grid two"><Field label="Messaging pillars" className="span-two"><textarea rows="3" value={draft.messaging.pillars} onChange={(event) => update('messaging', 'pillars', event.target.value)} /></Field><Field label="Proof points"><textarea rows="4" value={draft.messaging.proof} onChange={(event) => update('messaging', 'proof', event.target.value)} /></Field><Field label="Differentiator"><textarea rows="4" value={draft.messaging.differentiator} onChange={(event) => update('messaging', 'differentiator', event.target.value)} /></Field><Field label="Always include"><textarea rows="3" value={draft.messaging.required} onChange={(event) => update('messaging', 'required', event.target.value)} /></Field><Field label="Never say"><textarea rows="3" value={draft.messaging.restricted} onChange={(event) => update('messaging', 'restricted', event.target.value)} /></Field><Field label="Default call to action" className="span-two"><input value={draft.messaging.cta} onChange={(event) => update('messaging', 'cta', event.target.value)} /></Field></div></>}
        {tab === 'visual' && <><SectionHeading icon="image" title="Look" copy="Color, photography, and type so generated visuals stay in the same family." /><div className="db-kb-colors">{draft.visual.colors.map((color, index) => <label key={`${color}-${index}`}><input type="color" value={color} aria-label={`Brand color ${index + 1}`} onChange={(event) => update('visual', 'colors', draft.visual.colors.map((entry, entryIndex) => entryIndex === index ? event.target.value.toUpperCase() : entry))} /><b>{color}</b>{draft.visual.colors.length > 1 && <button type="button" aria-label={`Remove color ${color}`} onClick={() => update('visual', 'colors', draft.visual.colors.filter((_, entryIndex) => entryIndex !== index))}><Icon name="close" size={12} /></button>}</label>)}{draft.visual.colors.length < 6 && <button type="button" className="db-kb-add-color" onClick={() => update('visual', 'colors', [...draft.visual.colors, '#3E92CC'])}><Icon name="plus" size={14} />Add color</button>}</div><div className="db-form-grid two"><Field label="Photography"><textarea rows="3" value={draft.visual.imageStyle} onChange={(event) => update('visual', 'imageStyle', event.target.value)} /></Field><Field label="Typography"><textarea rows="3" value={draft.visual.typeStyle} onChange={(event) => update('visual', 'typeStyle', event.target.value)} /></Field></div></>}
        {tab === 'posting' && <><SectionHeading icon="calendar" title="Publishing" copy="Where, how often, and in what rhythm the content should go out." /><div className="db-kb-platforms">{['Instagram', 'Facebook'].map((platform) => <button className={draft.posting.platforms.includes(platform) ? 'active' : ''} key={platform} onClick={() => update('posting', 'platforms', draft.posting.platforms.includes(platform) ? draft.posting.platforms.filter((item) => item !== platform) : [...draft.posting.platforms, platform])}><img src={`/social_logos/${platform.toLowerCase()}.png`} alt="" />{platform}<Icon name="check" size={14} /></button>)}</div><div className="db-form-grid two"><Field label="Frequency"><select value={draft.posting.frequency} onChange={(event) => update('posting', 'frequency', event.target.value)}><option>3 posts per week</option><option>4 posts per week</option><option>5 posts per week</option><option>Daily</option></select></Field><Field label="Timezone"><input value={draft.posting.timezone} onChange={(event) => update('posting', 'timezone', event.target.value)} /></Field><Field label="Best window"><input value={draft.posting.bestTimes} onChange={(event) => update('posting', 'bestTimes', event.target.value)} placeholder="Tuesday to Thursday, 5–7 PM" /></Field><Field label="Hashtags"><input value={draft.posting.hashtags} onChange={(event) => update('posting', 'hashtags', event.target.value)} /></Field><Field label="Content mix" className="span-two"><textarea rows="3" value={draft.posting.mix} onChange={(event) => update('posting', 'mix', event.target.value)} /></Field></div><Toggle checked={draft.posting.autoPublish} onChange={(value) => update('posting', 'autoPublish', value)} label="Automatic publishing" hint="Publish approved calendar items at the scheduled time." /></>}
        {tab === 'metaRules' && <><SectionHeading icon="ads" title="Ads" copy="Defaults applied whenever a vacancy becomes a Meta campaign." /><div className="db-form-grid two"><Field label="Daily budget"><span className="db-input-prefix"><b>$</b><input type="number" min="5" value={draft.metaRules.dailyBudget} onChange={(event) => update('metaRules', 'dailyBudget', Number(event.target.value))} /></span></Field><Field label="Default duration"><select value={draft.metaRules.duration} onChange={(event) => update('metaRules', 'duration', Number(event.target.value))}><option value="14">14 days</option><option value="21">21 days</option><option value="30">30 days</option></select></Field><Field label="Objective"><select value={draft.metaRules.objective} onChange={(event) => update('metaRules', 'objective', event.target.value)}><option>Lead generation</option><option>Traffic</option><option>Awareness</option></select></Field><Field label="Lead form"><select value={draft.metaRules.leadForm} onChange={(event) => update('metaRules', 'leadForm', event.target.value)}><option>Higher intent</option><option>More volume</option></select></Field><Field label="Countries" className="span-two" hint="Where you hire. Vacancies that name their own country override this."><input value={draft.metaRules.countries} onChange={(event) => update('metaRules', 'countries', event.target.value)} placeholder="Netherlands, United Kingdom" /></Field><Field label="City" hint="Optional — leave empty to target the whole country."><input value={draft.metaRules.city} onChange={(event) => update('metaRules', 'city', event.target.value)} placeholder="e.g. Toronto" /></Field><Field label="Radius around the city"><select value={draft.metaRules.radius} disabled={!draft.metaRules.city.trim()} onChange={(event) => update('metaRules', 'radius', Number(event.target.value))}>{RADII.map((km) => <option value={km} key={km}>{km} km</option>)}</select></Field><Field label="Special ad category"><input value={draft.metaRules.category} readOnly /></Field></div><div className="db-settings-toggles"><Toggle checked={draft.metaRules.reviewMode} onChange={(value) => update('metaRules', 'reviewMode', value)} label="Review before launch" hint="Hold every generated campaign for edits and approval." /><Toggle checked={draft.metaRules.optimize} onChange={(value) => update('metaRules', 'optimize', value)} label="Automatic budget pacing" hint="Use the saved daily budget and delivery window automatically." /></div><div className="db-employment-note"><Icon name="info" size={18} /><p><b>Employment category is locked on.</b> Recruitment campaigns use Meta’s Employment special ad category and its required targeting limitations.</p></div></>}
      </section>
    </div>}
  </div>
}

const EMPTY_VACANCY = { title: '', description: '', location: '', department: '', type: 'Full-time', requirements: '', benefits: '', application: '' }
const vacancyTone = (status) => status === 'campaign live' ? 'lime' : status === 'in review' ? 'blue' : status === 'ready' ? 'orange' : status === 'paused' ? 'orange' : 'gray'

export function VacanciesView({ notify, onGo }) {
  const vacancies = useResource(listVacancies)
  const ads = useResource(() => getAdsStatus().catch(() => null))
  const currency = ads.data?.ad_account?.currency || 'USD'
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_VACANCY)
  const field = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const create = async (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) { notify('Add a title, description, and location first.', 'error'); return }
    setSaving(true)
    try {
      const created = await createVacancy(form)
      vacancies.setData((current) => [created, ...(current || [])])
      setCreating(false)
      setForm(EMPTY_VACANCY)
      notify(created.automation?.auto ? 'Vacancy saved. Its campaign is being generated and launched automatically.' : 'Vacancy saved and ready for campaign generation.')
    } catch (failure) {
      notify(failure.message, 'error')
    } finally {
      setSaving(false)
    }
  }
  const list = vacancies.data || []

  return <div className="db-page db-srs-page">
    <PageIntro eyebrow="Vacancy input" icon="file" title="Turn every open role into a campaign-ready brief." description="Add the role once. Marketeer combines it with the Knowledge Base to generate the complete Meta recruitment campaign." actions={<Button icon="plus" onClick={() => setCreating((value) => !value)}>{creating ? 'Close form' : 'Add vacancy'}</Button>} />
    {creating && <form className="db-card db-vacancy-form" onSubmit={create}><SectionHeading icon="file" title="New vacancy" copy="These fields form the standard vacancy payload for future recruiting-system integrations." /><div className="db-form-grid two"><Field label="Job title"><input value={form.title} onChange={(event) => field('title', event.target.value)} placeholder="Senior Product Designer" autoFocus /></Field><Field label="Location"><input value={form.location} onChange={(event) => field('location', event.target.value)} placeholder="Amsterdam · Hybrid" /></Field><Field label="Department"><input value={form.department} onChange={(event) => field('department', event.target.value)} placeholder="Design" /></Field><Field label="Employment type"><select value={form.type} onChange={(event) => field('type', event.target.value)}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></Field><Field label="Job description" className="span-two"><textarea rows="5" value={form.description} onChange={(event) => field('description', event.target.value)} placeholder="What will this person own and why does the role matter?" /></Field><Field label="Requirements"><textarea rows="5" value={form.requirements} onChange={(event) => field('requirements', event.target.value)} placeholder="Skills, experience, and essential criteria" /></Field><Field label="Benefits"><textarea rows="5" value={form.benefits} onChange={(event) => field('benefits', event.target.value)} placeholder="Compensation, benefits, and what makes the opportunity special" /></Field><Field label="Application details" className="span-two"><input value={form.application} onChange={(event) => field('application', event.target.value)} placeholder="Application URL or instructions" /></Field></div><footer><p><Icon name="spark" size={14} /> Brand context and Meta rules will be applied automatically.</p><Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button><Button type="submit" icon="check" disabled={saving}>{saving ? 'Saving…' : 'Save vacancy'}</Button></footer></form>}
    <section className="db-card db-vacancy-table"><header><div><h2>Vacancy pipeline</h2><p>Each vacancy stays linked to its generated campaign and results.</p></div><Badge tone="blue">{list.length} role{list.length === 1 ? '' : 's'}</Badge></header>
      {vacancies.loading && !vacancies.data ? <LoadingState label="Loading vacancies…" /> : vacancies.error && !vacancies.data ? <ErrorState error={vacancies.error} onRetry={vacancies.reload} /> : list.length ? <div className="db-table-wrap"><table className="db-table"><thead><tr><th>Vacancy</th><th>Status</th><th>Campaign</th><th>Applicants</th><th>CPL</th><th>Updated</th><th aria-label="Actions" /></tr></thead><tbody>{list.map((vacancy) => <tr key={vacancy.id}><td><div className="db-vacancy-title"><span>{vacancy.title.split(' ').slice(0, 2).map((word) => word[0]).join('')}</span><p><b>{vacancy.title}</b><small>{vacancy.location} · {vacancy.type}</small></p></div></td><td><Badge tone={vacancyTone(vacancy.status)}>{vacancy.status}</Badge></td><td><b>{vacancy.campaign}</b></td><td>{vacancy.applicants || '—'}</td><td>{vacancy.cpl ? money(vacancy.cpl, currency) : '—'}</td><td>{relativeTime(vacancy.updated_at)}</td><td>{vacancy.status === 'ready' || vacancy.status === 'in review' ? <Button variant="soft" icon="spark" onClick={() => { notify(`Opening campaign builder for ${vacancy.title}.`); onGo('adstudio', { vacancyId: vacancy.id }) }}>Build campaign</Button> : <button className="db-icon-action" onClick={() => onGo('reporting')} aria-label="View reporting"><Icon name="arrow" size={15} /></button>}</td></tr>)}</tbody></table></div> : <EmptyState icon="file" title="No vacancies yet" body="Add a role to turn it into a Meta recruitment campaign." action={<Button icon="plus" onClick={() => setCreating(true)}>Add vacancy</Button>} />}
    </section>
  </div>
}

const WINDOWS = { 7: 'last_7d', 30: 'last_30d', 90: 'last_90d' }
const REFRESH_MS = 30 * 60 * 1000

function bucketSeries(series, buckets = 12) {
  if (!series?.length) return { bars: [], axis: [] }
  const size = Math.max(1, Math.ceil(series.length / buckets))
  const groups = []
  for (let index = 0; index < series.length; index += size) {
    const slice = series.slice(index, index + size)
    groups.push({ date: slice[0].date, leads: slice.reduce((sum, day) => sum + day.leads, 0), spend: slice.reduce((sum, day) => sum + day.spend, 0) })
  }
  const maxLeads = Math.max(...groups.map((group) => group.leads), 1)
  const maxSpend = Math.max(...groups.map((group) => group.spend), 1)
  const bars = groups.map((group) => ({ ...group, bar: Math.max(4, Math.round((group.leads / maxLeads) * 100)), line: Math.max(4, Math.round((group.spend / maxSpend) * 100)) }))
  const label = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
  const picks = [0, Math.floor((groups.length - 1) / 3), Math.floor(((groups.length - 1) * 2) / 3), groups.length - 1]
  return { bars, axis: [...new Set(picks)].map((index) => label(groups[index].date)) }
}

function trend(value, { lowerIsBetter = false, points = false } = {}) {
  if (value === null || value === undefined) return 'No prior period'
  const arrow = value === 0 ? '→' : value > 0 ? '↑' : '↓'
  const good = value === 0 ? 'steady' : (value > 0) !== lowerIsBetter ? 'improving' : 'watch'
  return `${arrow} ${Math.abs(value).toFixed(points ? 2 : 1)}${points ? ' pts' : '%'} · ${good}`
}

export function ReportingView({ notify, connected, loadingStatus, onManage }) {
  const [windowDays, setWindowDays] = useState('30')
  const [level, setLevel] = useState('Campaigns')
  const report = useResource((options) => (connected ? getReporting({ datePreset: WINDOWS[windowDays], refresh: options?.refresh }) : Promise.resolve(null)), [windowDays, connected])
  const { data, reload } = report
  useEffect(() => {
    if (!connected) return undefined
    const timer = window.setInterval(() => reload({ refresh: true }), REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [connected, reload])
  const chart = useMemo(() => bucketSeries(data?.series), [data])
  const refresh = async () => { const result = await report.reload({ refresh: true }); if (result) notify('Meta Insights refreshed just now.') }
  useEffect(() => { if (report.error && data) notify(report.error.message, 'error') }, [report.error, data, notify])
  const rows = data ? data.rows[level === 'Campaigns' ? 'campaign' : level === 'Ad sets' ? 'adset' : 'ad'] : []
  const totals = data?.totals
  const currency = data?.currency || 'USD'

  return <div className="db-page db-srs-page">
    <PageIntro eyebrow="Meta performance" icon="campaigns" title="Every result, traced back to the vacancy." description="Automatically refreshed Meta Insights across vacancy, campaign, and ad levels." actions={<><Field label="Reporting window"><select value={windowDays} onChange={(event) => setWindowDays(event.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></Field><Button className="db-refresh-button" variant="secondary" icon="refresh" disabled={!connected || report.loading} onClick={refresh}>{report.loading && data ? 'Refreshing…' : 'Refresh'}</Button></>} />
    {!connected ? (loadingStatus ? <LoadingState label="Checking your Meta connection…" /> : <EmptyState icon="campaigns" title="Connect Meta Ads to see reporting" body="Campaign results appear here, traced back to the vacancy that created them." action={<Button icon="link" onClick={onManage}>Connect Meta Ads</Button>} />) : !data ? (report.error ? <ErrorState error={report.error} onRetry={report.reload} /> : <LoadingState label="Loading Meta Insights…" />) : <>
      <div className="db-report-status"><span><i /> Meta data synced</span><small>Automatic refresh every 30 minutes · Updated {relativeTime(data.fetched_at).toLowerCase()}</small></div>
      <section className="db-report-metrics">{[
        ['Spend', money(totals.spend, currency, 0), 'wallet', trend(data.deltas.spend)],
        ['Impressions', compact(totals.impressions), 'eye', trend(data.deltas.impressions)],
        ['Clicks', totals.clicks.toLocaleString(), 'target', trend(data.deltas.clicks)],
        ['CTR', `${Number(totals.ctr).toFixed(2)}%`, 'campaigns', trend(data.deltas.ctr, { points: true })],
        ['CPC', money(totals.cpc, currency), 'wallet', trend(data.deltas.cpc, { lowerIsBetter: true })],
        ['Leads', totals.leads, 'leads', trend(data.deltas.leads)],
        ['Cost per lead', totals.leads ? money(totals.cpl, currency) : '—', 'optimize', trend(data.deltas.cpl, { lowerIsBetter: true })],
      ].map(([label, value, icon, note]) => <article className="db-card" key={label}><span><Icon name={icon} size={17} /></span><small>{label}</small><strong>{value}</strong><em>{note}</em></article>)}</section>
      <section className="db-card db-report-chart"><header><div><h2>Lead efficiency</h2><p>Spend and lead volume across the selected period.</p></div><div className="db-chart-legend"><span><i /> Leads</span><span><i /> Spend</span></div></header>{chart.bars.length ? <><div className="db-chart-bars">{chart.bars.map((bar, index) => <i style={{ '--bar': `${bar.bar}%`, '--line': `${bar.line}%` }} key={index} title={`${bar.date}: ${bar.leads} leads · ${money(bar.spend, currency)}`}><b /><span /></i>)}</div><div className="db-chart-axis">{chart.axis.map((label) => <span key={label}>{label}</span>)}</div></> : <p className="db-helper">No delivery in this window yet.</p>}</section>
      <section className="db-card db-data-section db-report-table"><header><div><h2>Performance by vacancy</h2><p>Campaign results remain attached to the role that created them.</p></div><div className="db-view-switch">{['Campaigns', 'Ad sets', 'Ads'].map((item) => <button className={level === item ? 'active' : ''} onClick={() => setLevel(item)} key={item}>{item}</button>)}</div></header>{rows.length ? <div className="db-table-wrap"><table className="db-table"><thead><tr><th>Vacancy / {level.slice(0, -1)}</th><th>Status</th><th>Spend</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>CPC</th><th>Leads</th><th>CPL</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><b>{row.vacancy}</b><small>{level === 'Campaigns' ? row.name : `${row.campaign} · ${row.name}`}</small></td><td><Badge tone={row.state === 'active' ? 'lime' : row.state === 'paused' ? 'orange' : row.state === 'learning' ? 'blue' : 'gray'}>{row.status}</Badge></td><td>{money(row.spend, currency)}</td><td>{row.impressions.toLocaleString()}</td><td>{row.clicks.toLocaleString()}</td><td>{Number(row.ctr).toFixed(2)}%</td><td>{money(row.cpc, currency)}</td><td><b>{row.leads}</b></td><td><b>{row.leads ? money(row.cpl, currency) : '—'}</b></td></tr>)}</tbody></table></div> : <EmptyState icon="campaigns" title="No campaign results yet" body="Launch a campaign from a vacancy and its results will appear here." />}</section>
    </>}
  </div>
}
