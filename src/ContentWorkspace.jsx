import { useMemo, useRef, useState } from 'react'
import { calendarContent, campaigns, connectedChannels, contentRecords, dashboardMockService } from './dashboardMockData.js'
import { Badge, Button, CreativeArt, EmptyState, Field, Icon, Modal, PageIntro, PlatformMark, SocialPreview, Spinner } from './dashboardUI.jsx'

const CONTENT_STEPS = ['Brief & assets', 'Generate', 'Refine', 'Preview & schedule', 'Confirm']
const FORMATS = [
  ['Post', 'Square or portrait feed creative', 'content'],
  ['Carousel', 'A swipeable story across multiple slides', 'library'],
  ['Story', 'An immersive 9:16 moment', 'eye'],
  ['Reel', 'Short-form motion made for discovery', 'play'],
]
const TONES = ['Bold & warm', 'Playful', 'Editorial', 'Educational', 'Minimal']

function ContentStepper({ step }) {
  return <ol className="db-flow-stepper">{CONTENT_STEPS.map((label, index) => <li className={index < step ? 'done' : index === step ? 'active' : ''} key={label}><span>{index < step ? <Icon name="check" size={13} /> : index + 1}</span><b>{label}</b>{index < CONTENT_STEPS.length - 1 && <i />}</li>)}</ol>
}

function AssetRow({ asset, onChange, onRemove }) {
  return (
    <div className="db-uploaded-asset">
      <div>{asset.type.startsWith('video') ? <video src={asset.url} muted /> : <img src={asset.url} alt="Selected asset" />}</div>
      <Field label="Use this as">
        <select value={asset.role} onChange={(event) => onChange({ role: event.target.value })}><option value="product">Product to feature</option><option value="person">Person</option><option value="background">Background / scene</option><option value="logo">Logo or brand mark</option><option value="as-is">Finished creative — use as is</option></select>
      </Field>
      <Field label="Creative note"><input value={asset.note} onChange={(event) => onChange({ note: event.target.value })} placeholder="e.g. keep the bottle upright" /></Field>
      <button onClick={onRemove} aria-label="Remove asset"><Icon name="trash" size={16} /></button>
    </div>
  )
}

function DesignEditor({ variant, onClose, onSave }) {
  const [theme, setTheme] = useState(variant.theme)
  const [palette, setPalette] = useState(variant.palette)
  const [font, setFont] = useState('Display serif')
  const [size, setSize] = useState(64)
  const [align, setAlign] = useState('Left')
  const [busy, setBusy] = useState(false)
  const regenerate = async () => { setBusy(true); await dashboardMockService.save(); setPalette((value) => value === 'lime' ? 'blue' : value === 'blue' ? 'orange' : 'lime'); setBusy(false) }
  return (
    <Modal title="Edit generated creative" onClose={onClose} wide footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon="check" onClick={() => onSave({ ...variant, theme, palette })}>Apply changes</Button></>}>
      <div className="db-design-editor">
        <CreativeArt palette={palette} theme={theme} />
        <div className="db-design-controls">
          <span className="db-eyebrow"><Icon name="edit" size={14} /> Creative controls</span>
          <Field label="On-image message"><textarea rows="3" value={theme} onChange={(event) => setTheme(event.target.value.toUpperCase())} /></Field>
          <div className="db-form-grid two"><Field label="Typeface"><select value={font} onChange={(event) => setFont(event.target.value)}><option>Display serif</option><option>Modern sans</option><option>Heavy grotesk</option><option>Editorial italic</option></select></Field><Field label="Alignment"><select value={align} onChange={(event) => setAlign(event.target.value)}><option>Left</option><option>Center</option><option>Right</option></select></Field></div>
          <Field label={`Text size · ${size}px`}><input type="range" min="32" max="110" value={size} onChange={(event) => setSize(event.target.value)} /></Field>
          <Field label="Color direction"><div className="db-color-options">{['lime', 'blue', 'orange', 'pink', 'violet'].map((color) => <button className={`${color} ${palette === color ? 'active' : ''}`} onClick={() => setPalette(color)} key={color} aria-label={color} />)}</div></Field>
          <Button variant="secondary" icon="refresh" disabled={busy} onClick={regenerate}>{busy ? 'Painting a new scene…' : 'Regenerate background'}</Button>
          <p className="db-helper"><Icon name="info" size={14} /> Text and layout edits are instant. Background regeneration is simulated in demo mode.</p>
        </div>
      </div>
    </Modal>
  )
}

