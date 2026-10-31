import { useEffect, useMemo, useState } from 'react'
import { formatDate, formatDateTime, formatNumber, t } from './i18n.js'
import { compact, importVacancy, redraftVacancy, relaunchVacancy, currencySymbol, getAdsStatus, getKnowledge, getReporting, listVacancies, money, relativeTime, saveKnowledge, uploadMedia, useResource } from './api.js'
import { RADII } from './countries.js'
import { Badge, Button, EmptyState, ErrorState, Field, Icon, LoadingState, Modal, PageIntro, Toggle } from './dashboardUI.jsx'

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
  if (!iso) return t('Not saved yet')
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return t('Saved just now')
  if (minutes < 60) return t('Saved {n} min ago', { n: minutes })
  return t('Saved {when}', { when: formatDateTime(iso) })
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
        <h2>{data.brand.name || t('Your brand')}</h2>
        {data.brand.tagline && <p className="db-kb-tagline">{data.brand.tagline}</p>}
        <div className="db-kb-meta">{[data.brand.industry, data.brand.location, data.brand.website].filter(Boolean).map((item) => <span key={item}>{item}</span>)}</div>
      </div>
      {data.visual.colors.length > 0 && <div className="db-kb-swatches">{data.visual.colors.map((color) => <i style={{ background: color }} key={color} title={color} />)}</div>}
      {data.brand.description && <p>{data.brand.description}</p>}
    </article>
    {(data.brand.mission || data.brand.story) && <div className="db-kb-split">
      {data.brand.mission && <article className="db-card"><small>{t('Mission')}</small><p>{data.brand.mission}</p></article>}
      {data.brand.story && <article className="db-card"><small>{t('Origin')}</small><p>{data.brand.story}</p></article>}
    </div>}
    {facts.length > 0 && <div className="db-kb-facts">{facts.map(([label, value]) => <article className="db-card" key={label}><small>{t(label)}</small><b>{value}</b></article>)}</div>}
    {data.audience.pains && <article className="db-card db-kb-note"><small>{t('What they are tired of')}</small><p>{data.audience.pains}</p></article>}
    {data.voice.sample && <article className="db-card db-kb-quote"><small>{t('How it should sound')}</small><p>{data.voice.sample}</p></article>}
    {data.offerings.length > 0 && <section className="db-kb-block"><header><h3>{t('What you offer')}</h3></header><div className="db-kb-offers">{data.offerings.map((item) => <article className="db-card" key={item.id}><b>{item.name}</b>{item.who && <em>{item.who}</em>}<p>{item.detail}</p></article>)}</div></section>}
    <section className="db-kb-block"><header><h3>{t('What every piece should say')}</h3></header><div className="db-kb-messages">{[
      ['Pillars', data.messaging.pillars],
      ['Proof', data.messaging.proof],
      ['Always include', data.messaging.required],
      ['Never say', data.messaging.restricted],
      ['Difference', data.messaging.differentiator],
      ['Call to action', data.messaging.cta],
    ].filter(([, value]) => value).map(([label, value]) => <article className="db-card" key={label}><small>{t(label)}</small><p>{value}</p></article>)}</div></section>
    <div className="db-kb-split">
      <article className="db-card db-kb-publish">
        <small>{t('Publishing')}</small>
        <div className="db-kb-logos">{data.posting.platforms.map((platform) => <img src={`/social_logos/${platform.toLowerCase()}.png`} alt={platform} key={platform} />)}</div>
        <ul>{[t(data.posting.frequency), data.posting.timezone, data.posting.bestTimes, data.posting.mix, data.posting.hashtags, data.posting.autoPublish ? t('Publishes automatically after approval') : t('Holds every post for a manual publish')].filter(Boolean).map((item) => <li key={item}>{item}</li>)}</ul>
      </article>
      <article className="db-card db-kb-publish">
        <small>{t('Meta ads')}</small>
        <strong>{money(data.metaRules.dailyBudget, undefined, 0)}{t('/day')} · {t('{n} days', { n: data.metaRules.duration })}</strong>
        <ul>{[t(data.metaRules.objective), data.metaRules.city ? `${data.metaRules.city} + ${data.metaRules.radius} km` : '', data.metaRules.countries, data.metaRules.leadForm, data.metaRules.category, data.visual.imageStyle, data.visual.typeStyle, t('Launches automatically'), data.metaRules.optimize ? t('Budget pacing on') : ''].filter(Boolean).map((item) => <li key={item}>{item}</li>)}</ul>
      </article>
    </div>
  </div>
}

export function KnowledgeBaseView({ notify, onSaved }) {
  const knowledge = useResource(getKnowledge)
  if (!knowledge.data) {
    return <div className="db-page db-srs-page"><PageIntro eyebrow={t('Knowledge Base')} icon="spark" title={t('The profile behind every generation.')} description={t('This saved profile is what content, campaigns, and ads are written from.')} />{knowledge.error ? <ErrorState error={knowledge.error} onRetry={knowledge.reload} /> : <LoadingState label={t('Loading your Knowledge Base…')} />}</div>
  }
  return <KnowledgeEditor initial={knowledge.data} notify={notify} onSaved={onSaved} />
}

