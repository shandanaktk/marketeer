import { useEffect, useMemo, useRef, useState } from 'react'
import {
  applyOptimizations, createOptimizationFolder, deleteCreativeAsset, deleteTemplate, getCampaignTable, getCreativeAssets, getDaily,
  getKnowledge, getLaunches, getLeads, getOptimize, getOptimizeHistory, getPagePosts, getSettings, getStudioBrand, getTemplates,
  launchCampaign, listVacancies, money, moveCreativeAsset, pollStudioJob, regenerateCopy, regenerateImage, relativeTime, saveAutomation,
  saveBrandRules, setOptimizeMode, startCampaignPlan, syncLeads, undoOptimization, updateEntity, updateLead, uploadStudioImage, useResource,
} from './api.js'
import { AdPreview, Badge, Button, CreativeArt, EmptyState, ErrorState, Field, Icon, LoadingState, Modal, PageIntro, Spinner, Toggle } from './dashboardUI.jsx'

const PRESETS = [['today', 'Today'], ['last_7d', 'Last 7 days'], ['last_14d', 'Last 14 days'], ['last_30d', 'Last 30 days']]
const presetLabel = (value) => (PRESETS.find(([id]) => id === value) || PRESETS[2])[1]

function MetaAccountStrip({ connected, status, onManage, datePreset, setDatePreset }) {
  const account = status?.ad_account
  return (
    <section className={`db-meta-strip db-card ${connected ? '' : 'disconnected'}`}>
      <img className="db-meta-logo" src="/social_logos/meta.png" alt="" /><div><span className="db-eyebrow">Meta ads connection</span><h3>{connected ? (account?.name || 'No ad account selected') : 'No Meta Ads account connected'}</h3><p>{connected ? [status?.page?.page_name || 'No Page selected', account?.currency, account?.status_label].filter(Boolean).join(' · ') : 'Connect an account to build and manage real campaigns.'}</p></div>
      {connected ? <><div className="db-meta-health"><i /> Connected</div>{setDatePreset && <Field label="Reporting"><select value={datePreset} onChange={(event) => setDatePreset(event.target.value)}>{PRESETS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></Field>}</> : null}
      <Button variant="secondary" icon="settings" onClick={onManage}>{connected ? 'Manage' : 'Connect Meta'}</Button>
    </section>
  )
}

const AD_STEPS = ['Promote', 'Build', 'Review', 'Launch']
const PLACEMENTS = ['Facebook Feed', 'Instagram Feed', 'Instagram Stories', 'Facebook Reels', 'Instagram Reels']
const PLACEMENT_KEYS = { 'Facebook Feed': 'facebook_feed', 'Instagram Feed': 'instagram_feed', 'Instagram Stories': 'instagram_stories', 'Facebook Reels': 'facebook_reels', 'Instagram Reels': 'instagram_reels' }
const PLACEMENT_LABELS = Object.fromEntries(Object.entries(PLACEMENT_KEYS).map(([label, key]) => [key, label]))
const GENERATE_STEPS = { brand: 0, offer: 1, audience: 2, copy: 3, visuals: 4, assemble: 5, done: 6 }
const LAUNCH_STEPS = { lead_form: 0, campaign: 1, adset: 2, ads: 3, optimize: 4, done: 6 }
const KIND_LABELS = { generated: 'AI styled', styled: 'AI styled', overlay: 'Branded', upload: 'Uploaded', brand: 'Brand asset', post: 'From your post' }
const STANDARD_QUESTIONS = { 'full name': 'FULL_NAME', name: 'FULL_NAME', email: 'EMAIL', 'email address': 'EMAIL', phone: 'PHONE', 'phone number': 'PHONE' }
const splitList = (value) => String(value || '').split(/[,;\n]/).map((item) => item.trim()).filter(Boolean)

function AdStepper({ stage }) {
  const active = stage === 4 ? 4 : stage
  return <ol className="db-flow-stepper ad">{AD_STEPS.map((label, index) => <li className={index < active ? 'done' : index === active ? 'active' : ''} key={label}><span>{index < active ? <Icon name="check" size={13} /> : index + 1}</span><b>{label}</b>{index < AD_STEPS.length - 1 && <i />}</li>)}</ol>
}

function JobSteps({ labels, current }) {
  return <div className="db-job-steps">{labels.map((item, index) => <span className={index < current ? 'done' : index === current ? 'active' : ''} key={item}><i>{index < current ? <Icon name="check" size={12} /> : index + 1}</i>{item}</span>)}</div>
}

function CampaignTarget({ form, setForm, onBuild, busy, vacancies, templates, pagePosts, brand, onSaveRules, savingRules }) {
  const kinds = [
    ['vacancy', 'Open vacancy', 'Turn a saved role into a complete recruitment campaign.', 'file'],
    ['custom', 'Custom offer', 'Provide a campaign offer and destination.', 'file'],
    ['post', 'Facebook post', 'Promote an existing connected Page post.', 'content'],
  ]
  const togglePlacement = (item) => setForm({ ...form, placements: form.placements.includes(item) ? form.placements.filter((value) => value !== item) : [...form.placements, item] })
  const chooseVacancy = (id) => {
    const vacancy = vacancies.find((item) => item.id === id)
    setForm({ ...form, vacancy: id, url: /^https?:\/\//.test(vacancy?.application || '') ? vacancy.application : form.url })
  }
  const blocked = (form.kind === 'vacancy' && !form.vacancy) || (form.kind === 'custom' && (!form.offer || !form.url)) || (form.kind === 'post' && !form.post) || !form.placements.length
  return <div className="db-ad-target-grid">
    <div className="db-ad-target-main">
      <section className="db-card"><div className="db-section-heading"><span><Icon name="target" size={18} /></span><div><h2>What are you promoting?</h2><p>The campaign stays fully editable before anything is sent to Meta.</p></div><Badge tone="orange">Employment · required</Badge></div><div className="db-choice-grid three">{kinds.map(([id, title, body, icon]) => <button className={form.kind === id ? 'active' : ''} onClick={() => setForm({ ...form, kind: id })} key={id}><span><Icon name={icon} size={19} /></span><b>{title}</b><small>{body}</small>{form.kind === id && <i><Icon name="check" size={13} /></i>}</button>)}</div>
        {form.kind === 'vacancy' && <div className="db-form-grid two"><Field label="Vacancy">{vacancies.length ? <select value={form.vacancy} onChange={(event) => chooseVacancy(event.target.value)}>{vacancies.map((vacancy) => <option value={vacancy.id} key={vacancy.id}>{vacancy.title} · {vacancy.location}</option>)}</select> : <input value="" readOnly placeholder="Add a vacancy first" />}</Field><Field label="Application URL"><input value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="https://…" /></Field></div>}
        {form.kind === 'custom' && <div className="db-form-grid two"><Field label="Offer title"><input value={form.offer} onChange={(event) => setForm({ ...form, offer: event.target.value })} /></Field><Field label="Landing-page URL"><input value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="https://…" /></Field></div>}
        {form.kind === 'post' && (pagePosts.loading ? <p className="db-helper">Loading your Page posts…</p> : pagePosts.error ? <p className="db-warning">{pagePosts.error.message}</p> : (pagePosts.data || []).length ? <div className="db-promotable-posts">{pagePosts.data.slice(0, 8).map((post) => { const title = (post.message || 'Untitled post').split('\n')[0].slice(0, 60); return <button className={form.post === post.post_id ? 'active' : ''} onClick={() => setForm({ ...form, post: post.post_id })} key={post.post_id}>{post.picture_url ? <img className="db-promote-shot" src={post.picture_url} alt="" /> : <CreativeArt compact theme={title.toUpperCase()} />}<span><b>{title}</b><small>Published {new Date(post.created_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small></span>{form.post === post.post_id && <i className="db-channel-check"><Icon name="check" size={12} /></i>}</button> })}</div> : <p className="db-helper">No published posts were found on the connected Page.</p>)}
        <Field label="Campaign brief (optional)" hint="Share the offer, audience, proof points, or constraints that matter most."><textarea rows="4" value={form.brief} onChange={(event) => setForm({ ...form, brief: event.target.value })} /></Field>
      </section>
      <section className="db-card"><div className="db-section-heading compact"><span><Icon name="settings" size={18} /></span><div><h2>Generation options</h2><p>Shape the first plan. You can refine every setting later.</p></div></div><div className="db-form-grid two"><Field label="Duration"><select value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })}>{[7, 14, 21, 30, 60].map((days) => <option value={days} key={days}>{days} days</option>)}</select></Field><Field label="Copy variants"><select value={form.variants} onChange={(event) => setForm({ ...form, variants: event.target.value })}>{[1, 2, 3, 4, 5].map((count) => <option value={count} key={count}>{count} variants</option>)}</select></Field><Field label="Starting template"><select value={form.template} onChange={(event) => setForm({ ...form, template: event.target.value })}><option value="">Generate fresh</option>{templates.map((item) => <option value={item.template_id} key={item.template_id}>{item.name}</option>)}</select></Field><Field label="Target countries"><input value={form.countries} onChange={(event) => setForm({ ...form, countries: event.target.value })} placeholder="Netherlands, United Kingdom" /></Field><Toggle checked={form.aiImages} onChange={(value) => setForm({ ...form, aiImages: value })} label="AI-styled images" hint="Add fresh visual directions." /><Toggle checked={false} onChange={() => {}} label="Employment-safe targeting" hint="Age, gender, and detailed targeting stay restricted." /></div><Field label="Placements"><div className="db-select-pills">{PLACEMENTS.map((item) => <button className={form.placements.includes(item) ? 'active' : ''} onClick={() => togglePlacement(item)} key={item}>{form.placements.includes(item) && <Icon name="check" size={12} />}{item}</button>)}</div></Field></section>
    </div>
    <aside className="db-ad-target-aside"><section className="db-card"><span className="db-eyebrow"><Icon name="spark" size={14} /> Brand rules</span><h3>{brand?.business_name || 'Your brand'}</h3><p>{[brand?.industry, brand?.tagline || brand?.tone].filter(Boolean).join(' · ') || 'Set your brand in the Knowledge Base.'}</p><Field label="Tone"><input value={form.tone} onChange={(event) => setForm({ ...form, tone: event.target.value })} /></Field><Field label="Never use"><input value={form.banned} onChange={(event) => setForm({ ...form, banned: event.target.value })} /></Field><Field label="Must include"><input value={form.required} onChange={(event) => setForm({ ...form, required: event.target.value })} /></Field><div className="db-form-grid two"><Toggle checked={form.emojis} onChange={(value) => setForm({ ...form, emojis: value })} label="Emojis" /><Toggle checked={form.hashtags} onChange={(value) => setForm({ ...form, hashtags: value })} label="Hashtags" /></div><Button variant="secondary" className="full" icon="check" disabled={savingRules} onClick={onSaveRules}>{savingRules ? 'Saving…' : 'Save brand rules'}</Button></section><Button className="full large" icon="spark" disabled={busy || blocked} onClick={onBuild}>Build my campaign</Button><p className="db-safe-note"><Icon name="info" size={14} /> Nothing goes live without your approval.</p></aside>
  </div>
}

function toQuestionModels(labels, original) {
  return labels.map((label) => label.trim()).filter(Boolean).map((label) => {
    const known = original.find((question) => (question.label || '').toLowerCase() === label.toLowerCase())
    if (known) return known
    const standard = STANDARD_QUESTIONS[label.toLowerCase()]
    if (standard) return { type: standard, key: standard, label }
    return { type: 'CUSTOM', key: label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'question', label }
  })
}

function CampaignReview({ plan, setPlan, raw, copies, setCopies, creatives, setCreatives, onLaunch, onReset, launching, jobId, notify, currency }) {
  const fileInput = useRef(null)
  const [working, setWorking] = useState('')
  const selectedCopies = copies.filter((item) => item.selected)
  const selectedCreatives = creatives.filter((item) => item.selected)
  const adCount = Math.min(6, selectedCopies.length * selectedCreatives.length)
  const patchCopy = (id, patch) => setCopies((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item))
  const run = async (key, work) => { setWorking(key); try { await work() } catch (failure) { notify(failure.message, 'error') } finally { setWorking('') } }
  const asCopy = (variant) => ({ id: variant.variant_id, angleKey: variant.angle, angle: variant.angle_label, headline: variant.headline, primary: variant.primary_text, description: variant.description, cta: variant.call_to_action, selected: true, warnings: variant.warnings || [] })
  const asCreative = (variant) => ({ id: variant.asset_id, name: variant.label, kind: KIND_LABELS[variant.kind] || variant.kind, rawKind: variant.kind, imageUrl: variant.url, selected: true })
  const upload = (file) => file && run('upload', async () => { const added = await uploadStudioImage(file, jobId); setCreatives((current) => [...current, ...added.map(asCreative)]) })
  const addCopy = () => run('copy', async () => { const variant = await regenerateCopy({ job_id: jobId }); setCopies((current) => [...current, asCopy(variant)]) })
  const rewriteCopy = (copy) => run(`rewrite-${copy.id}`, async () => {
    const variant = await regenerateCopy({ job_id: jobId, angle: copy.angleKey, instruction: `Rewrite this ${copy.angle} variant with a fresh hook${plan.language ? ` in ${plan.language}` : ''}. The current version: ${copy.primary}` })
    setCopies((current) => current.map((item) => item.id === copy.id ? { ...asCopy(variant), selected: copy.selected } : item))
  })
  const addCreative = () => run('image', async () => { const variant = await regenerateImage({ job_id: jobId, mode: 'generated' }); setCreatives((current) => [...current, asCreative(variant)]) })
  const minBudget = (raw.budget.min_daily_budget || 500) / 100
  const ready = adCount > 0 && plan.form.questions.some((question) => question.trim()) && plan.form.privacy.startsWith('http') && Number(plan.budget) >= minBudget && plan.placements.length > 0
  return <div className="db-campaign-review">
    <div className="db-review-head db-card"><div><Badge>Ready to review</Badge><h2>{raw.campaign_name}</h2><p>Generated from the {raw.offer.kind === 'vacancy' ? 'vacancy' : 'brief'}, Knowledge Base, and connected Page.</p></div><div><strong>{adCount}</strong><span>ads selected</span></div></div>
    {raw.warnings?.length > 0 && <p className="db-warning">{raw.warnings.join(' ')}</p>}
    <div className="db-campaign-review-grid"><div className="db-review-stack">
      <section className="db-card"><div className="db-card-title"><div><span>01</span><h3>Copy angles <small>{selectedCopies.length} selected</small></h3></div><Button variant="soft" icon="refresh" disabled={Boolean(working)} onClick={addCopy}>{working === 'copy' ? 'Writing…' : 'Another angle'}</Button></div><div className="db-copy-variants">{copies.map((copy) => <article className={copy.selected ? 'selected' : ''} key={copy.id}><button className="db-select-check" onClick={() => patchCopy(copy.id, { selected: !copy.selected })}>{copy.selected && <Icon name="check" size={13} />}</button><Badge tone="blue">{copy.angle}</Badge><Field label="Primary text"><textarea rows="4" value={copy.primary} onChange={(event) => patchCopy(copy.id, { primary: event.target.value })} /></Field><Field label="Headline"><input value={copy.headline} maxLength="60" onChange={(event) => patchCopy(copy.id, { headline: event.target.value })} /></Field><Field label="Call to action"><select value={copy.cta} onChange={(event) => patchCopy(copy.id, { cta: event.target.value })}><option>APPLY_NOW</option><option>SIGN_UP</option><option>LEARN_MORE</option><option>GET_QUOTE</option><option>SUBSCRIBE</option></select></Field>{copy.warnings?.length > 0 && <p className="db-warning">{copy.warnings.join(' ')}</p>}<button className="db-text-action" disabled={Boolean(working)} onClick={() => rewriteCopy(copy)}><Icon name="spark" size={13} /> {working === `rewrite-${copy.id}` ? 'Rewriting…' : 'Rewrite this angle'}</button></article>)}</div></section>
      <section className="db-card"><div className="db-card-title"><div><span>02</span><h3>Creative directions <small>{selectedCreatives.length} selected</small></h3></div><div><Button variant="ghost" icon="upload" disabled={Boolean(working)} onClick={() => fileInput.current?.click()}>{working === 'upload' ? 'Uploading…' : 'Upload'}</Button><Button variant="soft" icon="spark" disabled={Boolean(working)} onClick={addCreative}>{working === 'image' ? 'Generating…' : 'Generate'}</Button><input ref={fileInput} type="file" accept="image/*" hidden onChange={(event) => { upload(event.target.files?.[0]); event.target.value = '' }} /></div></div>{creatives.length ? <div className="db-creative-variants">{creatives.map((creative) => <article className={creative.selected ? 'selected' : ''} key={creative.id}><button onClick={() => setCreatives((current) => current.map((item) => item.id === creative.id ? { ...item, selected: !item.selected } : item))}><img className="db-creative-shot" src={creative.imageUrl} alt="" /><i>{creative.selected && <Icon name="check" size={13} />}</i></button><div><b>{creative.name}</b><Badge tone="gray">{creative.kind}</Badge></div></article>)}</div> : <p className="db-helper">No images yet. Upload one or generate a new visual direction.</p>}</section>
      <Button variant="ghost" icon="refresh" onClick={onReset}>Start over</Button>
    </div><aside className="db-review-sidebar">
      {selectedCopies[0] && selectedCreatives[0] && <AdPreview headline={selectedCopies[0].headline} primary={selectedCopies[0].primary} cta={selectedCopies[0].cta} imageUrl={selectedCreatives[0].imageUrl} />}
      <section className="db-card db-employment-audience"><h3><Icon name="target" size={17} /> Employment audience</h3><p>Meta’s required special ad category is applied automatically. These details help Marketeer keep the audience clear and policy-safe.</p><div className="db-form-grid two"><Field label="Special ad category"><input value="Employment" readOnly /></Field><Field label="Location" hint="City + radius, e.g. “Amsterdam + 40 km”, or a country."><input value={plan.location} onChange={(event) => setPlan({ ...plan, location: event.target.value })} /></Field><Field label="Department"><input value={plan.department} onChange={(event) => setPlan({ ...plan, department: event.target.value })} /></Field><Field label="Work model"><select value={plan.workModel} onChange={(event) => setPlan({ ...plan, workModel: event.target.value })}><option>Hybrid</option><option>On-site</option><option>Remote</option></select></Field><Field label="Primary language"><select value={plan.language} onChange={(event) => setPlan({ ...plan, language: event.target.value })}>{[...new Set([plan.language, 'English', 'Dutch', 'German', 'French'])].filter(Boolean).map((language) => <option key={language}>{language}</option>)}</select></Field></div><p className="db-warning">Age, gender, ZIP-code, and detailed-interest restrictions remain locked to Meta’s employment policy.</p><Field label="Placements"><div className="db-select-pills small">{PLACEMENTS.map((item) => <button className={plan.placements.includes(item) ? 'active' : ''} onClick={() => setPlan({ ...plan, placements: plan.placements.includes(item) ? plan.placements.filter((value) => value !== item) : [...plan.placements, item] })} key={item}>{item}</button>)}</div></Field></section>
      <section className="db-card"><h3><Icon name="wallet" size={17} /> Budget & schedule</h3><div className="db-form-grid two"><Field label={`Daily budget (${currency})`}><input type="number" min={minBudget} value={plan.budget} onChange={(event) => setPlan({ ...plan, budget: event.target.value })} /></Field><Field label="Duration (days)"><input type="number" min="3" max="90" value={plan.duration} onChange={(event) => setPlan({ ...plan, duration: event.target.value })} /></Field></div><p className="db-helper">Estimated total: {money(Number(plan.budget) * Number(plan.duration), currency, 0)} · {raw.budget.timezone} · minimum {money(minBudget, currency)}/day</p></section>
      <section className="db-card db-lead-form-builder"><h3><Icon name="file" size={17} /> Lead form</h3><Field label="Form name"><input value={plan.form.name} onChange={(event) => setPlan({ ...plan, form: { ...plan.form, name: event.target.value } })} /></Field><Field label="Privacy policy URL"><input value={plan.form.privacy} onChange={(event) => setPlan({ ...plan, form: { ...plan.form, privacy: event.target.value } })} /></Field><Field label="Thank-you message"><textarea rows="3" value={plan.form.thanks} onChange={(event) => setPlan({ ...plan, form: { ...plan.form, thanks: event.target.value } })} /></Field><div className="db-question-list"><span>Questions</span>{plan.form.questions.map((question, index) => <div key={index}><input value={question} onChange={(event) => setPlan({ ...plan, form: { ...plan.form, questions: plan.form.questions.map((item, itemIndex) => itemIndex === index ? event.target.value : item) } })} /><button disabled={plan.form.questions.length === 1} onClick={() => setPlan({ ...plan, form: { ...plan.form, questions: plan.form.questions.filter((_, itemIndex) => itemIndex !== index) } })}><Icon name="trash" size={14} /></button></div>)}<Button variant="ghost" icon="plus" onClick={() => setPlan({ ...plan, form: { ...plan.form, questions: [...plan.form.questions, 'New question'] } })}>Add question</Button></div></section>
      <section className="db-card db-launch-settings"><h3><Icon name="send" size={17} /> Launch</h3><div className="db-choice-grid two compact"><button className={plan.goLive ? 'active' : ''} onClick={() => setPlan({ ...plan, goLive: true })}><b>Go live</b><small>Submit active</small></button><button className={!plan.goLive ? 'active' : ''} onClick={() => setPlan({ ...plan, goLive: false })}><b>Save paused</b><small>Activate later</small></button></div><Toggle checked={plan.optimize} onChange={(value) => setPlan({ ...plan, optimize: value })} label="Optimize for me" hint="Apply guarded nightly checks." /><Field label="Save as template (optional)"><input value={plan.templateName} onChange={(event) => setPlan({ ...plan, templateName: event.target.value })} /></Field>{!ready && <p className="db-warning">Select copy and images, keep a lead-form question and a placement, use a valid privacy URL, and meet the minimum budget.</p>}<Button className="full large" icon="send" disabled={!ready || launching} onClick={onLaunch}>{launching ? 'Launching…' : `Launch ${adCount} ad${adCount === 1 ? '' : 's'}`}</Button></section>
    </aside></div>
  </div>
}

function LaunchComplete({ result, onAgain, onCampaigns }) {
  return <section className="db-card db-launch-complete"><img className="db-success-mascot" src="/mascot/marketeer-m-success.png" alt="" /><h2>Campaign created in Meta.</h2><p>{result.campaign_name} · {result.ads.length} ad{result.ads.length === 1 ? '' : 's'} · {result.status === 'ACTIVE' ? 'Active' : 'Paused'}</p><div className="db-created-objects"><div><span>Lead form</span><b>{result.lead_form_id}</b></div><div><span>Campaign</span><b>{result.campaign_id}</b></div><div><span>Ad set</span><b>{result.adset_id}</b></div><div><span>Ads</span><b>{result.ads.length}</b></div></div><div><Button variant="secondary" icon="plus" onClick={onAgain}>Create another</Button><Button icon="campaigns" onClick={onCampaigns}>View campaigns</Button></div></section>
}

const EMPTY_FORM = { kind: 'vacancy', vacancy: '', offer: '', url: '', post: '', brief: '', duration: '21', variants: '3', template: '', countries: '', aiImages: true, placements: [...PLACEMENTS], tone: '', banned: '', required: '', emojis: false, hashtags: false }

// The first plan form, prefilled from the Knowledge Base's Ads rules, the brand rules and the chosen vacancy.
function initialStudioForm({ knowledge, settings, brand, vacancies, preset }) {
  const rules = knowledge.data.metaRules
  const available = vacancies.filter((vacancy) => vacancy.status !== 'completed')
  const chosen = vacancies.find((vacancy) => vacancy.id === preset?.vacancyId) || available.find((vacancy) => vacancy.status === 'ready') || available[0]
  return {
    ...EMPTY_FORM,
    vacancy: chosen?.id || '',
    url: /^https?:\/\//.test(chosen?.application || '') ? chosen.application : knowledge.data.brand.website || '',
    duration: String(rules.duration || 21),
    countries: rules.countries || knowledge.data.audience.markets || '',
    aiImages: settings.ai.aiImages,
    tone: brand.rules.tone_override || brand.tone || '',
    banned: (brand.rules.banned_words || []).join(', '),
    required: (brand.rules.must_include || []).join(', '),
    emojis: brand.rules.allow_emojis,
    hashtags: brand.rules.allow_hashtags,
  }
}

function StudioPage({ connected, status, onManage, children }) {
  return <div className="db-page db-ad-studio"><PageIntro eyebrow="Recruitment campaign studio" icon="ads" title="Turn a vacancy into a complete Meta campaign." description="Campaign, ad set, creative, copy, Employment-safe audience, lead form, budget, review, and launch—assembled from your Knowledge Base." /><MetaAccountStrip connected={connected} status={status} onManage={onManage} />{children}</div>
}

export function AdsStudio(props) {
  const { connected, status, onManage, preset } = props
  const vacancies = useResource(() => (connected ? listVacancies() : Promise.resolve([])), [connected])
  const templates = useResource(() => (connected ? getTemplates() : Promise.resolve([])), [connected])
  const brand = useResource(() => (connected ? getStudioBrand() : Promise.resolve(null)), [connected])
  const defaults = useResource(() => (connected ? Promise.all([getKnowledge(), getSettings()]) : Promise.resolve(null)), [connected])
  const shell = { connected, status, onManage }
  if (!connected) return <StudioPage {...shell}><EmptyState icon="link" title="Connect Meta Ads to begin" body="Campaign creation needs an ad account and Facebook Page identity." action={<Button icon="link" onClick={onManage}>Connect Meta Ads</Button>} /></StudioPage>
  const failure = defaults.error || brand.error || vacancies.error
  if (failure) return <StudioPage {...shell}><ErrorState error={failure} onRetry={() => { defaults.reload(); brand.reload(); vacancies.reload() }} /></StudioPage>
  if (!defaults.data || !brand.data || !vacancies.data) return <StudioPage {...shell}><LoadingState label="Loading your vacancies and brand rules…" /></StudioPage>
  const [knowledge, settings] = defaults.data
  return <StudioFlow {...props} vacancies={vacancies} templates={templates} brand={brand} initialForm={initialStudioForm({ knowledge, settings, brand: brand.data, vacancies: vacancies.data, preset })} />
}

function StudioFlow({ connected, status, onManage, notify, onGo, vacancies, templates, brand, initialForm }) {
  const [stage, setStage] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [plan, setPlan] = useState(null)
  const [raw, setRaw] = useState(null)
  const [jobId, setJobId] = useState(null)
  const [copies, setCopies] = useState([])
  const [creatives, setCreatives] = useState([])
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [savingRules, setSavingRules] = useState(false)
  const [progress, setProgress] = useState({ percent: 6, step: 0, label: '' })
  const pageId = status?.page?.page_id
  const pagePosts = useResource(() => (pageId && form.kind === 'post' ? getPagePosts(pageId) : Promise.resolve([])), [pageId, form.kind === 'post'])
  const currency = status?.ad_account?.currency || 'USD'

  const saveRules = async () => {
    setSavingRules(true)
    try {
      const saved = await saveBrandRules({ tone_override: form.tone, banned_words: splitList(form.banned), must_include: splitList(form.required), allow_emojis: form.emojis, allow_hashtags: form.hashtags })
      brand.setData(saved)
      notify('Brand rules saved for every campaign.')
    } catch (failure) { notify(failure.message, 'error') } finally { setSavingRules(false) }
  }

  const adopt = (job) => {
    const generated = job.plan
    setRaw(generated)
    setCopies(generated.copy_variants.map((variant) => ({ id: variant.variant_id, angleKey: variant.angle, angle: variant.angle_label, headline: variant.headline, primary: variant.primary_text, description: variant.description, cta: variant.call_to_action, selected: variant.selected, warnings: variant.warnings || [] })))
    setCreatives(generated.image_variants.map((variant) => ({ id: variant.asset_id, name: variant.label, kind: KIND_LABELS[variant.kind] || variant.kind, rawKind: variant.kind, imageUrl: variant.url, selected: variant.selected })))
    setPlan({
      location: generated.details?.location || generated.audience.geo_summary, department: generated.details?.department || '',
      workModel: generated.details?.work_model || 'Hybrid', language: generated.details?.language || 'English',
      placements: generated.audience.placements.map((key) => PLACEMENT_LABELS[key]).filter(Boolean),
      budget: generated.budget.daily_budget / 100, duration: generated.budget.duration_days, goLive: true, optimize: generated.details?.optimize ?? true, templateName: '',
      form: { name: generated.lead_form.name, privacy: generated.lead_form.privacy_policy_url, thanks: generated.lead_form.thank_you_message, questions: generated.lead_form.questions.map((question) => question.label || question.key) },
    })
  }

  const build = async () => {
    if (!status?.ad_account || !status?.page) { notify('Choose an ad account and a Facebook Page in Connections first.', 'error'); return }
    setStage(1); setBusy(true); setProgress({ percent: 6, step: 0, label: 'Building your recruitment campaign…' })
    try {
      const id = await startCampaignPlan({
        ad_account_id: status.ad_account.ad_account_id, page_id: status.page.page_id,
        target: { kind: form.kind, vacancy_id: form.kind === 'vacancy' ? form.vacancy : null, post_id: form.kind === 'post' ? form.post : null, title: form.kind === 'custom' ? form.offer : null, landing_url: form.url || null },
        brief: form.brief || null, placements: form.placements.map((label) => PLACEMENT_KEYS[label]), duration_days: Number(form.duration),
        variant_count: Number(form.variants), countries: splitList(form.countries), ai_images: form.aiImages, template_id: form.template || null,
      })
      setJobId(id)
      const job = await pollStudioJob(id, (update) => setProgress({ percent: update.percent, step: GENERATE_STEPS[update.step] ?? 0, label: update.step_label ? `${update.step_label}…` : 'Building your recruitment campaign…' }))
      adopt(job)
      setStage(2)
    } catch (failure) {
      notify(failure.message, 'error')
      setStage(0)
    } finally {
      setBusy(false)
    }
  }

  const launch = async () => {
    setStage(3); setBusy(true); setProgress({ percent: 10, step: 0, label: 'Creating your Meta campaign…' })
    const finalPlan = {
      ...raw,
      copy_variants: copies.map((copy) => ({ variant_id: copy.id, angle: copy.angleKey, angle_label: copy.angle, primary_text: copy.primary, headline: copy.headline, description: copy.description || null, call_to_action: copy.cta, selected: copy.selected, warnings: [] })),
      image_variants: creatives.map((creative) => ({ asset_id: creative.id, url: creative.imageUrl, kind: creative.rawKind || 'upload', label: creative.name, selected: creative.selected })),
      audience: { ...raw.audience, placements: plan.placements.map((label) => PLACEMENT_KEYS[label]) },
      budget: { ...raw.budget, daily_budget: Math.round(Number(plan.budget) * 100), duration_days: Number(plan.duration), lifetime_estimate: Math.round(Number(plan.budget) * 100 * Number(plan.duration)) },
      lead_form: { ...raw.lead_form, name: plan.form.name, privacy_policy_url: plan.form.privacy, thank_you_message: plan.form.thanks, questions: toQuestionModels(plan.form.questions, raw.lead_form.questions) },
      details: { ...(raw.details || {}), location: plan.location, department: plan.department, work_model: plan.workModel, language: plan.language, optimize: plan.optimize },
    }
    try {
      const job = await launchCampaign({ plan: finalPlan, go_live: plan.goLive, optimize_for_me: plan.optimize, save_as_template: plan.templateName.trim() || null, job_id: jobId }, (update) => setProgress({ percent: update.percent, step: LAUNCH_STEPS[update.step] ?? 0, label: update.step_label ? `${update.step_label}…` : 'Creating your Meta campaign…' }))
      setResult(job.launch)
      setStage(4)
      notify(`Campaign and lead form created in Meta${plan.goLive ? '' : ' (paused)'}.`)
      if (plan.templateName.trim()) templates.reload()
    } catch (failure) {
      notify(failure.message, 'error')
      setStage(2)
    } finally {
      setBusy(false)
    }
  }
  const reset = () => { setStage(0); setResult(null); setCopies([]); setCreatives([]); setPlan(null); setRaw(null); setJobId(null); vacancies.reload() }

  return <StudioPage connected={connected} status={status} onManage={onManage}>
    <AdStepper stage={stage} />{stage === 0 && <CampaignTarget form={form} setForm={setForm} onBuild={build} busy={busy} vacancies={(vacancies.data || []).filter((vacancy) => vacancy.status !== 'completed')} templates={templates.data || []} pagePosts={pagePosts} brand={brand.data} onSaveRules={saveRules} savingRules={savingRules} />}{stage === 1 && <section className="db-card db-job-card"><Spinner label={progress.label} progress={progress.percent} /><JobSteps labels={['Vacancy', 'Knowledge Base', 'Audience', 'Copy', 'Visuals', 'Assemble']} current={progress.step} /><p>You can safely leave this screen. The generated plan is not published to Meta.</p></section>}{stage === 2 && plan && raw && <CampaignReview plan={plan} setPlan={setPlan} raw={raw} copies={copies} setCopies={setCopies} creatives={creatives} setCreatives={setCreatives} onLaunch={launch} onReset={reset} launching={busy} jobId={jobId} notify={notify} currency={currency} />}{stage === 3 && <section className="db-card db-job-card"><Spinner label={progress.label} progress={progress.percent} /><JobSteps labels={['Lead form', 'Campaign', 'Ad set', 'Ads', 'Verify', 'Done']} current={progress.step} /></section>}{stage === 4 && result && <LaunchComplete result={result} onAgain={reset} onCampaigns={() => onGo('campaigns')} />}
  </StudioPage>
}

const CAMPAIGN_STATUSES = [
  ['active', 'Active', 'Healthy'],
  ['learning', 'Learning', 'Learning'],
  ['paused', 'Paused', 'Paused'],
  ['completed', 'Completed', 'Completed'],
]

function CampaignStatusMenu({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const current = CAMPAIGN_STATUSES.find(([id]) => id === value) || CAMPAIGN_STATUSES[0]
  return (
    <div className={`db-status-menu${open ? ' open' : ''}`}>
      <button type="button" className="db-status-trigger" aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen((next) => !next)}>
        <i className={current[0]} /><span>{current[1]}</span><Icon name="arrow" size={14} />
      </button>
      {open && <ul role="listbox">{CAMPAIGN_STATUSES.map(([id, label]) => <li key={id}><button type="button" role="option" aria-selected={value === id} className={value === id ? 'selected' : ''} onClick={() => { onChange(id); setOpen(false) }}><i className={id} />{label}{value === id && <Icon name="check" size={13} />}</button></li>)}</ul>}
    </div>
  )
}

function CampaignSpendLine({ values }) {
  const points = values?.length > 1 ? values : [0, 0]
  const width = 320
  const height = 56
  const step = width / (points.length - 1)
  const peak = Math.max(...points, 1)
  const path = points.map((value, index) => `${index ? 'L' : 'M'}${index * step},${height - (value / peak) * (height - 8) - 4}`).join(' ')
  return <svg className="db-spend-line" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true"><path d={path} /></svg>
}

const LEVELS = [['Campaigns', 'campaign'], ['Ad sets', 'adset'], ['Ads', 'ad']]
const deltaNote = (value, { suffix = '%', lowerIsBetter = false } = {}) => {
  if (value === null || value === undefined) return { text: 'No prior period', good: false }
  const good = value !== 0 && (value < 0) === lowerIsBetter
  return { text: `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(suffix === '%' ? 1 : 2)}${suffix} vs previous`, good }
}

export function CampaignsView({ connected, status, onManage, notify, datePreset = 'last_14d', setDatePreset }) {
  const [preset, setPreset] = useState(datePreset)
  const [level, setLevel] = useState('campaign')
  const table = useResource((options) => (connected ? getCampaignTable({ level, datePreset: preset, refresh: options?.refresh }) : Promise.resolve(null)), [connected, level, preset])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState('spend')
  const [detail, setDetail] = useState(null)
  const [original, setOriginal] = useState(null)
  const [series, setSeries] = useState([])
  const [busy, setBusy] = useState('')
  const items = useMemo(() => table.data?.rows || [], [table.data])
  const currency = table.data?.currency || status?.ad_account?.currency || 'USD'
  const visible = useMemo(() => items.filter((item) => (statusFilter === 'all' || item.status === statusFilter) && (item.name || '').toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : b[sort] - a[sort]), [items, query, statusFilter, sort])
  const levelLabel = LEVELS.find(([, id]) => id === level)[0]
  const changePreset = (value) => { setPreset(value); setDatePreset?.(value) }
  const open = async (row) => {
    setDetail(row); setOriginal(row); setSeries([])
    try {
      const daily = await getDaily({ datePreset: preset === 'today' ? 'last_7d' : preset, campaignId: row.campaign_id || row.id })
      setSeries(daily.series.map((day) => day.spend))
    } catch { setSeries([]) }
  }
  const toggle = async (row) => {
    const next = row.status === 'paused' ? 'active' : 'paused'
    setBusy(row.id)
    try {
      await updateEntity(row.id, { level, status: next })
      table.setData((current) => ({ ...current, rows: current.rows.map((item) => item.id === row.id ? { ...item, status: next, delivery: next === 'active' ? 'Healthy' : 'Paused' } : item) }))
      notify(`${row.name} ${next === 'active' ? 'resumed' : 'paused'}.`)
    } catch (failure) { notify(failure.message, 'error') } finally { setBusy('') }
  }
  const save = async () => {
    const patch = { level }
    if (detail.status !== original.status) patch.status = detail.status
    if (level !== 'ad' && Number(detail.budget) !== Number(original.budget)) patch.daily_budget = Number(detail.budget)
    if (!patch.status && !patch.daily_budget) { setDetail(null); return }
    setBusy('save')
    try {
      await updateEntity(detail.id, patch)
      notify('Campaign changes saved in Meta.')
      setDetail(null)
      table.reload({ refresh: true })
    } catch (failure) { notify(failure.message, 'error') } finally { setBusy('') }
  }
  const refresh = async () => { const result = await table.reload({ refresh: true }); if (result) notify('Campaign data refreshed.') }
  const totals = table.data?.totals
  const deltas = table.data?.deltas || {}
  const spendDelta = deltaNote(deltas.spend)
  const leadsDelta = deltaNote(deltas.leads)
  const cplDelta = deltaNote(deltas.cpl, { lowerIsBetter: true })
  const ctrDelta = deltaNote(deltas.ctr, { suffix: ' pts' })
  return <div className="db-page db-campaigns"><PageIntro eyebrow="Meta campaigns" icon="campaigns" title="Know what is working. Act quickly." description="Campaign delivery and results across the selected reporting window." actions={<Button variant="secondary" icon="refresh" disabled={!connected || table.loading} onClick={refresh}>Refresh</Button>} /><MetaAccountStrip connected={connected} status={status} onManage={onManage} datePreset={preset} setDatePreset={changePreset} />
    {!connected ? <EmptyState icon="campaigns" title="No campaign data yet" body="Connect Meta Ads to load campaigns and performance." /> : !table.data ? (table.error ? <ErrorState error={table.error} onRetry={table.reload} /> : <LoadingState label="Loading campaigns from Meta…" />) : <><div className="db-metric-grid four"><article className="db-card"><span>Spend</span><strong>{money(totals.spend, currency, 0)}</strong><small className={spendDelta.good ? 'good' : ''}>{spendDelta.text}</small></article><article className="db-card"><span>Leads</span><strong>{totals.leads}</strong><small className={leadsDelta.good ? 'good' : ''}>{leadsDelta.text}</small></article><article className="db-card"><span>Average CPL</span><strong>{totals.leads ? money(totals.cpl, currency) : '—'}</strong><small className={cplDelta.good ? 'good' : ''}>{cplDelta.text}</small></article><article className="db-card"><span>Click-through rate</span><strong>{Number(totals.ctr).toFixed(2)}%</strong><small className={ctrDelta.good ? 'good' : ''}>{ctrDelta.text}</small></article></div>
      <section className="db-card db-data-section"><header><div><h2>{levelLabel}</h2><p>Live Meta objects with performance from the {presetLabel(preset).toLowerCase()}.</p></div><div className="db-view-switch">{LEVELS.map(([label, id]) => <button className={level === id ? 'active' : ''} onClick={() => setLevel(id)} key={id}>{label}</button>)}</div></header><div className="db-toolbar compact"><label className="db-toolbar-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${levelLabel.toLowerCase()}…`} /></label><Field label="Status"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="learning">Learning</option><option value="paused">Paused</option><option value="completed">Completed</option></select></Field><Field label="Sort"><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="spend">Spend</option><option value="leads">Leads</option><option value="name">Name</option></select></Field></div>{table.loading && <p className="db-helper">Updating…</p>}<div className="db-table-wrap"><table className="db-table"><thead><tr><th>{levelLabel.slice(0, -1)}</th><th>Delivery</th><th>Budget</th><th>Spend</th><th>Leads</th><th>CPL</th><th>CTR</th><th aria-label="Actions" /></tr></thead><tbody>{visible.map((campaign) => <tr key={campaign.id}><td><button className="db-table-name" onClick={() => open(campaign)}>{campaign.image ? <img className="db-campaign-thumb" src={campaign.image} alt="" /> : <CreativeArt compact theme={(campaign.name || '').toUpperCase()} />}<span><b>{campaign.name}</b><small>{campaign.objective} · Updated {relativeTime(campaign.updated)}</small></span></button></td><td><Badge tone={campaign.status === 'active' ? 'lime' : campaign.status === 'learning' ? 'blue' : campaign.status === 'paused' ? 'orange' : 'gray'}>{campaign.delivery}</Badge></td><td>{campaign.budget ? `${money(campaign.budget, currency, 0)}/day` : '—'}</td><td>{money(campaign.spend, currency)}</td><td>{campaign.leads}</td><td>{campaign.leads ? money(campaign.cpl, currency) : '—'}</td><td>{Number(campaign.ctr).toFixed(2)}%</td><td>{campaign.status !== 'completed' && <button className="db-icon-action" disabled={busy === campaign.id} onClick={() => toggle(campaign)} aria-label={campaign.status === 'paused' ? 'Resume' : 'Pause'}><Icon name={campaign.status === 'paused' ? 'play' : 'pause'} size={15} /></button>}<button className="db-icon-action" onClick={() => open(campaign)} aria-label="Details"><Icon name="more" size={16} /></button></td></tr>)}</tbody></table></div>{!visible.length && <EmptyState icon="search" title={items.length ? 'No matching results' : `No ${levelLabel.toLowerCase()} yet`} body={items.length ? 'Adjust the search or status filter.' : 'Launch a campaign from the Campaign studio to see it here.'} />}</section></>}
    {detail && <Modal title={detail.name} onClose={() => setDetail(null)} wide footer={<><Button variant="ghost" onClick={() => setDetail(null)}>Close</Button><Button icon="check" disabled={busy === 'save'} onClick={save}>{busy === 'save' ? 'Saving…' : 'Save changes'}</Button></>}><div className="db-campaign-detail"><div className="db-campaign-creative"><AdPreview headline={detail.headline || detail.name} primary={detail.primary || `Applications are open for the ${detail.vacancy || detail.name} role.`} cta={detail.cta || 'APPLY_NOW'} imageUrl={detail.image} theme={(detail.name || '').toUpperCase()} /><p className="db-campaign-kicker">{detail.objective} · Updated {relativeTime(detail.updated)}</p></div><div className="db-campaign-manage"><dl className="db-campaign-stats"><div><dt>Spend</dt><dd>{money(detail.spend, currency)}</dd></div><div><dt>Leads</dt><dd>{detail.leads}</dd></div><div><dt>Cost per lead</dt><dd>{detail.leads ? money(detail.cpl, currency) : '—'}</dd></div><div><dt>Click-through</dt><dd>{Number(detail.ctr).toFixed(2)}%</dd></div></dl><CampaignSpendLine values={series} /><div className="db-campaign-settings">{level !== 'ad' && <div className="db-setting-row"><div><b>Daily budget</b><small>{currency} charged by Meta each day</small></div><label className="db-budget-field"><span>{money(0, currency, 0).replace(/[\d.,]/g, '')}</span><input type="number" min="1" aria-label="Daily budget" value={detail.budget} onChange={(event) => setDetail({ ...detail, budget: event.target.value })} /></label></div>}<div className="db-setting-row"><div><b>Status</b><small>{detail.delivery}</small></div><CampaignStatusMenu value={detail.status} onChange={(next) => { const match = CAMPAIGN_STATUSES.find(([id]) => id === next); setDetail({ ...detail, status: next, delivery: match[2] }) }} /></div></div></div></div></Modal>}
  </div>
}

const LEAD_STATUSES = [
  ['new', 'New'],
  ['contacted', 'Contacted'],
  ['qualified', 'Qualified'],
  ['closed', 'Closed'],
]

function LeadMark({ name }) {
  const initials = name.split(' ').map((word) => word[0]).slice(0, 2).join('')
  return <span className="db-lead-mark" aria-hidden="true">{initials}</span>
}

function LeadStatusMenu({ value, onChange, compact = false }) {
  const [open, setOpen] = useState(false)
  const current = LEAD_STATUSES.find(([id]) => id === value) || LEAD_STATUSES[0]
  return (
    <div className={`db-status-menu db-lead-status${compact ? ' compact' : ''}${open ? ' open' : ''}`}>
      <button type="button" className="db-status-trigger" aria-expanded={open} aria-haspopup="listbox" onClick={(event) => { event.stopPropagation(); setOpen((next) => !next) }}>
        <i className={current[0]} /><span>{current[1]}</span><Icon name="arrow" size={14} />
      </button>
      {open && <ul role="listbox">{LEAD_STATUSES.map(([id, label]) => <li key={id}><button type="button" role="option" aria-selected={value === id} className={value === id ? 'selected' : ''} onClick={() => { onChange(id); setOpen(false) }}><i className={id} />{label}{value === id && <Icon name="check" size={13} />}</button></li>)}</ul>}
    </div>
  )
}

const durationText = (minutes) => {
  if (minutes === null || minutes === undefined) return '—'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 48) return `${hours}h ${minutes % 60}m`
  return `${Math.round(hours / 24)}d`
}
const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

export function LeadsView({ connected, status, onManage, notify, onNewCount }) {
  const leadsResource = useResource(getLeads)
  const leads = useMemo(() => leadsResource.data?.leads || [], [leadsResource.data])
  const metrics = leadsResource.data?.metrics
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [leadTab, setLeadTab] = useState('all')
  const [campaignFilter, setCampaignFilter] = useState('')
  const [detail, setDetail] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (metrics) onNewCount?.(metrics.new) }, [metrics, onNewCount])
  const campaignNames = [...new Set(leads.map((lead) => lead.campaign))]
  const scopedLeads = campaignFilter ? leads.filter((lead) => lead.campaign === campaignFilter) : leads
  const visible = scopedLeads.filter((lead) => (statusFilter === 'all' || lead.status === statusFilter) && `${lead.name} ${lead.email} ${lead.campaign}`.toLowerCase().includes(query.toLowerCase()))
  const applyLead = (updated) => {
    leadsResource.setData((current) => {
      const nextLeads = current.leads.map((lead) => lead.id === updated.id ? updated : lead)
      return { ...current, leads: nextLeads, metrics: { ...current.metrics, new: nextLeads.filter((lead) => lead.status === 'new').length, qualified: nextLeads.filter((lead) => lead.status === 'qualified').length } }
    })
  }
  const setLeadStatus = async (lead, next) => {
    try { applyLead(await updateLead(lead.id, { status: next })); notify('Lead status updated.') } catch (failure) { notify(failure.message, 'error') }
  }
  const saveDetail = async () => {
    setSaving(true)
    try { applyLead(await updateLead(detail.id, { status: detail.status, note: detail.note })); setDetail(null); notify('Lead updated.') } catch (failure) { notify(failure.message, 'error') } finally { setSaving(false) }
  }
  const sync = async () => {
    setSyncing(true)
    try {
      const result = await syncLeads()
      await leadsResource.reload()
      notify(result.created ? `Lead sync complete · ${result.created} new lead${result.created === 1 ? '' : 's'}.` : result.notes?.[0] || 'Lead sync complete. You are up to date.')
    } catch (failure) { notify(failure.message, 'error') } finally { setSyncing(false) }
  }
  const download = () => {
    const rows = [['Name', 'Email', 'Phone', 'Campaign', 'Status', 'Received', 'Availability', 'Note'], ...visible.map((lead) => [lead.name, lead.email, lead.phone, lead.campaign, lead.status, lead.received ? new Date(lead.received).toISOString() : '', lead.timeline, lead.note])]
    const blob = new Blob([rows.map((row) => row.map(csvCell).join(',')).join('\n')], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${campaignFilter ? campaignFilter.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'all'}-leads.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    notify(`${campaignFilter ? `${campaignFilter} ` : ''}lead CSV prepared.`)
  }
  const responseChange = metrics?.response_change_minutes
  return <div className="db-page db-leads"><PageIntro eyebrow="Lead center" icon="leads" title="Turn form fills into conversations." description="Lead-form submissions from Meta, organized for quick follow-up." actions={<><Button variant="secondary" icon="refresh" disabled={!connected || syncing} onClick={sync}>{syncing ? 'Syncing…' : 'Sync leads'}</Button><Button icon="download" disabled={!visible.length} onClick={download}>Export CSV</Button></>} /><MetaAccountStrip connected={connected} status={status} onManage={onManage} /><div className="db-lead-tabs" role="tablist" aria-label="Lead views"><button className={leadTab === 'all' ? 'active' : ''} onClick={() => { setLeadTab('all'); setCampaignFilter('') }}>All leads</button><button className={leadTab === 'campaigns' ? 'active' : ''} onClick={() => { setLeadTab('campaigns'); setCampaignFilter('') }}>By campaign</button></div>{leadTab === 'campaigns' && <section className="db-card db-campaign-lead-picker"><header><div><h2>Find leads by campaign</h2><p>Choose a campaign to open only the people who came through it.</p></div><Badge tone="blue">{campaignNames.length} campaigns</Badge></header><div className="db-campaign-lead-grid">{campaignNames.map((campaign) => <button key={campaign} onClick={() => setCampaignFilter(campaign)} className={campaignFilter === campaign ? 'selected' : ''}><span><Icon name="campaigns" size={17} /></span><div><b>{campaign}</b><small>{leads.filter((lead) => lead.campaign === campaign).length} leads</small></div><Icon name="arrow" size={15} /></button>)}</div>{campaignFilter && <button className="db-clear-campaign" onClick={() => setCampaignFilter('')}>Show all campaigns</button>}</section>}
    {!connected && !leads.length ? <EmptyState icon="leads" title="Connect Meta to receive leads" body="Lead delivery and Page subscriptions are configured from Connections." /> : !leadsResource.data ? (leadsResource.error ? <ErrorState error={leadsResource.error} onRetry={leadsResource.reload} /> : <LoadingState label="Loading leads…" />) : <><div className="db-metric-grid four"><article className="db-card"><span>Total leads</span><strong>{metrics.total}</strong><small>All time</small></article><article className="db-card"><span>New</span><strong>{metrics.new}</strong><small>Needs follow-up</small></article><article className="db-card"><span>Qualified</span><strong>{metrics.qualified}</strong><small className="good">{metrics.qualification_rate}% qualification rate</small></article><article className="db-card"><span>Average response</span><strong>{durationText(metrics.average_response_minutes)}</strong><small className={responseChange > 0 ? 'good' : ''}>{responseChange === null || responseChange === undefined ? 'Time to first follow-up' : `${durationText(Math.abs(responseChange))} ${responseChange >= 0 ? 'faster' : 'slower'} this week`}</small></article></div><section className="db-card db-data-section"><header><div><h2>Leads from ads</h2><p>Synced from your selected Facebook Page and Meta webhook.</p></div><Badge tone={leadsResource.data.lead_delivery ? 'blue' : 'orange'}>{leadsResource.data.lead_delivery ? 'Lead delivery active' : 'Lead delivery off'}</Badge></header>{!leadsResource.data.lead_delivery && connected && <p className="db-warning">{leadsResource.data.lead_delivery_error || 'The selected Page is not subscribed to lead delivery. Use Refresh in Connections, then Sync leads.'}</p>}<div className="db-toolbar compact"><label className="db-toolbar-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search leads…" /></label><Field label="Status"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option></select></Field></div><div className="db-table-wrap"><table className="db-table leads"><thead><tr><th>Lead</th><th>Contact</th><th>Campaign</th><th>Timeline</th><th>Status</th><th>Received</th></tr></thead><tbody>{visible.map((lead) => <tr key={lead.id}><td><button className="db-lead-name" onClick={() => setDetail(lead)}><LeadMark name={lead.name} /><span><b>{lead.name}</b></span></button></td><td><span>{lead.email}</span><small>{lead.phone}</small></td><td><b>{lead.campaign}</b><small>{lead.source}</small></td><td>{lead.timeline}</td><td><LeadStatusMenu compact value={lead.status} onChange={(next) => setLeadStatus(lead, next)} /></td><td>{relativeTime(lead.received)}</td></tr>)}</tbody></table></div>{!visible.length && <EmptyState icon="search" title={leads.length ? 'No matching leads' : 'No leads yet'} body={leads.length ? 'Try another status or search term.' : 'Leads arrive here as soon as someone submits one of your lead forms.'} />}</section></>}
    {detail && <Modal title="Lead details" onClose={() => setDetail(null)} footer={<><Button variant="ghost" onClick={() => setDetail(null)}>Close</Button><Button icon="check" disabled={saving} onClick={saveDetail}>{saving ? 'Saving…' : 'Save lead'}</Button></>}><div className="db-lead-detail"><header className="db-lead-head"><LeadMark name={detail.name} /><div><h3>{detail.name}</h3><p>{detail.campaign}</p></div></header><div className="db-lead-contacts">{detail.email && <a href={`mailto:${detail.email}`}><Icon name="mail" size={15} />{detail.email}</a>}{detail.phone && <a href={`tel:${detail.phone}`}><Icon name="phone" size={15} />{detail.phone}</a>}</div><dl><div><dt>Campaign</dt><dd>{detail.campaign}</dd></div><div><dt>Placement</dt><dd>{detail.source}</dd></div><div><dt>Availability</dt><dd>{detail.timeline}</dd></div><div><dt>Received</dt><dd>{detail.received ? new Date(detail.received).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'}</dd></div>{Object.entries(detail.answers || {}).map(([question, answer]) => <div key={question}><dt>{question.replace(/_/g, ' ')}</dt><dd>{String(answer)}</dd></div>)}</dl><div className="db-setting-row"><div><b>Status</b><small>Where this conversation stands</small></div><LeadStatusMenu value={detail.status} onChange={(next) => setDetail({ ...detail, status: next })} /></div><Field label="Internal note"><textarea rows="4" value={detail.note || ''} onChange={(event) => setDetail({ ...detail, note: event.target.value })} placeholder="Add context for the next follow-up…" /></Field></div></Modal>}
  </div>
}

const EMPTY_FOLDER = { name: '', cap: '', target: '', campaigns: [] }

export function OptimizeView({ connected, status, onManage, notify }) {
  const [folderId, setFolderId] = useState('')
  const queue = useResource((options) => (connected ? getOptimize({ folderId, refresh: options?.refresh }) : Promise.resolve(null)), [connected, folderId])
  const history = useResource(() => (connected ? getOptimizeHistory() : Promise.resolve([])), [connected])
  const campaigns = useResource(() => (connected ? getCampaignTable({ datePreset: 'last_30d' }).then((table) => table.rows).catch(() => []) : Promise.resolve([])), [connected])
  // Local edits layered over the server's queue: picked recommendations, unsaved settings, a just-switched mode.
  const [picked, setPicked] = useState({})
  const [settingsDraft, setSettings] = useState(null)
  const [modeOverride, setMode] = useState(null)
  const [busy, setBusy] = useState('')
  const [folderOpen, setFolderOpen] = useState(false)
  const [folder, setFolder] = useState(EMPTY_FOLDER)
  const recommendations = (queue.data?.recommendations || []).map((item) => ({ ...item, selected: picked[item.id] ?? item.selected }))
  const settings = settingsDraft || queue.data?.automation || null
  const mode = modeOverride || queue.data?.mode || 'review'
  const selected = recommendations.filter((item) => item.selected)
  const currency = queue.data?.currency || status?.ad_account?.currency || 'USD'
  const accountId = status?.ad_account?.ad_account_id
  const apply = async (items = selected) => {
    if (!items.length) return
    setBusy('apply')
    try {
      const result = await applyOptimizations(accountId, items.map((item) => item.id), folderId)
      const failed = result.results.filter((item) => !item.applied)
      notify(result.applied_count ? `${result.applied_count} optimization${result.applied_count === 1 ? '' : 's'} applied.${failed.length ? ` ${failed.length} skipped: ${failed[0].error || failed[0].guardrail_note || 'guardrail'}` : ''}` : `Nothing applied: ${failed[0]?.error || failed[0]?.guardrail_note || 'no change needed'}.`, result.applied_count ? 'success' : 'error')
      await Promise.all([queue.reload({ refresh: true }), history.reload()])
    } catch (failure) { notify(failure.message, 'error') } finally { setBusy('') }
  }
  const switchMode = async (next) => {
    if (next === mode) return
    setMode(next)
    try { await setOptimizeMode(next); notify(next === 'auto' ? 'Hands-free mode on. Safe changes apply at your run hour.' : 'Review-first mode on. Nothing changes without your approval.') } catch (failure) { setMode(null); notify(failure.message, 'error') }
  }
  const saveSettings = async () => {
    setBusy('settings')
    try {
      const updated = await saveAutomation({ target: Number(settings.target) || null, change: Number(settings.change), min: Number(settings.min), hour: Number(settings.hour), budgets: settings.budgets, pause: settings.pause, creative: settings.creative, audience: settings.audience })
      queue.setData(updated)
      setSettings(null)
      notify('Automation settings saved.')
    } catch (failure) { notify(failure.message, 'error') } finally { setBusy('') }
  }
  const undo = async (item) => {
    setBusy(`undo-${item.id}`)
    try { await undoOptimization(item.id); history.setData((current) => current.map((entry) => entry.id === item.id ? { ...entry, undone: true } : entry)); notify('Optimization change undone.'); queue.reload({ refresh: true }) } catch (failure) { notify(failure.message, 'error') } finally { setBusy('') }
  }
  const saveFolder = async () => {
    if (!folder.name.trim()) { notify('Name the folder first.', 'error'); return }
    setBusy('folder')
    try {
      const created = await createOptimizationFolder({ ad_account_id: accountId, name: folder.name.trim(), campaign_ids: folder.campaigns, daily_cap: folder.cap ? Math.round(Number(folder.cap) * 100) : null, target_cost_per_conversion: folder.target ? Number(folder.target) : null })
      setFolderOpen(false); setFolder(EMPTY_FOLDER); setFolderId(created.folder_id)
      notify('Optimization folder saved.')
    } catch (failure) { notify(failure.message, 'error') } finally { setBusy('') }
  }
  const folders = queue.data?.folders || []
  const count = recommendations.length
  const campaignCount = queue.data?.campaign_count || 0
  return <div className="db-page db-optimize-page"><PageIntro eyebrow="Account optimization" icon="optimize" title="Make every learning count." description="See simple, suggested changes for your campaigns, understand why they matter, and apply only the ones you trust. You can also let Marketeer handle safe routine checks for you." /><MetaAccountStrip connected={connected} status={status} onManage={onManage} />
    {!connected ? <EmptyState icon="optimize" title="No account to optimize" body="Connect Meta Ads to calculate account-level recommendations." /> : !queue.data || !settings ? (queue.error ? <ErrorState error={queue.error} onRetry={queue.reload} /> : <LoadingState label="Reviewing your campaigns…" />) : <><section className="db-optimize-hero db-card"><div><span className="db-eyebrow"><Icon name="spark" size={14} /> Optimize for me</span><h2>{count ? `${count} opportunit${count === 1 ? 'y' : 'ies'} found across ${campaignCount} campaign${campaignCount === 1 ? '' : 's'}.` : queue.data.has_data ? 'No changes recommended right now.' : 'Not enough delivery to judge yet.'}</h2><p>Recommendations use delivery, cost, frequency, and creative fatigue from the last 14 days.</p></div><div className="db-mode-switch"><button className={mode === 'review' ? 'active' : ''} onClick={() => switchMode('review')}>Review first</button><button className={mode === 'auto' ? 'active' : ''} onClick={() => switchMode('auto')}>Hands-free</button></div></section><div className="db-scope-bar db-card"><span><Icon name="folder" size={15} /> Scope</span><button className={!folderId ? 'active' : ''} onClick={() => setFolderId('')}>Whole account</button>{folders.map((item) => <button className={folderId === item.folder_id ? 'active' : ''} onClick={() => setFolderId(item.folder_id)} key={item.folder_id}>{item.name}</button>)}<Button variant="ghost" icon="plus" onClick={() => setFolderOpen(true)}>Folder</Button></div>
      <div className="db-optimize-layout"><section className="db-card db-recommendation-panel"><header><div><h2>Review queue</h2><p>Choose exactly which changes Marketeer can apply.</p></div><Badge tone="blue">{count} ready</Badge></header>{queue.loading && <p className="db-helper">Updating…</p>}{count ? <div className="db-recommendation-list">{recommendations.map((item) => <article className={item.selected ? 'selected' : ''} key={item.id}><button className="db-select-check" onClick={() => setPicked((current) => ({ ...current, [item.id]: !item.selected }))}>{item.selected && <Icon name="check" size={13} />}</button><span className={`db-rec-icon ${item.type}`}><Icon name={item.type === 'budget' ? 'wallet' : item.type === 'pause' ? 'pause' : item.type === 'creative' ? 'image' : 'target'} size={18} /></span><div><Badge tone={item.confidence === 'High' ? 'lime' : 'blue'}>{item.confidence} confidence</Badge><h3>{item.title}</h3><p>{item.body}</p><strong>{item.impact}</strong></div><Button variant="soft" disabled={Boolean(busy)} onClick={() => apply([item])}>Apply</Button></article>)}</div> : <EmptyState icon="check" title="Queue cleared" body="No more changes are recommended for this scope." />}<footer><Button variant="secondary" disabled={!count} onClick={() => setPicked(Object.fromEntries(recommendations.map((item) => [item.id, true])))}>Select all</Button><Button icon="check" disabled={!selected.length || Boolean(busy)} onClick={() => apply()}>{busy === 'apply' ? 'Applying…' : `Apply selected (${selected.length})`}</Button></footer></section>
      <aside className="db-automation-panel"><section className="db-card"><div className="db-card-title"><div><span><Icon name="bolt" size={15} /></span><h3>Automation settings</h3></div><Button variant="soft" icon="check" disabled={busy === 'settings'} onClick={saveSettings}>{busy === 'settings' ? 'Saving…' : 'Save'}</Button></div><div className="db-form-grid two"><Field label={`Target CPL (${currency})`}><input type="number" min="0" value={settings.target} onChange={(event) => setSettings({ ...settings, target: event.target.value })} /></Field><Field label="Max budget change %"><input type="number" min="1" max="100" value={settings.change} onChange={(event) => setSettings({ ...settings, change: event.target.value })} /></Field><Field label="Minimum daily budget"><input type="number" min="0.01" step="0.01" value={settings.min} onChange={(event) => setSettings({ ...settings, min: event.target.value })} /></Field><Field label="Run hour (UTC)"><input type="number" min="0" max="23" value={settings.hour} onChange={(event) => setSettings({ ...settings, hour: event.target.value })} /></Field></div><div className="db-automation-toggles"><Toggle checked={settings.budgets} onChange={(value) => setSettings({ ...settings, budgets: value })} label="Budget pacing" hint="Scale strong ad sets within guardrails." /><Toggle checked={settings.pause} onChange={(value) => setSettings({ ...settings, pause: value })} label="Waste control" hint="Pause ads after enough evidence." /><Toggle checked={settings.creative} onChange={(value) => setSettings({ ...settings, creative: value })} label="Fatigue alerts" hint="Watch frequency and CTR decline." /><Toggle checked={settings.audience} onChange={(value) => setSettings({ ...settings, audience: value })} label="Audience expansion" hint="Shift spend to the platform audience converting cheapest." /></div></section></aside></div>
      <section className="db-card db-history"><header><div><h2>Change history</h2><p>Applied actions remain visible and reversible when supported.</p></div></header>{(history.data || []).length ? history.data.map((item) => <div key={item.id}><span><Icon name="bolt" size={15} /></span><div><b>{item.action}</b><p>{item.target} · {new Date(item.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} · {item.by}</p></div>{item.undone ? <Badge tone="gray">Undone</Badge> : <Button variant="ghost" icon="undo" disabled={busy === `undo-${item.id}`} onClick={() => undo(item)}>Undo</Button>}</div>) : <p className="db-helper">No changes applied yet.</p>}</section></>}
    {folderOpen && <Modal title="New optimization folder" onClose={() => setFolderOpen(false)} footer={<><Button variant="ghost" onClick={() => setFolderOpen(false)}>Cancel</Button><Button icon="check" disabled={busy === 'folder'} onClick={saveFolder}>{busy === 'folder' ? 'Saving…' : 'Save folder'}</Button></>}><div className="db-modal-form"><Field label="Folder name"><input value={folder.name} onChange={(event) => setFolder({ ...folder, name: event.target.value })} placeholder="Priority campaigns" /></Field><Field label={`Daily spend cap (${currency})`}><input type="number" min="0" value={folder.cap} onChange={(event) => setFolder({ ...folder, cap: event.target.value })} /></Field><Field label={`Target cost per lead (${currency})`}><input type="number" min="0" value={folder.target} onChange={(event) => setFolder({ ...folder, target: event.target.value })} /></Field><Field label="Campaigns"><div className="db-checkbox-list">{(campaigns.data || []).length ? campaigns.data.map((item) => <label key={item.id}><input type="checkbox" checked={folder.campaigns.includes(item.id)} onChange={(event) => setFolder({ ...folder, campaigns: event.target.checked ? [...folder.campaigns, item.id] : folder.campaigns.filter((id) => id !== item.id) })} /> {item.name}</label>) : <small>No campaigns yet.</small>}</div></Field></div></Modal>}
  </div>
}

export function AdsLibraryView({ connected, status, onManage, notify, onGo }) {
  const input = useRef(null)
  const library = useResource(() => (connected ? getCreativeAssets() : Promise.resolve({ assets: [], folders: [] })), [connected])
  const templates = useResource(() => (connected ? getTemplates() : Promise.resolve([])), [connected])
  const launches = useResource(() => (connected ? getLaunches() : Promise.resolve([])), [connected])
  const [folder, setFolder] = useState('All')
  const assets = library.data?.assets || []
  const folders = ['All', ...new Set(assets.map((item) => item.folder))]
  const visible = folder === 'All' ? assets : assets.filter((item) => item.folder === folder)
  const upload = async (file) => {
    if (!file) return
    try { await uploadStudioImage(file); await library.reload(); notify('Creative added to the asset library.') } catch (failure) { notify(failure.message, 'error') }
  }
  const move = async (asset, target) => { try { await moveCreativeAsset(asset.asset_id, target); library.reload() } catch (failure) { notify(failure.message, 'error') } }
  const remove = async (asset) => { try { await deleteCreativeAsset(asset.asset_id); library.reload(); notify('Asset deleted.') } catch (failure) { notify(failure.message, 'error') } }
  const removeTemplate = async (template) => { try { await deleteTemplate(template.template_id); templates.reload() } catch (failure) { notify(failure.message, 'error') } }
  return <div className="db-page"><PageIntro eyebrow="Creative library" icon="library" title="Reuse the work that already works." description="Campaign templates, generated visuals, uploads, and recent launch records." actions={<Button icon="upload" onClick={() => input.current?.click()}>Upload asset</Button>} /><input ref={input} type="file" accept="image/*" hidden onChange={(event) => { upload(event.target.files?.[0]); event.target.value = '' }} /><MetaAccountStrip connected={connected} status={status} onManage={onManage} />
    {!connected ? <EmptyState icon="library" title="Connect Meta to load the library" body="Generated campaign assets and templates are stored against your connected workspace." /> : <><section className="db-card db-template-section"><header><div><h2>Campaign templates</h2><p>Saved plans include copy, images, targeting, lead form, and budget.</p></div><Badge tone="blue">{(templates.data || []).length} templates</Badge></header><div className="db-template-grid">{(templates.data || []).map((template) => <article key={template.template_id}><span><Icon name="copy" size={19} /></span><Badge tone="gray">{template.uses} uses</Badge><h3>{template.name}</h3><p>{template.description}</p><div><small>{template.copy_count} copy angles</small><small>{template.image_count} images</small><small>{money((template.daily_budget || 0) / 100, template.currency || 'USD', 0)}/day</small></div><footer><Button variant="soft" icon="play" onClick={() => { notify(`Choose “${template.name}” as the starting template in Campaign Studio.`); onGo('adstudio') }}>Use template</Button><button onClick={() => removeTemplate(template)} aria-label="Delete template"><Icon name="trash" size={15} /></button></footer></article>)}</div></section>
      <section className="db-card db-asset-section"><header><div><h2>Asset library</h2><p>Generated and uploaded creative, organized into reusable folders.</p></div><Button variant="secondary" icon="upload" onClick={() => input.current?.click()}>Upload</Button></header><div className="db-folder-pills">{folders.map((name) => <button className={folder === name ? 'active' : ''} onClick={() => setFolder(name)} key={name}><Icon name="folder" size={13} />{name}<span>{name === 'All' ? assets.length : assets.filter((item) => item.folder === name).length}</span></button>)}</div>{visible.length ? <div className="db-asset-grid">{visible.map((asset) => <article key={asset.asset_id}><CreativeArt theme={(asset.label || 'ASSET').toUpperCase()} imageUrl={asset.url} compact /><div><b>{asset.label}</b><Badge tone="gray">{KIND_LABELS[asset.kind] || asset.kind}</Badge><Field label="Folder"><select value={asset.folder} onChange={(event) => move(asset, event.target.value)}>{folders.filter((item) => item !== 'All').map((name) => <option key={name}>{name}</option>)}<option>uploads</option></select></Field><button onClick={() => remove(asset)}><Icon name="trash" size={15} /> Delete</button></div></article>)}</div> : <EmptyState icon="image" title="No assets in this folder" body="Choose another folder or upload a new creative." />}</section>
      <section className="db-card db-launch-records"><header><div><h2>Recent launches</h2><p>Campaigns created from Marketeer’s Campaign Studio.</p></div></header><div className="db-table-wrap"><table className="db-table"><thead><tr><th>Campaign</th><th>Offer</th><th>Status</th><th>Ads</th><th>Budget</th><th>Created</th></tr></thead><tbody>{(launches.data || []).map((launch) => <tr key={launch.launch_id}><td><b>{launch.campaign_name}</b></td><td>{launch.offer_title}</td><td><Badge tone={launch.status === 'ACTIVE' ? 'lime' : 'gray'}>{launch.status === 'ACTIVE' ? 'Active' : 'Paused'}</Badge></td><td>{launch.ad_count}</td><td>{launch.daily_budget ? `${money(launch.daily_budget / 100, launch.currency || 'USD', 0)}/day` : '—'}</td><td>{relativeTime(launch.created_at)}</td></tr>)}</tbody></table></div></section></>}
  </div>
}