function BriefStep({ prompt, setPrompt, format, setFormat, platforms, setPlatforms, assets, setAssets, onGenerate, fixing, setFixing }) {
  const fileInput = useRef(null)
  const upload = (files) => {
    const next = Array.from(files || []).map((file, index) => ({ id: `${file.name}-${index}-${Date.now()}`, name: file.name, type: file.type, url: URL.createObjectURL(file), role: file.type.startsWith('video') ? 'as-is' : 'product', note: '' }))
    setAssets((current) => [...current, ...next])
  }
  const fixPrompt = async () => { setFixing(true); await dashboardMockService.save(); setPrompt((value) => value.trim().replace(/\s+/g, ' ').replace(/^./, (letter) => letter.toUpperCase())); setFixing(false) }
  return (
    <div className="db-create-brief-layout">
      <section className="db-card db-brief-main">
        <div className="db-section-heading"><span><Icon name="spark" size={18} /></span><div><h2>Start with the idea</h2><p>Describe the post in your own words. Marketeer will build the visual, caption, and hashtags around it.</p></div></div>
        <Field label="What should this post communicate?" hint="The clearer the goal, offer, and audience, the stronger the first draft."><textarea rows="6" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Example: Announce our autumn collection with a calm, editorial feel. Focus on considered materials and invite people to explore the full edit." /></Field>
        <Button variant="soft" icon={fixing ? 'refresh' : 'spark'} disabled={!prompt.trim() || fixing} onClick={fixPrompt}>{fixing ? 'Cleaning it up…' : 'Fix spelling & clarity'}</Button>
        <div className="db-divider" />
        <div className="db-section-heading compact"><span><Icon name="upload" size={18} /></span><div><h2>Add optional assets</h2><p>Tell the designer what each upload represents.</p></div></div>
        <button className="db-dropzone" onClick={() => fileInput.current?.click()}><Icon name="upload" size={23} /><b>Drop brand or product media here</b><small>JPG, PNG, MP4 or MOV · multiple files supported</small></button>
        <input ref={fileInput} type="file" accept="image/*,video/*" multiple hidden onChange={(event) => upload(event.target.files)} />
        {!!assets.length && <div className="db-upload-list">{assets.map((asset) => <AssetRow key={asset.id} asset={asset} onChange={(patch) => setAssets((current) => current.map((item) => item.id === asset.id ? { ...item, ...patch } : item))} onRemove={() => setAssets((current) => current.filter((item) => item.id !== asset.id))} />)}</div>}
      </section>
      <aside className="db-create-settings">
        <section className="db-card"><h3>Format</h3><div className="db-format-picker">{FORMATS.map(([name, body, icon]) => <button className={format === name ? 'active' : ''} onClick={() => setFormat(name)} key={name}><span><Icon name={icon} size={18} /></span><b>{name}</b><small>{body}</small>{format === name && <i><Icon name="check" size={12} /></i>}</button>)}</div></section>
        <section className="db-card"><h3>Publish to</h3><div className="db-channel-picker">{connectedChannels.map((channel) => <button disabled={!channel.connected} className={platforms.includes(channel.name) ? 'active' : ''} onClick={() => setPlatforms((current) => current.includes(channel.name) ? current.filter((item) => item !== channel.name) : [...current, channel.name])} key={channel.id}><PlatformMark platform={channel.name} /><span><b>{channel.name}</b><small>{channel.connected ? channel.handle : 'Connect first'}</small></span>{platforms.includes(channel.name) && <Icon name="check" size={14} />}</button>)}</div></section>
        <Button className="full" icon="spark" disabled={!prompt.trim() || !platforms.length} onClick={onGenerate}>Generate content</Button>
        <p className="db-safe-note"><Icon name="info" size={14} /> Nothing publishes without your approval.</p>
      </aside>
    </div>
  )
}