const LOGO_POSITIONS = [['top-left', 'Top left'], ['top-right', 'Top right'], ['bottom-left', 'Bottom left'], ['bottom-right', 'Bottom right']]

function LogoSettings({ draft, update }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const choose = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true); setError('')
    try { update('brand', 'logo', (await uploadMedia(file)).url) } catch (failure) { setError(failure.message) } finally { setUploading(false) }
  }
  const { logoOnPosts, logoPosition, logoSize } = draft.visual
  return <div className="db-kb-logo">
    <div className={`db-logo-stage ${logoPosition}`}>{draft.brand.logo ? <img src={draft.brand.logo} alt={t('Your logo')} style={{ width: `${{ Small: 22, Medium: 30, Large: 40 }[logoSize] || 30}%` }} /> : <span>{t('No logo yet')}</span>}<b>{t('YOUR MESSAGE')}</b></div>
    <div className="db-kb-logo-controls">
      <Field label={t('Logo')} hint={t('PNG with a transparent background works best.')}><label className="db-file-button"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={choose} />{uploading ? t('Uploading…') : draft.brand.logo ? t('Replace logo') : t('Upload logo')}</label></Field>
      <Toggle checked={logoOnPosts} onChange={(value) => update('visual', 'logoOnPosts', value)} label={t('Logo on every post')} hint={t('Stamped on generated posts, stories, reels and ad images.')} />
      <Field label={t('Position')}><div className="db-view-switch">{LOGO_POSITIONS.map(([id, label]) => <button type="button" className={logoPosition === id ? 'active' : ''} onClick={() => update('visual', 'logoPosition', id)} key={id}>{t(label)}</button>)}</div></Field>
      <Field label={t('Size')}><div className="db-view-switch">{['Small', 'Medium', 'Large'].map((size) => <button type="button" className={logoSize === size ? 'active' : ''} onClick={() => update('visual', 'logoSize', size)} key={size}>{t(size)}</button>)}</div></Field>
      {error && <p className="db-warning">{error}</p>}
    </div>
  </div>
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
    if (!draft.brand.name.trim()) { notify(t('Add a brand name before saving.'), 'error'); setTab('brand'); return }
    setSaving(true)
    try {
      const result = await saveKnowledge(draft)
      setSaved(result.data)
      setDraft(result.data)
      setSavedAt(result.updated_at)
      setMode('preview')
      onSaved?.()
      notify(t('Knowledge Base saved. This is the profile generations will use.'))
    } catch (failure) {
      notify(failure.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return <div className="db-page db-srs-page">
    <PageIntro eyebrow={t('Knowledge Base')} icon="spark" title={mode === 'preview' ? t('The profile behind every generation.') : t('Tell Marketeer who you are.')} description={mode === 'preview' ? t('This saved profile is what content, campaigns, and ads are written from.') : t('The more specific this is, the less generic the work becomes.')} actions={mode === 'preview' ? <Button icon="edit" onClick={() => { setDraft(saved); setMode('edit') }}>{t('Edit knowledge')}</Button> : <><Button variant="secondary" disabled={saving} onClick={() => { setDraft(saved); setMode('preview') }}>{t('Cancel')}</Button><Button icon="check" disabled={saving} onClick={save}>{saving ? t('Saving…') : t('Save knowledge')}</Button></>} />
    <div className="db-context-status db-card"><span><Icon name="spark" size={18} /></span><div><b>{mode === 'preview' ? t('Saved profile') : t('Editing profile')}</b><p>{t('{a} of {b} details filled', { a: score.filled, b: score.total })} · {savedWhen(savedAt)}</p></div><Badge>{mode === 'preview' ? (saved.brand.name ? t('Ready for generation') : t('Add a brand name')) : t('Unsaved edits')}</Badge></div>
    {mode === 'preview' ? <KnowledgePreview data={data} savedAt={savedAt} /> : <div className="db-srs-layout">
      <nav className="db-card db-srs-tabs" aria-label={t('Knowledge Base sections')}>{KNOWLEDGE_TABS.map(([id, label], index) => <button className={tab === id ? 'active' : ''} onClick={() => setTab(id)} key={id}><span>{String(index + 1).padStart(2, '0')}</span>{t(label)}<Icon name="arrow" size={14} /></button>)}</nav>
      <section className="db-card db-srs-editor">
        {tab === 'brand' && <><SectionHeading icon="target" title={t('Identity')} copy={t('The facts a stranger should be able to repeat after one look at your work.')} /><div className="db-form-grid two"><Field label={t('Brand name')}><input value={draft.brand.name} onChange={(event) => update('brand', 'name', event.target.value)} /></Field><Field label={t('Website')}><input value={draft.brand.website} onChange={(event) => update('brand', 'website', event.target.value)} /></Field><Field label={t('Tagline')} className="span-two"><input value={draft.brand.tagline} onChange={(event) => update('brand', 'tagline', event.target.value)} placeholder={t('One line people should remember')} /></Field><Field label={t('Industry')}><input value={draft.brand.industry} onChange={(event) => update('brand', 'industry', event.target.value)} /></Field><Field label={t('Based in')}><input value={draft.brand.location} onChange={(event) => update('brand', 'location', event.target.value)} /></Field><Field label={t('What you do')} className="span-two"><textarea rows="4" value={draft.brand.description} onChange={(event) => update('brand', 'description', event.target.value)} /></Field><Field label={t('Mission')}><textarea rows="4" value={draft.brand.mission} onChange={(event) => update('brand', 'mission', event.target.value)} /></Field><Field label={t('Origin story')}><textarea rows="4" value={draft.brand.story} onChange={(event) => update('brand', 'story', event.target.value)} /></Field></div></>}
        {tab === 'audience' && <><SectionHeading icon="leads" title={t('Audience')} copy={t('Who the work is for, and what they are already frustrated by.')} /><div className="db-form-grid two"><Field label={t('Primary audience')} className="span-two"><textarea rows="3" value={draft.audience.primary} onChange={(event) => update('audience', 'primary', event.target.value)} /></Field><Field label={t('Secondary audience')} className="span-two"><textarea rows="3" value={draft.audience.secondary} onChange={(event) => update('audience', 'secondary', event.target.value)} /></Field><Field label={t('Pains')}><textarea rows="4" value={draft.audience.pains} onChange={(event) => update('audience', 'pains', event.target.value)} /></Field><Field label={t('Markets')}><textarea rows="4" value={draft.audience.markets} onChange={(event) => update('audience', 'markets', event.target.value)} /></Field></div></>}
        {tab === 'voice' && <><SectionHeading icon="content" title={t('Voice')} copy={t('How the brand should sound when nobody from the team is in the room.')} /><div className="db-form-grid two"><Field label={t('Tone')}><input value={draft.voice.tone} onChange={(event) => update('voice', 'tone', event.target.value)} /></Field><Field label={t('Personality')}><input value={draft.voice.personality} onChange={(event) => update('voice', 'personality', event.target.value)} placeholder={t('Warm, precise, confident')} /></Field><Field label={t('Languages')} className="span-two"><input value={draft.voice.languages} onChange={(event) => update('voice', 'languages', event.target.value)} /></Field><Field label={t('A line that sounds like you')} className="span-two"><textarea rows="4" value={draft.voice.sample} onChange={(event) => update('voice', 'sample', event.target.value)} /></Field></div></>}
        {tab === 'offerings' && <><SectionHeading icon="folder" title={t('Offerings')} copy={t('Each product or service the work is allowed to talk about.')} /><div className="db-offering-list">{draft.offerings.map((item) => <article key={item.id}><span><Icon name="spark" size={16} /></span><div><input value={item.name} aria-label={t('Offering name')} onChange={(event) => setDraft((current) => ({ ...current, offerings: current.offerings.map((entry) => entry.id === item.id ? { ...entry, name: event.target.value } : entry) }))} /><input value={item.who || ''} aria-label={t('Who it is for')} placeholder={t('Who it is for')} onChange={(event) => setDraft((current) => ({ ...current, offerings: current.offerings.map((entry) => entry.id === item.id ? { ...entry, who: event.target.value } : entry) }))} /><textarea rows="2" aria-label={t('Offering detail')} value={item.detail} onChange={(event) => setDraft((current) => ({ ...current, offerings: current.offerings.map((entry) => entry.id === item.id ? { ...entry, detail: event.target.value } : entry) }))} /></div><button onClick={() => setDraft((current) => ({ ...current, offerings: current.offerings.filter((entry) => entry.id !== item.id) }))} aria-label={t('Remove {name}', { name: item.name })}><Icon name="trash" size={16} /></button></article>)}</div><div className="db-inline-add"><input value={newOffering} onChange={(event) => setNewOffering(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addOffering()} placeholder={t('Add another product or service')} /><Button icon="plus" onClick={addOffering}>{t('Add')}</Button></div></>}
        {tab === 'messaging' && <><SectionHeading icon="target" title={t('Messaging')} copy={t('The claims to repeat, the proof behind them, and the lines to leave out.')} /><div className="db-form-grid two"><Field label={t('Messaging pillars')} className="span-two"><textarea rows="3" value={draft.messaging.pillars} onChange={(event) => update('messaging', 'pillars', event.target.value)} /></Field><Field label={t('Proof points')}><textarea rows="4" value={draft.messaging.proof} onChange={(event) => update('messaging', 'proof', event.target.value)} /></Field><Field label={t('Differentiator')}><textarea rows="4" value={draft.messaging.differentiator} onChange={(event) => update('messaging', 'differentiator', event.target.value)} /></Field><Field label={t('Always include')}><textarea rows="3" value={draft.messaging.required} onChange={(event) => update('messaging', 'required', event.target.value)} /></Field><Field label={t('Never say')}><textarea rows="3" value={draft.messaging.restricted} onChange={(event) => update('messaging', 'restricted', event.target.value)} /></Field><Field label={t('Default call to action')} className="span-two"><input value={draft.messaging.cta} onChange={(event) => update('messaging', 'cta', event.target.value)} /></Field></div></>}
        {tab === 'visual' && <><SectionHeading icon="image" title={t('Look')} copy={t('Color, photography, and type so generated visuals stay in the same family.')} /><div className="db-kb-colors">{draft.visual.colors.map((color, index) => <label key={`${color}-${index}`}><input type="color" value={color} aria-label={t('Brand color {n}', { n: index + 1 })} onChange={(event) => update('visual', 'colors', draft.visual.colors.map((entry, entryIndex) => entryIndex === index ? event.target.value.toUpperCase() : entry))} /><b>{color}</b>{draft.visual.colors.length > 1 && <button type="button" aria-label={t('Remove color {color}', { color })} onClick={() => update('visual', 'colors', draft.visual.colors.filter((_, entryIndex) => entryIndex !== index))}><Icon name="close" size={12} /></button>}</label>)}{draft.visual.colors.length < 6 && <button type="button" className="db-kb-add-color" onClick={() => update('visual', 'colors', [...draft.visual.colors, '#B3DC1F'])}><Icon name="plus" size={14} />{t('Add color')}</button>}</div><LogoSettings draft={draft} update={update} /><div className="db-form-grid two"><Field label={t('Photography')}><textarea rows="3" value={draft.visual.imageStyle} onChange={(event) => update('visual', 'imageStyle', event.target.value)} /></Field><Field label={t('Typography')}><textarea rows="3" value={draft.visual.typeStyle} onChange={(event) => update('visual', 'typeStyle', event.target.value)} /></Field></div></>}
        {tab === 'posting' && <><SectionHeading icon="calendar" title={t('Publishing')} copy={t('Where, how often, and in what rhythm the content should go out.')} /><div className="db-kb-platforms">{['Instagram', 'Facebook'].map((platform) => <button className={draft.posting.platforms.includes(platform) ? 'active' : ''} key={platform} onClick={() => update('posting', 'platforms', draft.posting.platforms.includes(platform) ? draft.posting.platforms.filter((item) => item !== platform) : [...draft.posting.platforms, platform])}><img src={`/social_logos/${platform.toLowerCase()}.png`} alt="" />{platform}<Icon name="check" size={14} /></button>)}</div><div className="db-form-grid two"><Field label={t('Frequency')}><select value={draft.posting.frequency} onChange={(event) => update('posting', 'frequency', event.target.value)}><option value="3 posts per week">{t('3 posts per week')}</option><option value="4 posts per week">{t('4 posts per week')}</option><option value="5 posts per week">{t('5 posts per week')}</option><option value="Daily">{t('Daily')}</option></select></Field><Field label={t('Timezone')}><input value={draft.posting.timezone} onChange={(event) => update('posting', 'timezone', event.target.value)} /></Field><Field label={t('Best window')}><input value={draft.posting.bestTimes} onChange={(event) => update('posting', 'bestTimes', event.target.value)} placeholder={t('Tuesday to Thursday, 5–7 PM')} /></Field><Field label={t('Hashtags')}><input value={draft.posting.hashtags} onChange={(event) => update('posting', 'hashtags', event.target.value)} /></Field><Field label={t('Content mix')} className="span-two"><textarea rows="3" value={draft.posting.mix} onChange={(event) => update('posting', 'mix', event.target.value)} /></Field></div><Toggle checked={draft.posting.autoPublish} onChange={(value) => update('posting', 'autoPublish', value)} label={t('Automatic publishing')} hint={t('Publish approved calendar items at the scheduled time.')} /></>}
        {tab === 'metaRules' && <><SectionHeading icon="ads" title={t('Ads')} copy={t('Defaults applied whenever a vacancy becomes a Meta campaign.')} /><div className="db-form-grid two"><Field label={t('Daily budget')}><span className="db-input-prefix"><b>{currencySymbol()}</b><input type="number" min="5" value={draft.metaRules.dailyBudget} onChange={(event) => update('metaRules', 'dailyBudget', Number(event.target.value))} /></span></Field><Field label={t('Default duration')}><select value={draft.metaRules.duration} onChange={(event) => update('metaRules', 'duration', Number(event.target.value))}><option value="14">{t('14 days')}</option><option value="21">{t('21 days')}</option><option value="30">{t('30 days')}</option></select></Field><Field label={t('Objective')}><select value={draft.metaRules.objective} onChange={(event) => update('metaRules', 'objective', event.target.value)}><option value="Lead generation">{t('Lead generation')}</option><option value="Traffic">{t('Traffic')}</option><option value="Awareness">{t('Awareness')}</option></select></Field><Field label={t('Lead form')}><select value={draft.metaRules.leadForm} onChange={(event) => update('metaRules', 'leadForm', event.target.value)}><option value="Higher intent">{t('Higher intent')}</option><option value="More volume">{t('More volume')}</option></select></Field><Field label={t('Countries')} className="span-two" hint={t('Where you hire. Vacancies that name their own country override this.')}><input value={draft.metaRules.countries} onChange={(event) => update('metaRules', 'countries', event.target.value)} placeholder={t('Switzerland, Germany')} /></Field><Field label={t('City')} hint={t('Optional — leave empty to target the whole country.')}><input value={draft.metaRules.city} onChange={(event) => update('metaRules', 'city', event.target.value)} placeholder={t('e.g. Schwyz')} /></Field><Field label={t('Radius around the city')}><select value={draft.metaRules.radius} disabled={!draft.metaRules.city.trim()} onChange={(event) => update('metaRules', 'radius', Number(event.target.value))}>{RADII.map((km) => <option value={km} key={km}>{km} km</option>)}</select></Field><Field label={t('Special ad category')}><input value={draft.metaRules.category} readOnly /></Field></div><div className="db-settings-toggles"><Toggle checked={draft.metaRules.optimize} onChange={(value) => update('metaRules', 'optimize', value)} label={t('Automatic budget pacing')} hint={t('Use the saved daily budget and delivery window automatically.')} /></div><div className="db-employment-note"><Icon name="info" size={18} /><p><b>{t('Employment category is locked on.')}</b> {t('Recruitment campaigns use Meta’s Employment special ad category and its required targeting limitations.')}</p></div></>}
      </section>
    </div>}
  </div>
}

function automationMessage(automation) {
  if (automation?.auto) return t('The AI is building the campaign and launches it automatically.')
  if (automation?.reason === 'connect_meta') return t('Vacancy imported. Connect Meta Ads and the AI builds and launches its campaign automatically.')
  if (automation?.reason === 'ai_not_configured') return t('Vacancy imported. AI generation is not configured on the server.')
  return automation?.reason ? t('Vacancy imported, but the campaign could not start: {reason}', { reason: automation.reason }) : t('Vacancy imported.')
}

const vacancyTone = (status) => status === 'campaign live' ? 'lime' : status === 'drafting' ? 'blue' : status === 'ready' || status === 'paused' || status === 'in review' ? 'orange' : 'gray'
const SOURCES = [['auto', 'Detect automatically'], ['own', 'Our vacancy'], ['client', 'Client vacancy']]
const IMPORT_STEPS = ['Reading the vacancy page…', 'Extracting the role, tasks and profile…', 'Writing it in your style…', 'Starting the campaign…']
const LIVE = ['campaign live', 'paused', 'completed']

function SourceBadge({ vacancy }) {
  if (vacancy.source === 'client') return <span className="db-source-tag client" title={vacancy.client_name ? t('Original employer: {name}', { name: vacancy.client_name }) : undefined}><Icon name="eye" size={12} /> {t('Client · anonymised')}</span>
  if (vacancy.source === 'own') return <span className="db-source-tag"><Icon name="link" size={12} /> {t('Own vacancy')}</span>
  return null
}

function VacancyDetail({ vacancy, onClose }) {
  const sections = [['Introduction and tasks', vacancy.description], ['Profile', vacancy.requirements], ['Benefits', vacancy.benefits]].filter(([, text]) => text)
  return <Modal title={vacancy.title} onClose={onClose} wide footer={<Button variant="ghost" onClick={onClose}>{t('Close')}</Button>}>
    <div className="db-vacancy-detail">
      <p className="db-vacancy-facts"><SourceBadge vacancy={vacancy} /><span>{vacancy.location}</span><span>{t(vacancy.type)}{vacancy.workload ? ` · ${vacancy.workload}` : ''}</span>{vacancy.department && <span>{vacancy.department}</span>}</p>
      {vacancy.source === 'client' && <div className="db-employment-note"><Icon name="info" size={18} /><p><b>{t('Anonymised for advertising.')}</b> {t('The employer’s name and identifying details were removed and the text rewritten in your style.')}{vacancy.client_name ? ` ${t('Original employer (internal only): {name}', { name: vacancy.client_name })}` : ''}</p></div>}
      {sections.map(([label, text]) => <section key={label}><h3>{t(label)}</h3><p>{text}</p></section>)}
      {vacancy.source_url && <a className="db-text-link" href={vacancy.source_url} target="_blank" rel="noreferrer"><Icon name="link" size={14} /> {t('Open the original posting')}</a>}
    </div>
  </Modal>
}

export function VacanciesView({ notify, onGo }) {
  const vacancies = useResource(listVacancies)
  const ads = useResource(() => getAdsStatus().catch(() => null))
  const currency = ads.data?.ad_account?.currency || 'CHF'
  const [url, setUrl] = useState('')
  const [source, setSource] = useState('auto')
  const [pasting, setPasting] = useState(false)
  const [text, setText] = useState('')
  const [importing, setImporting] = useState(false)
  const [importStep, setImportStep] = useState(0)
  const [busy, setBusy] = useState('')
  const [open, setOpen] = useState(null)
  const list = vacancies.data || []
  const working = list.some((vacancy) => vacancy.status === 'drafting')
  const { reload } = vacancies
  // Follow the AI while it builds and launches campaigns.
  useEffect(() => {
    if (!working) return undefined
    const timer = window.setInterval(() => reload(), 5000)
    return () => window.clearInterval(timer)
  }, [working, reload])
  useEffect(() => {
    if (!importing) return undefined
    const timer = window.setInterval(() => setImportStep((step) => Math.min(step + 1, IMPORT_STEPS.length - 1)), 4000)
    return () => window.clearInterval(timer)
  }, [importing])

  const replace = (updated) => vacancies.setData((current) => current.map((item) => (item.id === updated.id ? updated : item)))
  const act = async (vacancy, action, success) => {
    setBusy(vacancy.id)
    try {
      const updated = await action(vacancy.id)
      replace(updated)
      notify(updated.automation?.auto ? success : automationMessage(updated.automation))
    } catch (failure) {
      notify(failure.message, 'error')
    } finally {
      setBusy('')
    }
  }
  const submit = async (event) => {
    event.preventDefault()
    if (pasting ? !text.trim() : !url.trim()) { notify(pasting ? t('Paste the vacancy text first.') : t('Paste the link to the vacancy first.'), 'error'); return }
    setImportStep(0)
    setImporting(true)
    try {
      const created = await importVacancy({ url: url.trim(), source, ...(pasting ? { text } : {}) })
      vacancies.setData((current) => [created, ...(current || [])])
      setUrl(''); setText(''); setPasting(false)
      notify(created.anonymised
        ? t('Imported “{title}” — the employer was anonymised. {next}', { title: created.title, next: automationMessage(created.automation) })
        : t('Imported “{title}”. {next}', { title: created.title, next: automationMessage(created.automation) }))
    } catch (failure) {
      if (failure.status === 422 && /javascript/i.test(failure.message)) setPasting(true)
      notify(failure.message, 'error')
    } finally {
      setImporting(false)
    }
  }

  const action = (vacancy) => {
    if (vacancy.status === 'drafting') return <span className="db-ai-working small"><i /> {t('AI working')}</span>
    if (LIVE.includes(vacancy.status)) return <Button variant="secondary" icon="edit" onClick={() => onGo('campaigns', { campaignId: vacancy.campaign_id, name: vacancy.campaign })}>{t('Edit campaign')}</Button>
    if (vacancy.draft?.waiting_for_meta) return <Button variant="soft" icon="link" onClick={() => onGo('connections')}>{t('Connect Meta')}</Button>
    if (vacancy.launch_failed || vacancy.status === 'in review') return <Button icon="refresh" disabled={busy === vacancy.id} onClick={() => act(vacancy, relaunchVacancy, t('Launching the campaign for {title} again.', { title: vacancy.title }))}>{busy === vacancy.id ? t('Starting…') : vacancy.launch_failed ? t('Retry launch') : t('Launch')}</Button>
    return <Button variant="soft" icon="spark" disabled={busy === vacancy.id} onClick={() => act(vacancy, redraftVacancy, t('The AI is building the campaign for {title}.', { title: vacancy.title }))}>{busy === vacancy.id ? t('Starting…') : t('Generate campaign')}</Button>
  }

  return <div className="db-page db-srs-page">
    <PageIntro eyebrow={t('Vacancy input')} icon="file" title={t('Paste a vacancy link. The AI does the rest.')} description={t('Import a vacancy from your own website or straight from a client. Client vacancies are anonymised and rewritten in your style, then the complete Meta campaign is generated and launched automatically.')} />
    <form className="db-card db-vacancy-import" onSubmit={submit}>
      <div className="db-import-row">
        <label className="db-import-url"><Icon name="link" size={18} /><input type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder={t('https://… link to the vacancy')} disabled={importing} aria-label={t('Vacancy link')} /></label>
        <Button type="submit" icon="spark" disabled={importing}>{importing ? t('Importing…') : t('Import vacancy')}</Button>
      </div>
      <div className="db-import-options">
        <div className="db-view-switch" role="radiogroup" aria-label={t('Whose vacancy is it?')}>{SOURCES.map(([id, label]) => <button type="button" role="radio" aria-checked={source === id} className={source === id ? 'active' : ''} onClick={() => setSource(id)} key={id} disabled={importing}>{t(label)}</button>)}</div>
        <small>{source === 'client' ? t('The employer is removed and the vacancy rewritten in your structure before anything is advertised.') : source === 'own' ? t('Used as published, in your branding.') : t('Links on your Knowledge Base website count as your own; any other site is treated as a client and anonymised.')}</small>
        <button type="button" className="db-text-link" onClick={() => setPasting((value) => !value)} disabled={importing}>{pasting ? t('Use only the link') : t('Page won’t load? Paste the text')}</button>
      </div>
      {pasting && <Field label={t('Vacancy text')} hint={t('Copy everything from the job ad — title, tasks, profile and benefits.')}><textarea rows="7" value={text} onChange={(event) => setText(event.target.value)} disabled={importing} /></Field>}
      {importing && <p className="db-ai-working"><i /> {t(IMPORT_STEPS[importStep])}</p>}
      <footer><Icon name="spark" size={14} /> {t('From the link: vacancy text, branded creatives, ad copy, Employment audience, a lead form with screening questions, budget — launched in Meta. Edit the live campaign any time.')}</footer>
    </form>
    <section className="db-card db-vacancy-table"><header><div><h2>{t('Vacancy pipeline')}</h2><p>{t('Each vacancy stays linked to its generated campaign and results.')}</p></div><Badge tone="blue">{list.length === 1 ? t('1 role') : t('{n} roles', { n: list.length })}</Badge></header>
      {vacancies.loading && !vacancies.data ? <LoadingState label={t('Loading vacancies…')} /> : vacancies.error && !vacancies.data ? <ErrorState error={vacancies.error} onRetry={vacancies.reload} /> : list.length ? <div className="db-table-wrap"><table className="db-table"><thead><tr><th>{t('Vacancy')}</th><th>{t('Status')}</th><th>{t('Campaign')}</th><th>{t('Applicants')}</th><th>{t('CPL')}</th><th>{t('Updated')}</th><th aria-label={t('Actions')} /></tr></thead><tbody>{list.map((vacancy) => <tr key={vacancy.id}>
        <td><button className="db-vacancy-title" onClick={() => setOpen(vacancy)}><span>{vacancy.title.split(/[\s/]+/).filter((word) => /^\p{L}/u.test(word)).slice(0, 2).map((word) => word[0].toUpperCase()).join('')}</span><p><b>{vacancy.title}</b><small>{vacancy.location} · {t(vacancy.type)}</small><SourceBadge vacancy={vacancy} /></p></button></td>
        <td><Badge tone={vacancyTone(vacancy.status)}>{t(vacancy.launch_failed ? 'launch failed' : vacancy.status)}</Badge></td>
        <td><b>{t(vacancy.campaign)}</b>{vacancy.status === 'drafting' && <small>{t(vacancy.draft?.step_label || 'Starting')}{vacancy.draft?.percent ? ` · ${vacancy.draft.percent}%` : ''}</small>}{vacancy.status === 'ready' && vacancy.draft?.error && <small className="db-warning">{vacancy.draft.error}</small>}{vacancy.launch_failed && vacancy.launch_retry_at && <small className="db-ai-fixed"><Icon name="refresh" size={12} /> {t('Fix it in Meta — the AI retries automatically at {when}.', { when: formatDateTime(vacancy.launch_retry_at) })}</small>}{vacancy.launch_repairs?.length > 0 && !vacancy.launch_failed && <small className="db-ai-fixed" title={vacancy.launch_repairs.join('\n')}><Icon name="spark" size={12} /> {t('The AI fixed what Meta refused: {list}', { list: vacancy.launch_repairs.join('; ') })}</small>}</td>
        <td>{vacancy.applicants || '—'}</td><td>{vacancy.cpl ? money(vacancy.cpl, currency) : '—'}</td><td>{relativeTime(vacancy.updated_at)}</td>
        <td>{action(vacancy)}</td></tr>)}</tbody></table></div> : <EmptyState icon="file" title={t('No vacancies yet')} body={t('Paste a vacancy link above — the campaign is built and launched from it.')} />}
    </section>
    {open && <VacancyDetail vacancy={open} onClose={() => setOpen(null)} />}
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
  const label = (iso) => formatDate(new Date(`${iso}T12:00:00`), { day: '2-digit', month: 'short', timeZone: undefined })
  const picks = [0, Math.floor((groups.length - 1) / 3), Math.floor(((groups.length - 1) * 2) / 3), groups.length - 1]
  return { bars, axis: [...new Set(picks)].map((index) => label(groups[index].date)) }
}

function trend(value, { lowerIsBetter = false, points = false } = {}) {
  if (value === null || value === undefined) return t('No prior period')
  const arrow = value === 0 ? '→' : value > 0 ? '↑' : '↓'
  const good = value === 0 ? t('steady') : (value > 0) !== lowerIsBetter ? t('improving') : t('watch')
  return `${arrow} ${formatNumber(Math.abs(value), { minimumFractionDigits: points ? 2 : 1, maximumFractionDigits: points ? 2 : 1 })}${points ? t(' pts') : '%'} · ${good}`
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
  const refresh = async () => { const result = await report.reload({ refresh: true }); if (result) notify(t('Meta Insights refreshed just now.')) }
  useEffect(() => { if (report.error && data) notify(report.error.message, 'error') }, [report.error, data, notify])
  const rows = data ? data.rows[level === 'Campaigns' ? 'campaign' : level === 'Ad sets' ? 'adset' : 'ad'] : []
  const totals = data?.totals
  const currency = data?.currency || 'CHF'

  return <div className="db-page db-srs-page">
    <PageIntro eyebrow={t('Meta performance')} icon="campaigns" title={t('Every result, traced back to the vacancy.')} description={t('Automatically refreshed Meta Insights across vacancy, campaign, and ad levels.')} actions={<><Field label={t('Reporting window')}><select value={windowDays} onChange={(event) => setWindowDays(event.target.value)}><option value="7">{t('Last 7 days')}</option><option value="30">{t('Last 30 days')}</option><option value="90">{t('Last 90 days')}</option></select></Field><Button className="db-refresh-button" variant="secondary" icon="refresh" disabled={!connected || report.loading} onClick={refresh}>{report.loading && data ? t('Refreshing…') : t('Refresh')}</Button></>} />
    {!connected ? (loadingStatus ? <LoadingState label={t('Checking your Meta connection…')} /> : <EmptyState icon="campaigns" title={t('Connect Meta Ads to see reporting')} body={t('Campaign results appear here, traced back to the vacancy that created them.')} action={<Button icon="link" onClick={onManage}>{t('Connect Meta Ads')}</Button>} />) : !data ? (report.error ? <ErrorState error={report.error} onRetry={report.reload} /> : <LoadingState label={t('Loading Meta Insights…')} />) : <>
      <div className="db-report-status"><span><i /> {t('Meta data synced')}</span><small>{t('Automatic refresh every 30 minutes · Updated')} {relativeTime(data.fetched_at).toLowerCase()}</small></div>
      <section className="db-report-metrics">{[
        ['Spend', money(totals.spend, currency, 0), 'wallet', trend(data.deltas.spend)],
        ['Impressions', compact(totals.impressions), 'eye', trend(data.deltas.impressions)],
        ['Clicks', formatNumber(totals.clicks), 'target', trend(data.deltas.clicks)],
        ['CTR', `${Number(totals.ctr).toFixed(2)}%`, 'campaigns', trend(data.deltas.ctr, { points: true })],
        ['CPC', money(totals.cpc, currency), 'wallet', trend(data.deltas.cpc, { lowerIsBetter: true })],
        ['Leads', totals.leads, 'leads', trend(data.deltas.leads)],
        ['Cost per lead', totals.leads ? money(totals.cpl, currency) : '—', 'optimize', trend(data.deltas.cpl, { lowerIsBetter: true })],
      ].map(([label, value, icon, note]) => <article className="db-card" key={label}><span><Icon name={icon} size={17} /></span><small>{t(label)}</small><strong>{value}</strong><em>{note}</em></article>)}</section>
      <section className="db-card db-report-chart"><header><div><h2>{t('Lead efficiency')}</h2><p>{t('Spend and lead volume across the selected period.')}</p></div><div className="db-chart-legend"><span><i /> {t('Leads')}</span><span><i /> {t('Spend')}</span></div></header>{chart.bars.length ? <><div className="db-chart-bars">{chart.bars.map((bar, index) => <i style={{ '--bar': `${bar.bar}%`, '--line': `${bar.line}%` }} key={index} title={`${bar.date}: ${bar.leads} ${t('leads')} · ${money(bar.spend, currency)}`}><b /><span /></i>)}</div><div className="db-chart-axis">{chart.axis.map((label) => <span key={label}>{label}</span>)}</div></> : <p className="db-helper">{t('No delivery in this window yet.')}</p>}</section>
      <section className="db-card db-data-section db-report-table"><header><div><h2>{t('Performance by vacancy')}</h2><p>{t('Campaign results remain attached to the role that created them.')}</p></div><div className="db-view-switch">{['Campaigns', 'Ad sets', 'Ads'].map((item) => <button className={level === item ? 'active' : ''} onClick={() => setLevel(item)} key={item}>{t(item)}</button>)}</div></header>{rows.length ? <div className="db-table-wrap"><table className="db-table"><thead><tr><th>{t('Vacancy /')} {t(level.slice(0, -1))}</th><th>{t('Status')}</th><th>{t('Spend')}</th><th>{t('Impressions')}</th><th>{t('Clicks')}</th><th>{t('CTR')}</th><th>{t('CPC')}</th><th>{t('Leads')}</th><th>{t('CPL')}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><b>{row.vacancy}</b><small>{level === 'Campaigns' ? row.name : `${row.campaign} · ${row.name}`}</small></td><td><Badge tone={row.state === 'active' ? 'lime' : row.state === 'paused' ? 'orange' : row.state === 'learning' ? 'blue' : 'gray'}>{t(row.status)}</Badge></td><td>{money(row.spend, currency)}</td><td>{formatNumber(row.impressions)}</td><td>{formatNumber(row.clicks)}</td><td>{Number(row.ctr).toFixed(2)}%</td><td>{money(row.cpc, currency)}</td><td><b>{row.leads}</b></td><td><b>{row.leads ? money(row.cpl, currency) : '—'}</b></td></tr>)}</tbody></table></div> : <EmptyState icon="campaigns" title={t('No campaign results yet')} body={t('Launch a campaign from a vacancy and its results will appear here.')} />}</section>
    </>}
  </div>
}