export function ContentCreate({ notify, onGo }) {
  const [step, setStep] = useState(0)
  const [prompt, setPrompt] = useState('Announce our new creative planning workspace with an energetic, design-led post. Focus on turning one good idea into consistent content.')
  const [format, setFormat] = useState('Post')
  const [platforms, setPlatforms] = useState(['Instagram', 'Facebook'])
  const [assets, setAssets] = useState([])
  const [variants, setVariants] = useState([])
  const [selected, setSelected] = useState(null)
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState([])
  const [tone, setTone] = useState('Bold & warm')
  const [generating, setGenerating] = useState(false)
  const [rewriting, setRewriting] = useState(false)
  const [fixing, setFixing] = useState(false)
  const [editingDesign, setEditingDesign] = useState(false)
  const [scheduleMode, setScheduleMode] = useState('schedule')
  const [date, setDate] = useState('2026-09-29')
  const [time, setTime] = useState('18:00')
  const [done, setDone] = useState(false)

  const generate = async () => {
    setStep(1); setGenerating(true); setVariants([])
    const result = await dashboardMockService.generateContent({ prompt, format, platforms, assets })
    setVariants(result); setGenerating(false)
  }
  const choose = (variant) => { setSelected(variant); setCaption(variant.caption); setHashtags(variant.hashtags); setStep(2) }
  const rewrite = async () => { setRewriting(true); setCaption(await dashboardMockService.rewriteCaption(caption, tone)); setRewriting(false); notify('Caption rewritten in your selected tone.') }
  const saveDraft = async () => { await dashboardMockService.save(); notify('Draft saved to the content library.') }
  const commit = async () => { setGenerating(true); await dashboardMockService.save(); setGenerating(false); setDone(true); notify(scheduleMode === 'now' ? 'Post sent to your selected channels.' : 'Post added to the content calendar.') }
  const previewVariant = selected || variants[0] || { palette: 'lime', theme: 'MOVE / WITH PURPOSE' }

  return (
    <div className="db-page db-content-create">
      <PageIntro eyebrow="Content studio" icon="create" title={step === 0 ? 'Create something worth stopping for.' : 'Create, refine, and share.'} description="From a loose brief to channel-ready creative, without losing your point of view." actions={step > 1 && !done ? <Button variant="secondary" icon="file" onClick={saveDraft}>Save draft</Button> : null} />
      <ContentStepper step={step} />

      {step === 0 && <BriefStep prompt={prompt} setPrompt={setPrompt} format={format} setFormat={setFormat} platforms={platforms} setPlatforms={setPlatforms} assets={assets} setAssets={setAssets} onGenerate={generate} fixing={fixing} setFixing={setFixing} />}

      {step === 1 && <section className="db-generation-stage">
        {generating ? <Spinner label="Designing three directions…" progress={72} /> : <>
          <div className="db-center-heading"><Badge tone="blue">3 distinct directions</Badge><h2>Choose an idea to refine.</h2><p>Each route uses the same brief with a different visual and editorial angle.</p></div>
          <div className="db-variant-grid">{variants.map((variant) => <article className="db-card db-variant-card" key={variant.id}><CreativeArt palette={variant.palette} theme={variant.theme} /><div><Badge tone={variant.palette}>{variant.angle}</Badge><p>{variant.caption}</p><div className="db-inline-tags">{variant.hashtags.map((tag) => <span key={tag}>#{tag}</span>)}</div><Button className="full" icon="arrow" onClick={() => choose(variant)}>Refine this direction</Button></div></article>)}</div>
          <div className="db-flow-actions"><Button variant="ghost" icon="back" onClick={() => setStep(0)}>Back to brief</Button><Button variant="secondary" icon="refresh" onClick={generate}>Regenerate all</Button></div>
        </>}
      </section>}

      {step === 2 && <div className="db-refine-layout">
        <section className="db-card db-refine-panel">
          <div className="db-section-heading"><span><Icon name="edit" size={18} /></span><div><h2>Refine the story</h2><p>Keep what works and adjust the rest before scheduling.</p></div></div>
          <Field label="Caption"><textarea rows="7" value={caption} maxLength="2200" onChange={(event) => setCaption(event.target.value)} /><small className="db-count">{caption.length} / 2,200</small></Field>
          <div className="db-tone-row"><Field label="Tone"><select value={tone} onChange={(event) => setTone(event.target.value)}>{TONES.map((item) => <option key={item}>{item}</option>)}</select></Field><Button variant="soft" icon="spark" disabled={rewriting} onClick={rewrite}>{rewriting ? 'Rewriting…' : 'Rewrite with AI'}</Button></div>
          <Field label="Hashtag suggestions"><div className="db-hashtag-editor">{['BuildInPublic', 'CreativeMomentum', 'Marketeer', 'SocialStrategy', 'ContentDesign'].map((tag) => <button className={hashtags.includes(tag) ? 'active' : ''} onClick={() => setHashtags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])} key={tag}>#{tag}{hashtags.includes(tag) && ' ×'}</button>)}</div></Field>
          <div className="db-creative-edit-row"><CreativeArt palette={previewVariant.palette} theme={previewVariant.theme} compact /><div><h3>Generated creative</h3><p>Edit its message, type, colors, alignment, or create a fresh background.</p><Button variant="secondary" icon="edit" onClick={() => setEditingDesign(true)}>Open creative editor</Button></div></div>
          <div className="db-flow-actions"><Button variant="ghost" icon="back" onClick={() => setStep(1)}>Back</Button><Button icon="arrow" onClick={() => setStep(3)}>Preview & schedule</Button></div>
        </section>
        <aside className="db-sticky-preview"><span className="db-eyebrow">Live preview · {format}</span><SocialPreview caption={caption} hashtags={hashtags} platforms={platforms} palette={previewVariant.palette} theme={previewVariant.theme} format={format} imageUrl={assets[0]?.url} /><p><Icon name="spark" size={14} /> Crops and safe areas adapt per channel.</p></aside>
      </div>}

      {step === 3 && <div className="db-schedule-layout">
        <aside className="db-card db-final-preview"><span className="db-eyebrow">Final preview</span><SocialPreview caption={caption} hashtags={hashtags} platforms={platforms} palette={previewVariant.palette} theme={previewVariant.theme} format={format} imageUrl={assets[0]?.url} /></aside>
        <section className="db-card db-schedule-panel"><span className="db-eyebrow"><Icon name="calendar" size={14} /> Publishing</span><h2>Choose your moment.</h2><p>Publish immediately or add it to the calendar for the right time.</p>
          <div className="db-choice-grid two"><button className={scheduleMode === 'now' ? 'active' : ''} onClick={() => setScheduleMode('now')}><span><Icon name="send" size={18} /></span><b>Publish now</b><small>Send it to every selected channel</small>{scheduleMode === 'now' && <i><Icon name="check" size={13} /></i>}</button><button className={scheduleMode === 'schedule' ? 'active' : ''} onClick={() => setScheduleMode('schedule')}><span><Icon name="calendar" size={18} /></span><b>Schedule for later</b><small>Your audience is most active at 6 PM</small>{scheduleMode === 'schedule' && <i><Icon name="check" size={13} /></i>}</button></div>
          {scheduleMode === 'schedule' && <><div className="db-form-grid two"><Field label="Date"><input type="date" value={date} min="2026-09-26" onChange={(event) => setDate(event.target.value)} /></Field><Field label="Time"><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></Field></div><div className="db-recommended-times"><b>Recommended:</b>{['10:00', '14:00', '18:00', '21:00'].map((slot) => <button className={time === slot ? 'active' : ''} onClick={() => setTime(slot)} key={slot}>{slot}</button>)}</div></>}
          <div className="db-publish-summary"><div><span>Destinations</span><p>{platforms.map((platform) => <PlatformMark platform={platform} key={platform} />)}</p></div><div><span>Format</span><b>{format}</b></div><div><span>Timing</span><b>{scheduleMode === 'now' ? 'Now' : `${date} · ${time}`}</b></div></div>
          <div className="db-flow-actions"><Button variant="ghost" icon="back" onClick={() => setStep(2)}>Back to refine</Button><Button icon="arrow" onClick={() => setStep(4)}>Review confirmation</Button></div>
        </section>
      </div>}

      {step === 4 && <section className="db-card db-confirm-card">{done ? <><span className="db-success-orb"><Icon name="check" size={30} /></span><Badge>All set</Badge><h2>{scheduleMode === 'now' ? 'Your post is on its way.' : 'Your post is scheduled.'}</h2><p>{scheduleMode === 'now' ? `Publishing to ${platforms.join(', ')} now.` : `${date} at ${time} · ${platforms.join(', ')}`}</p><div><Button variant="secondary" icon="plus" onClick={() => window.location.reload()}>Create another</Button><Button icon="content" onClick={() => onGo('content')}>Open content library</Button></div></> : <><span className="db-confirm-icon"><Icon name="send" size={25} /></span><h2>Ready to {scheduleMode === 'now' ? 'publish' : 'schedule'}?</h2><p>{scheduleMode === 'now' ? `This sends the post to ${platforms.length} connected channels now.` : `This schedules the post for ${date} at ${time}.`} You can still go back and make changes.</p><div className="db-confirm-details"><span><b>{format}</b> format</span><span><b>{platforms.length}</b> destinations</span><span><b>{hashtags.length}</b> hashtags</span></div><div><Button variant="ghost" icon="back" onClick={() => setStep(3)}>Back</Button><Button icon="check" disabled={generating} onClick={commit}>{generating ? 'Saving…' : `Confirm & ${scheduleMode === 'now' ? 'publish' : 'schedule'}`}</Button></div></>}</section>}

      {editingDesign && <DesignEditor variant={previewVariant} onClose={() => setEditingDesign(false)} onSave={(updated) => { setSelected(updated); setVariants((current) => current.map((item) => item.id === updated.id ? updated : item)); setEditingDesign(false); notify('Creative edits applied.') }} />}
    </div>
  )
}

export function ContentLibrary({ notify, onGo }) {
  const [records, setRecords] = useState(contentRecords)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState(null)
  const filters = ['all', 'draft', 'scheduled', 'published', 'failed']
  const visible = records.filter((item) => (filter === 'all' || item.status === filter) && `${item.title} ${item.caption}`.toLowerCase().includes(query.toLowerCase()))
  const remove = (id) => { setRecords((current) => current.filter((item) => item.id !== id)); setDetail(null); notify('Post removed from the demo library.') }
  const publish = (id) => { setRecords((current) => current.map((item) => item.id === id ? { ...item, status: 'published' } : item)); setDetail((item) => item ? { ...item, status: 'published' } : item); notify('Post marked as published.') }
  return (
    <div className="db-page">
      <PageIntro eyebrow="Content library" icon="content" title="Every idea, in one place." description="Review drafts, scheduled posts, and published work across every connected channel." actions={<Button icon="plus" onClick={() => onGo('create')}>Create post</Button>} />
      <div className="db-toolbar db-card"><div className="db-filter-pills">{filters.map((item) => <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}<span>{item === 'all' ? records.length : records.filter((record) => record.status === item).length}</span></button>)}</div><label className="db-toolbar-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search content…" /></label><Button variant="ghost" icon="refresh" onClick={() => notify('Content library refreshed.')}>Refresh</Button></div>
      {visible.length ? <div className="db-content-grid">{visible.map((item) => <article className="db-card db-content-card" key={item.id}><button className="db-content-art" onClick={() => setDetail(item)}><CreativeArt palette={item.palette} theme={item.title.toUpperCase().replace(' ', ' / ')} compact /><Badge tone={item.status === 'published' ? 'lime' : item.status === 'scheduled' ? 'blue' : item.status === 'failed' ? 'red' : 'gray'}>{item.status}</Badge></button><div className="db-content-card-body"><div className="db-content-meta"><span>{item.format}</span><span>·</span><span>{item.source}</span></div><h2>{item.title}</h2><p>{item.caption}</p><div className="db-card-platforms">{item.platforms.map((platform) => <PlatformMark platform={platform} key={platform} />)}{item.date && <span><Icon name="clock" size={14} /> {item.date} · {item.time}</span>}</div></div><footer><Button variant="ghost" icon="eye" onClick={() => setDetail(item)}>View post</Button><button aria-label="More options"><Icon name="more" size={18} /></button></footer></article>)}</div> : <EmptyState icon="content" title="No posts match this view" body="Try another status or search phrase." />}
      {detail && <Modal title={detail.title} onClose={() => setDetail(null)} wide footer={<><Button variant="ghost" icon="trash" onClick={() => remove(detail.id)}>Delete</Button>{detail.status !== 'published' && <Button icon="send" onClick={() => publish(detail.id)}>Publish now</Button>}</>}><div className="db-post-detail"><SocialPreview caption={detail.caption} platforms={detail.platforms} palette={detail.palette} theme={detail.title.toUpperCase().replace(' ', ' / ')} format={detail.format} /><div><Badge tone={detail.status === 'published' ? 'lime' : detail.status === 'scheduled' ? 'blue' : 'gray'}>{detail.status}</Badge><h3>Post details</h3><dl><div><dt>Format</dt><dd>{detail.format}</dd></div><div><dt>Created with</dt><dd>{detail.source}</dd></div><div><dt>Publishing</dt><dd>{detail.date ? `${detail.date} · ${detail.time}` : 'Not scheduled'}</dd></div><div><dt>Channels</dt><dd>{detail.platforms.join(', ')}</dd></div></dl><Field label="Caption"><textarea rows="6" value={detail.caption} onChange={(event) => setDetail({ ...detail, caption: event.target.value })} /></Field><Button variant="secondary" icon="edit" onClick={() => { setRecords((current) => current.map((item) => item.id === detail.id ? detail : item)); notify('Post changes saved.') }}>Save changes</Button></div></div></Modal>}
    </div>
  )
}

function monthCells(anchor) {
  const year = anchor.getFullYear(); const month = anchor.getMonth(); const first = new Date(year, month, 1); const count = new Date(year, month + 1, 0).getDate(); const prior = new Date(year, month, 0).getDate()
  return Array.from({ length: 42 }, (_, index) => {
    const offset = index - first.getDay() + 1
    if (offset < 1) return { date: new Date(year, month - 1, prior + offset), muted: true }
    if (offset > count) return { date: new Date(year, month + 1, offset - count), muted: true }
    return { date: new Date(year, month, offset), muted: false }
  })
}

const isoDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const liveCampaigns = campaigns.filter((campaign) => ['active', 'learning'].includes(campaign.status) && campaign.start && campaign.end)
const channelLogo = (name) => `/social_logos/${String(name).toLowerCase().includes('facebook') ? 'facebook' : 'instagram'}.png`
const prettyDay = (value) => new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const campaignsOn = (dateKey) => liveCampaigns.filter((campaign) => dateKey >= campaign.start && dateKey <= campaign.end)

export function ContentCalendar({ notify, onGo }) {
  const [anchor, setAnchor] = useState(new Date(2026, 8, 1))
  const [selected, setSelected] = useState(null)
  const cells = useMemo(() => monthCells(anchor), [anchor])
  const month = anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const move = (amount) => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + amount, 1))
  const campaignOpen = selected?.kind === 'campaign'
  return (
    <div className="db-page">
      <PageIntro eyebrow="Content calendar" icon="calendar" title="See the whole story." description="Posts and live campaigns sit on the days they run." actions={<Button icon="plus" onClick={() => onGo('create')}>New post</Button>} />
      <section className="db-calendar db-card">
        <header>
          <div><button onClick={() => move(-1)} aria-label="Previous month"><Icon name="back" size={17} /></button><button onClick={() => setAnchor(new Date(2026, 8, 1))}>Today</button><button onClick={() => move(1)} aria-label="Next month"><Icon name="arrow" size={17} /></button></div>
          <h2>{month}</h2>
          <div className="db-calendar-legend"><span><i className="lime" />Published</span><span><i className="blue" />Scheduled</span><span><i className="campaign" />Live campaign</span></div>
        </header>
        <div className="db-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="db-month-grid">{cells.map(({ date: cellDate, muted }, index) => {
          const dateKey = isoDate(cellDate)
          const events = calendarContent.filter((item) => item.date === dateKey)
          const running = muted ? [] : campaignsOn(dateKey)
          const today = dateKey === '2026-09-26'
          return <div className={`db-day ${muted ? 'muted' : ''} ${today ? 'today' : ''}`} key={`${dateKey}-${index}`}>
            <span>{cellDate.getDate()}</span>
            {events.map((event) => <button className={`db-cal-post ${event.status}`} onClick={() => setSelected(event)} key={event.id}>
              <img src={event.image} alt="" />
              <em><img src={channelLogo(event.platforms[0])} alt="" /><span><b>{event.title}</b><small>{event.time}</small></span></em>
            </button>)}
            {running.map((campaign) => <button className="db-cal-live" onClick={() => setSelected({ ...campaign, kind: 'campaign', title: campaign.name })} key={campaign.id}><img src={campaign.image} alt="" /><b>{campaign.name}</b></button>)}
            {!muted && <button className="db-day-add" onClick={() => { notify(`Starting a post for ${dateKey}.`); onGo('create') }}><Icon name="plus" size={13} /> Add</button>}
          </div>
        })}</div>
      </section>
      {selected && <Modal title={selected.title || selected.name} onClose={() => setSelected(null)} footer={<><Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>{campaignOpen ? <Button icon="arrow" onClick={() => { setSelected(null); onGo('campaigns') }}>View campaign</Button> : <Button icon="edit" onClick={() => notify('This scheduled post is ready to edit from Content.')}>Edit post</Button>}</>}>
        <div className="db-calendar-popover">
          {selected.image ? <img className="db-cal-modal-shot" src={selected.image} alt="" /> : <CreativeArt palette={selected.palette} theme={(selected.title || selected.name).toUpperCase().replace(' ', ' / ')} compact />}
          <Badge tone={campaignOpen ? 'blue' : selected.status === 'published' ? 'lime' : selected.status === 'failed' ? 'orange' : 'blue'}>{campaignOpen ? selected.delivery : selected.status}</Badge>
          {campaignOpen ? <p>{prettyDay(selected.start)} – {prettyDay(selected.end)} · ${selected.budget}/day · {selected.leads} leads</p> : <p>{prettyDay(selected.date)} at {selected.time}{selected.format ? ` · ${selected.format}` : ''}</p>}
          {!campaignOpen && <div>{selected.platforms.map((platform) => <span key={platform}><img src={channelLogo(platform)} alt="" /> {platform}</span>)}</div>}
        </div>
      </Modal>}
    </div>
  )
}
