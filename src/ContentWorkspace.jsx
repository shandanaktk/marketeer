import { useEffect, useMemo, useRef, useState } from 'react'
import {
  deletePost, fixPrompt, generateContent, getCampaignTable, getChannels, getKnowledge, getSettings, isoDay, listPosts,
  money, newBackground, publishPost, renderCreative, rewriteCaption, savePost, suggestHashtags, toPostRecord, uploadMedia, useResource,
} from './api.js'
import { useBrand } from './brandContext.js'
import { Badge, Button, ChannelLogo, CreativeArt, EmptyState, ErrorState, Field, Icon, LoadingState, Modal, PageIntro, SocialPreview, Spinner } from './dashboardUI.jsx'

const CONTENT_STEPS = ['Brief & assets', 'Generate', 'Refine', 'Preview & schedule', 'Confirm']
const FORMATS = [
  ['Post', 'Square or portrait feed creative', 'content'],
  ['Carousel', 'A swipeable story across multiple slides', 'library'],
  ['Story', 'An immersive 9:16 moment', 'eye'],
  ['Reel', 'Short-form motion made for discovery', 'play'],
]
const TONES = ['Bold & warm', 'Playful', 'Editorial', 'Educational', 'Minimal']
const FONTS = ['Display serif', 'Modern sans', 'Heavy grotesk', 'Editorial italic']

const tomorrow = () => { const date = new Date(); date.setDate(date.getDate() + 1); return isoDay(date) }

function ContentStepper({ step }) {
  return <ol className="db-flow-stepper">{CONTENT_STEPS.map((label, index) => <li className={index < step ? 'done' : index === step ? 'active' : ''} key={label}><span>{index < step ? <Icon name="check" size={13} /> : index + 1}</span><b>{label}</b>{index < CONTENT_STEPS.length - 1 && <i />}</li>)}</ol>
}

function AssetRow({ asset, onChange, onRemove }) {
  return (
    <div className="db-uploaded-asset">
      <div>{asset.type.startsWith('video') ? <video src={asset.url} muted /> : <img src={asset.url} alt="Selected asset" />}</div>
      <Field label={asset.uploading ? 'Uploading…' : asset.error ? 'Upload failed' : 'Use this as'}>
        <select value={asset.role} disabled={asset.uploading || Boolean(asset.error)} onChange={(event) => onChange({ role: event.target.value })}><option value="product">Product to feature</option><option value="person">Person</option><option value="background">Background / scene</option><option value="logo">Logo or brand mark</option><option value="as-is">Finished creative — use as is</option></select>
      </Field>
      <Field label="Creative note"><input value={asset.note} disabled={Boolean(asset.error)} onChange={(event) => onChange({ note: event.target.value })} placeholder={asset.error || 'e.g. keep the bottle upright'} /></Field>
      <button onClick={onRemove} aria-label="Remove asset"><Icon name="trash" size={16} /></button>
    </div>
  )
}

function DesignEditor({ variant, format, onClose, onSave }) {
  const [theme, setTheme] = useState(variant.theme || '')
  const [palette, setPalette] = useState(variant.palette || 'lime')
  const [font, setFont] = useState(variant.design?.font || 'Display serif')
  const [size, setSize] = useState(variant.design?.size || 64)
  const [align, setAlign] = useState(variant.design?.align || 'Left')
  const [base, setBase] = useState(variant.base_image || '')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const regenerate = async () => {
    setBusy('background'); setError('')
    try { setBase((await newBackground({ palette, format, theme })).base_image) } catch (failure) { setError(failure.message) } finally { setBusy('') }
  }
  const apply = async () => {
    setBusy('apply'); setError('')
    try {
      const rendered = await renderCreative({ base_image: base || null, theme, palette, font, size: Number(size), align, format })
      const rest = (variant.media || []).slice(1).filter((item) => !String(item.type).startsWith('video'))
      onSave({ ...variant, theme, palette, base_image: base, image: rendered.image, design: { font, size: Number(size), align }, media: [rendered.media_item, ...rest] })
    } catch (failure) {
      setError(failure.message)
      setBusy('')
    }
  }
  return (
    <Modal title="Edit generated creative" onClose={onClose} wide footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon="check" disabled={Boolean(busy)} onClick={apply}>{busy === 'apply' ? 'Applying…' : 'Apply changes'}</Button></>}>
      <div className="db-design-editor">
        <CreativeArt palette={palette} theme={theme} imageUrl={base || undefined} />
        <div className="db-design-controls">
          <span className="db-eyebrow"><Icon name="edit" size={14} /> Creative controls</span>
          <Field label="On-image message" hint="Separate the two lines with “ / ”."><textarea rows="3" value={theme} onChange={(event) => setTheme(event.target.value.toUpperCase())} /></Field>
          <div className="db-form-grid two"><Field label="Typeface"><select value={font} onChange={(event) => setFont(event.target.value)}>{FONTS.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Alignment"><select value={align} onChange={(event) => setAlign(event.target.value)}><option>Left</option><option>Center</option><option>Right</option></select></Field></div>
          <Field label={`Text size · ${size}px`}><input type="range" min="32" max="110" value={size} onChange={(event) => setSize(event.target.value)} /></Field>
          <Field label="Color direction"><div className="db-color-options">{['lime', 'blue', 'orange', 'pink', 'violet'].map((color) => <button className={`${color} ${palette === color ? 'active' : ''}`} onClick={() => setPalette(color)} key={color} aria-label={color} />)}</div></Field>
          <Button variant="secondary" icon="refresh" disabled={Boolean(busy)} onClick={regenerate}>{busy === 'background' ? 'Painting a new scene…' : 'Regenerate background'}</Button>
          {error ? <p className="db-warning">{error}</p> : <p className="db-helper"><Icon name="info" size={14} /> The preview updates as you type. Apply renders the final creative at full resolution.</p>}
        </div>
      </div>
    </Modal>
  )
}

function BriefStep({ prompt, setPrompt, format, setFormat, platforms, setPlatforms, channels, assets, setAssets, onGenerate, fixing, setFixing, notify }) {
  const fileInput = useRef(null)
  const upload = (files) => {
    Array.from(files || []).forEach((file, index) => {
      const localId = `${file.name}-${index}-${Date.now()}`
      setAssets((current) => [...current, { localId, id: null, name: file.name, type: file.type || 'image/jpeg', url: URL.createObjectURL(file), role: file.type.startsWith('video') ? 'as-is' : 'product', note: '', uploading: true }])
      uploadMedia(file)
        .then((stored) => setAssets((current) => current.map((item) => item.localId === localId ? { ...item, id: stored.id, url: stored.url, type: stored.type, uploading: false } : item)))
        .catch((failure) => setAssets((current) => current.map((item) => item.localId === localId ? { ...item, uploading: false, error: failure.message } : item)))
    })
  }
  const fixPromptText = async () => {
    setFixing(true)
    try { setPrompt(await fixPrompt(prompt)) } catch (failure) { notify(failure.message, 'error') } finally { setFixing(false) }
  }
  const busyAssets = assets.some((asset) => asset.uploading)
  return (
    <div className="db-create-brief-layout">
      <section className="db-card db-brief-main">
        <div className="db-section-heading"><span><Icon name="spark" size={18} /></span><div><h2>Start with the idea</h2><p>Describe the post in your own words. Marketeer will build the visual, caption, and hashtags around it.</p></div></div>
        <Field label="What should this post communicate?" hint="The clearer the goal, offer, and audience, the stronger the first draft."><textarea rows="6" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Example: Announce our autumn collection with a calm, editorial feel. Focus on considered materials and invite people to explore the full edit." /></Field>
        <Button variant="soft" icon={fixing ? 'refresh' : 'spark'} disabled={!prompt.trim() || fixing} onClick={fixPromptText}>{fixing ? 'Cleaning it up…' : 'Fix spelling & clarity'}</Button>
        <div className="db-divider" />
        <div className="db-section-heading compact"><span><Icon name="upload" size={18} /></span><div><h2>Add optional assets</h2><p>Tell the designer what each upload represents.</p></div></div>
        <button className="db-dropzone" onClick={() => fileInput.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); upload(event.dataTransfer.files) }}><Icon name="upload" size={23} /><b>Drop brand or product media here</b><small>JPG, PNG, MP4 or MOV · multiple files supported</small></button>
        <input ref={fileInput} type="file" accept="image/*,video/*" multiple hidden onChange={(event) => { upload(event.target.files); event.target.value = '' }} />
        {!!assets.length && <div className="db-upload-list">{assets.map((asset) => <AssetRow key={asset.localId} asset={asset} onChange={(patch) => setAssets((current) => current.map((item) => item.localId === asset.localId ? { ...item, ...patch } : item))} onRemove={() => setAssets((current) => current.filter((item) => item.localId !== asset.localId))} />)}</div>}
      </section>
      <aside className="db-create-settings">
        <section className="db-card"><h3>Format</h3><div className="db-format-picker">{FORMATS.map(([name, body, icon]) => <button className={format === name ? 'active' : ''} onClick={() => setFormat(name)} key={name}><span><Icon name={icon} size={18} /></span><b>{name}</b><small>{body}</small>{format === name && <i><Icon name="check" size={12} /></i>}</button>)}</div></section>
        <section className="db-card"><h3>Publish to</h3><div className="db-channel-picker">{channels.map((channel) => <button disabled={!channel.connected} className={platforms.includes(channel.name) ? 'active' : ''} onClick={() => setPlatforms((current) => current.includes(channel.name) ? current.filter((item) => item !== channel.name) : [...current, channel.name])} key={channel.id}><ChannelLogo platform={channel.name} /><span><b>{channel.name}</b><small>{channel.connected ? channel.handle : 'Connect first'}</small></span>{platforms.includes(channel.name) && <i className="db-channel-check"><Icon name="check" size={12} /></i>}</button>)}</div></section>
        <Button className="full" icon="spark" disabled={!prompt.trim() || !platforms.length || busyAssets} onClick={onGenerate}>{busyAssets ? 'Uploading assets…' : 'Generate content'}</Button>
        <p className="db-safe-note"><Icon name="info" size={14} /> {channels.some((channel) => channel.connected) ? 'Nothing publishes without your approval.' : 'Connect Instagram or Facebook in Connections to choose a channel.'}</p>
      </aside>
    </div>
  )
}

function draftVariant(draft) {
  if (!draft?.id) return null
  return { id: `edit-${draft.id}`, title: draft.title, angle: draft.angle, palette: draft.palette || 'lime', theme: draft.theme || (draft.title || 'POST').toUpperCase(), caption: draft.caption || '', hashtags: draft.hashtags || [], image: draft.image, base_image: draft.base_image, media: draft.media || [], design: draft.design || {} }
}

export function ContentCreate({ notify, onGo, draft = null }) {
  const editing = Boolean(draft?.id)
  const [step, setStep] = useState(editing ? 2 : 0)
  const [postId, setPostId] = useState(editing && draft.status !== 'published' ? draft.id : null)
  const [prompt, setPrompt] = useState(draft?.prompt || '')
  const [format, setFormat] = useState(draft?.format || 'Post')
  // null until the user picks: a new post then defaults to every connected channel.
  const [chosenPlatforms, setChosenPlatforms] = useState(draft?.platforms?.length ? draft.platforms : null)
  const [assets, setAssets] = useState([])
  const [variants, setVariants] = useState([])
  const [progress, setProgress] = useState({ percent: 6, label: 'Designing three directions…' })
  const [selected, setSelected] = useState(() => draftVariant(draft))
  const [caption, setCaption] = useState(draft?.caption || '')
  const [hashtags, setHashtags] = useState(draft?.hashtags || [])
  const [suggestions, setSuggestions] = useState(draft?.hashtags || [])
  const [tone, setTone] = useState('Bold & warm')
  const [generating, setGenerating] = useState(false)
  const [rewriting, setRewriting] = useState(false)
  const [fixing, setFixing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingDesign, setEditingDesign] = useState(false)
  const [scheduleMode, setScheduleMode] = useState('schedule')
  const [date, setDate] = useState(draft?.scheduleDate || (draft?.date && draft.date >= isoDay(new Date()) ? draft.date : tomorrow()))
  const [time, setTime] = useState(draft?.time24 || '18:00')
  const [done, setDone] = useState(null)
  const channels = useResource(getChannels)
  const preferences = useResource(getSettings)
  const knowledge = useResource(getKnowledge)
  const channelList = channels.data || []
  const autoHashtags = Boolean(preferences.data?.ai?.autoHashtags)
  const bestTimes = knowledge.data?.data?.posting?.bestTimes

  const platforms = chosenPlatforms ?? channelList.filter((item) => item.connected).map((item) => item.name)
  const setPlatforms = (update) => setChosenPlatforms((current) => (typeof update === 'function' ? update(current ?? platforms) : update))
  // An edited post gets fresh suggestions to choose from.
  useEffect(() => {
    if (!editing || !draft.caption) return
    suggestHashtags(draft.caption).then((tags) => setSuggestions((current) => [...new Set([...current, ...tags])])).catch(() => {})
  }, [editing, draft])

  const generate = async () => {
    setStep(1); setGenerating(true); setVariants([]); setProgress({ percent: 6, label: 'Reading your brief…' })
    try {
      const result = await generateContent(
        { prompt, format, platforms, assets: assets.filter((asset) => asset.id).map(({ id, role, note }) => ({ id, role, note })) },
        (status) => setProgress({ percent: status.percent, label: status.status === 'running' ? `${status.step_label}…` : 'Ready' }),
      )
      setVariants(result.variants)
      setSuggestions(result.suggested_hashtags || [])
      result.warnings?.forEach((warning) => notify(warning, 'error'))
    } catch (failure) {
      notify(failure.message, 'error')
      setStep(0)
    } finally {
      setGenerating(false)
    }
  }
  const choose = (variant) => {
    setSelected(variant)
    setCaption(variant.caption)
    setHashtags(autoHashtags ? variant.hashtags : [])
    setSuggestions((current) => [...new Set([...variant.hashtags, ...current])])
    setStep(2)
  }
  const rewrite = async () => {
    setRewriting(true)
    try { setCaption(await rewriteCaption(caption, tone, format)); notify('Caption rewritten in your selected tone.') } catch (failure) { notify(failure.message, 'error') } finally { setRewriting(false) }
  }
  const scheduledIso = () => new Date(`${date}T${time}`).toISOString()
  const postBody = (action) => ({
    action, title: selected?.title, caption, hashtags, format, platforms,
    image: selected?.image || null, base_image: selected?.base_image || null, media: selected?.media || [],
    palette: selected?.palette, theme: selected?.theme, design: selected?.design || {}, source: variants.length || draft?.source === 'AI' ? 'AI' : 'Manual',
    prompt, angle: selected?.angle, scheduled_at: action === 'schedule' ? scheduledIso() : undefined,
  })
  const saveDraft = async () => {
    setSaving(true)
    try {
      const saved = await savePost(postBody('draft'), postId)
      setPostId(saved.id)
      notify('Draft saved to the content library.')
    } catch (failure) { notify(failure.message, 'error') } finally { setSaving(false) }
  }
  const commit = async () => {
    setSaving(true)
    try {
      const saved = await savePost(postBody(scheduleMode === 'now' ? 'publish' : 'schedule'), postId)
      setPostId(saved.id)
      if (saved.status === 'failed') { notify(saved.error || 'Publishing failed.', 'error'); return }
      setDone(saved)
      notify(scheduleMode === 'now' ? (saved.status === 'published' ? 'Post published to your selected channels.' : 'Post sent to your selected channels.') : 'Post added to the content calendar.')
    } catch (failure) { notify(failure.message, 'error') } finally { setSaving(false) }
  }
  const reset = () => {
    setStep(0); setPostId(null); setPrompt(''); setAssets([]); setVariants([]); setSelected(null); setCaption(''); setHashtags([]); setSuggestions([]); setDone(null); setScheduleMode('schedule'); setDate(tomorrow()); setTime('18:00')
  }
  const previewVariant = selected || variants[0] || { palette: 'lime', theme: 'YOUR / MESSAGE' }
  const previewImage = selected?.image || assets.find((asset) => asset.id && !asset.type.startsWith('video'))?.url || draft?.image
  const mediaType = selected?.media?.[0]?.type || ''
  const previewProps = { caption, hashtags, platforms, palette: previewVariant.palette, theme: previewVariant.theme, format, imageUrl: mediaType.startsWith('video') ? selected.media[0].url : previewImage, mediaType }
  const tagChoices = [...new Set([...suggestions, ...hashtags])]

  return (
    <div className="db-page db-content-create">
      <PageIntro eyebrow={editing ? 'Edit post' : 'Content studio'} icon="create" title={editing ? `Edit “${draft.title}”.` : step === 0 ? 'Create something worth stopping for.' : 'Create, refine, and share.'} description={editing ? 'Update the caption, creative, and schedule, then send it back to the library.' : 'From a loose brief to channel-ready creative, without losing your point of view.'} actions={step > 1 && !done ? <Button variant="secondary" icon="file" disabled={saving} onClick={saveDraft}>{saving ? 'Saving…' : 'Save draft'}</Button> : null} />
      <ContentStepper step={step} />

      {step === 0 && <BriefStep prompt={prompt} setPrompt={setPrompt} format={format} setFormat={setFormat} platforms={platforms} setPlatforms={setPlatforms} channels={channelList} assets={assets} setAssets={setAssets} onGenerate={generate} fixing={fixing} setFixing={setFixing} notify={notify} />}

      {step === 1 && <section className="db-generation-stage">
        {generating ? <Spinner label={progress.label} progress={progress.percent} detail="Writing from your Knowledge Base and designing a visual for each direction." /> : <>
          <div className="db-center-heading"><Badge tone="blue">{variants.length} distinct direction{variants.length === 1 ? '' : 's'}</Badge><h2>Choose an idea to refine.</h2><p>Each route uses the same brief with a different visual and editorial angle.</p></div>
          <div className="db-variant-grid">{variants.map((variant) => <article className="db-card db-variant-card" key={variant.id}>{variant.image ? <img className="db-variant-photo" src={variant.image} alt="" /> : <CreativeArt palette={variant.palette} theme={variant.theme} compact />}<div><Badge tone="blue">{variant.angle}</Badge><p>{variant.caption}</p><div className="db-inline-tags">{variant.hashtags.map((tag) => <span key={tag}>#{tag}</span>)}</div><div className="db-library-logos">{platforms.map((platform) => <ChannelLogo platform={platform} key={platform} />)}</div><Button className="full" icon="arrow" onClick={() => choose(variant)}>Refine this direction</Button></div></article>)}</div>
          <div className="db-flow-actions"><Button variant="ghost" icon="back" onClick={() => setStep(0)}>Back to brief</Button><Button variant="secondary" icon="refresh" onClick={generate}>Regenerate all</Button></div>
        </>}
      </section>}

      {step === 2 && <div className="db-refine-layout">
        <section className="db-card db-refine-panel">
          <div className="db-section-heading"><span><Icon name="edit" size={18} /></span><div><h2>Refine the story</h2><p>Keep what works and adjust the rest before scheduling.</p></div></div>
          <Field label="Caption"><textarea rows="7" value={caption} maxLength="2200" onChange={(event) => setCaption(event.target.value)} /><small className="db-count">{caption.length} / 2,200</small></Field>
          <div className="db-tone-row"><Field label="Tone"><select value={tone} onChange={(event) => setTone(event.target.value)}>{TONES.map((item) => <option key={item}>{item}</option>)}</select></Field><Button variant="soft" icon="spark" disabled={rewriting || !caption.trim()} onClick={rewrite}>{rewriting ? 'Rewriting…' : 'Rewrite with AI'}</Button></div>
          <Field label="Hashtag suggestions"><div className="db-hashtag-editor">{tagChoices.length ? tagChoices.map((tag) => <button className={hashtags.includes(tag) ? 'active' : ''} onClick={() => setHashtags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])} key={tag}>#{tag}{hashtags.includes(tag) && ' ×'}</button>) : <small>Suggestions appear after generation.</small>}</div></Field>
          <div className="db-creative-edit-row">{previewImage ? <img className="db-edit-shot" src={previewImage} alt="" /> : <CreativeArt palette={previewVariant.palette} theme={previewVariant.theme} compact />}<div><h3>Post creative</h3><p>The image stays with this post. Open the editor if you want a new direction.</p><Button variant="secondary" icon="edit" disabled={!selected} onClick={() => setEditingDesign(true)}>Open creative editor</Button></div></div>
          <div className="db-flow-actions"><Button variant="ghost" icon="back" onClick={() => setStep(editing ? 0 : 1)}>Back</Button><Button icon="arrow" disabled={!caption.trim() && format !== 'Story'} onClick={() => setStep(3)}>Preview & schedule</Button></div>
        </section>
        <aside className="db-sticky-preview"><span className="db-eyebrow">Live preview · {format}</span><SocialPreview {...previewProps} /><p><Icon name="spark" size={14} /> Crops and safe areas adapt per channel.</p></aside>
      </div>}

      {step === 3 && <div className="db-schedule-layout">
        <aside className="db-card db-final-preview"><span className="db-eyebrow">Final preview</span><SocialPreview {...previewProps} /></aside>
        <section className="db-card db-schedule-panel"><span className="db-eyebrow"><Icon name="calendar" size={14} /> Publishing</span><h2>Choose your moment.</h2><p>Publish immediately or add it to the calendar for the right time.</p>
          <div className="db-choice-grid two"><button className={scheduleMode === 'now' ? 'active' : ''} onClick={() => setScheduleMode('now')}><span><Icon name="send" size={18} /></span><b>Publish now</b><small>Send it to every selected channel</small>{scheduleMode === 'now' && <i><Icon name="check" size={13} /></i>}</button><button className={scheduleMode === 'schedule' ? 'active' : ''} onClick={() => setScheduleMode('schedule')}><span><Icon name="calendar" size={18} /></span><b>Schedule for later</b><small>{bestTimes ? `Your audience is most active ${bestTimes}` : 'Pick the time your audience is most active'}</small>{scheduleMode === 'schedule' && <i><Icon name="check" size={13} /></i>}</button></div>
          {scheduleMode === 'schedule' && <><div className="db-form-grid two"><Field label="Date"><input type="date" value={date} min={isoDay(new Date())} onChange={(event) => setDate(event.target.value)} /></Field><Field label="Time"><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></Field></div><div className="db-recommended-times"><b>Recommended:</b>{['10:00', '14:00', '18:00', '21:00'].map((slot) => <button className={time === slot ? 'active' : ''} onClick={() => setTime(slot)} key={slot}>{slot}</button>)}</div></>}
          <div className="db-publish-summary"><div><span>Destinations</span><p>{platforms.map((platform) => <ChannelLogo platform={platform} key={platform} />)}</p></div><div><span>Format</span><b>{format}</b></div><div><span>Timing</span><b>{scheduleMode === 'now' ? 'Now' : `${date} · ${time}`}</b></div></div>
          <div className="db-flow-actions"><Button variant="ghost" icon="back" onClick={() => setStep(2)}>Back to refine</Button><Button icon="arrow" disabled={!platforms.length || (scheduleMode === 'schedule' && new Date(`${date}T${time}`) <= new Date())} onClick={() => setStep(4)}>Review confirmation</Button></div>
        </section>
      </div>}

      {step === 4 && (done ? <section className="db-card db-confirm-card"><img className="db-success-mascot" src="/mascot/marketeer-m-success.png" alt="" /><h2>{scheduleMode === 'now' ? (done.status === 'published' ? 'Your post is live.' : 'Your post is on its way.') : 'Your post is scheduled.'}</h2><p>{scheduleMode === 'now' ? `Publishing to ${platforms.join(', ')}${done.status === 'published' ? ' is complete' : ' now'}.` : `${date} at ${time} · ${platforms.join(', ')}`}</p>{done.error && <p className="db-warning">{done.error}</p>}<div><Button variant="secondary" icon="plus" onClick={reset}>Create another</Button><Button icon="content" onClick={() => onGo('content')}>Open content library</Button></div></section> : <div className="db-confirm-layout"><aside className="db-card db-final-preview"><span className="db-eyebrow">The post</span><SocialPreview {...previewProps} /></aside><section className="db-card db-confirm-card"><span className="db-confirm-icon"><Icon name="send" size={25} /></span><h2>Ready to {scheduleMode === 'now' ? 'publish' : 'schedule'}?</h2><p>{scheduleMode === 'now' ? `This sends the post to ${platforms.length} connected channel${platforms.length === 1 ? '' : 's'} now.` : `This schedules the post for ${date} at ${time}.`} You can still go back and make changes.</p><div className="db-confirm-details"><span><b>{format}</b> format</span><span><b>{platforms.length}</b> destinations</span><span><b>{hashtags.length}</b> hashtags</span></div><div className="db-library-logos db-confirm-logos">{platforms.map((platform) => <ChannelLogo platform={platform} key={platform} />)}</div><div><Button variant="ghost" icon="back" onClick={() => setStep(3)}>Back</Button><Button icon="check" disabled={saving} onClick={commit}>{saving ? (scheduleMode === 'now' ? 'Publishing…' : 'Saving…') : `Confirm & ${scheduleMode === 'now' ? 'publish' : 'schedule'}`}</Button></div></section></div>)}

      {editingDesign && selected && <DesignEditor variant={selected} format={format} onClose={() => setEditingDesign(false)} onSave={(updated) => { setSelected(updated); setVariants((current) => current.map((item) => item.id === updated.id ? updated : item)); setEditingDesign(false); notify('Creative edits applied.') }} />}
    </div>
  )
}

const statusTone = (status) => status === 'published' ? 'lime' : status === 'scheduled' ? 'blue' : status === 'failed' ? 'red' : 'gray'
const channelLogo = (name) => `/social_logos/${String(name).toLowerCase().includes('facebook') ? 'facebook' : 'instagram'}.png`

export function ContentLibrary({ notify, onGo }) {
  const posts = useResource(() => listPosts().then((list) => list.map(toPostRecord)))
  const brand = useBrand()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState(null)
  const [busy, setBusy] = useState('')
  const records = posts.data || []
  const filters = ['all', 'draft', 'scheduled', 'published', 'failed']
  const visible = records.filter((item) => (filter === 'all' || item.status === filter) && `${item.title} ${item.caption}`.toLowerCase().includes(query.toLowerCase()))
  const remove = async (id) => {
    setBusy('delete')
    try { await deletePost(id); posts.setData((current) => current.filter((item) => item.id !== id)); setDetail(null); notify('Post deleted.') } catch (failure) { notify(failure.message, 'error') } finally { setBusy('') }
  }
  const publish = async (id) => {
    setBusy('publish')
    try {
      const updated = toPostRecord(await publishPost(id))
      posts.setData((current) => current.map((item) => item.id === id ? updated : item))
      setDetail(updated)
      notify(updated.status === 'failed' ? (updated.error || 'Publishing failed.') : updated.status === 'published' ? 'Post published.' : 'Publishing started — this can take a minute for video.', updated.status === 'failed' ? 'error' : 'success')
    } catch (failure) { notify(failure.message, 'error') } finally { setBusy('') }
  }
  const edit = (item) => { setDetail(null); onGo('create', item) }
  const refresh = async () => { await posts.reload(); notify('Content library refreshed.') }
  const links = detail ? Object.entries(detail.results || {}).filter(([, result]) => result.permalink) : []
  return (
    <div className="db-page">
      <PageIntro eyebrow="Content library" icon="content" title="Every idea, in one place." description="Review drafts, scheduled posts, and published work across every connected channel." actions={<Button icon="plus" onClick={() => onGo('create')}>Create post</Button>} />
      <div className="db-toolbar db-card"><div className="db-filter-pills">{filters.map((item) => <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}<span>{item === 'all' ? records.length : records.filter((record) => record.status === item).length}</span></button>)}</div><label className="db-toolbar-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search content…" /></label><Button variant="ghost" icon="refresh" disabled={posts.loading} onClick={refresh}>Refresh</Button></div>
      {posts.loading && !posts.data ? <LoadingState label="Loading your content…" /> : posts.error && !posts.data ? <ErrorState error={posts.error} onRetry={posts.reload} /> : visible.length ? <div className="db-content-grid">{visible.map((item) => <article className="db-card db-content-card" key={item.id}>
        <button className="db-content-art" onClick={() => setDetail(item)}>
          {item.image ? <img className="db-library-shot" src={item.image} alt="" /> : <CreativeArt palette={item.palette} theme={item.theme || item.title.toUpperCase()} compact />}
          <Badge tone={statusTone(item.status)}>{item.status}</Badge>
        </button>
        <div className="db-content-card-body">
          <div className="db-content-meta"><span>{item.format}</span><span>·</span><span>{item.source}</span></div>
          <h2>{item.title}</h2>
          <p>{item.caption}</p>
          <div className="db-card-platforms">{item.platforms.map((platform) => <img className="db-channel-logo" src={channelLogo(platform)} alt={platform} key={platform} />)}{item.date && <span><Icon name="clock" size={14} /> {item.date} · {item.time}</span>}</div>
        </div>
        <footer>
          <Button variant="ghost" icon="eye" onClick={() => setDetail(item)}>View</Button>
          <Button variant="ghost" icon="edit" onClick={() => edit(item)}>Edit</Button>
        </footer>
      </article>)}</div> : <EmptyState icon="content" title={records.length ? 'No posts match this view' : 'No posts yet'} body={records.length ? 'Try another status or search phrase.' : 'Create your first post and it will appear here.'} action={records.length ? null : <Button icon="plus" onClick={() => onGo('create')}>Create post</Button>} />}
      {detail && <Modal title={detail.title} onClose={() => setDetail(null)} wide footer={<><Button variant="ghost" icon="trash" disabled={Boolean(busy)} onClick={() => remove(detail.id)}>{busy === 'delete' ? 'Deleting…' : 'Delete'}</Button><Button variant="secondary" icon="edit" onClick={() => edit(detail)}>Edit post</Button>{!['published', 'publishing'].includes(detail.status) && <Button icon="send" disabled={Boolean(busy)} onClick={() => publish(detail.id)}>{busy === 'publish' ? 'Publishing…' : 'Publish now'}</Button>}</>}>
        <div className="db-post-detail">
          <article className="db-library-preview">
            <header>
              <span className="db-preview-avatar">{brand.initials}</span>
              <div><b>{brand.name}</b><small>{detail.format} · {detail.platforms.join(' · ')}</small></div>
              <div className="db-library-logos">{detail.platforms.map((platform) => <img className="db-channel-logo" src={channelLogo(platform)} alt={platform} key={platform} />)}</div>
            </header>
            {detail.image ? <img className="db-library-preview-shot" src={detail.image} alt="" /> : <CreativeArt palette={detail.palette} theme={detail.theme || detail.title.toUpperCase()} />}
            <p><b>{brand.handle}</b> {detail.caption}{detail.hashtags.length ? ` ${detail.hashtags.map((tag) => `#${tag}`).join(' ')}` : ''}</p>
          </article>
          <div>
            <Badge tone={statusTone(detail.status)}>{detail.status}</Badge>
            <h3>Post details</h3>
            <dl>
              <div><dt>Format</dt><dd>{detail.format}</dd></div>
              <div><dt>Created with</dt><dd>{detail.source}</dd></div>
              <div><dt>Publishing</dt><dd>{detail.date ? `${detail.date} · ${detail.time}` : 'Not scheduled'}</dd></div>
              <div><dt>Channels</dt><dd className="db-detail-channels">{detail.platforms.map((platform) => <span key={platform}><img className="db-channel-logo" src={channelLogo(platform)} alt="" />{platform}</span>)}</dd></div>
              {links.length > 0 && <div><dt>Live</dt><dd className="db-detail-channels">{links.map(([platform, result]) => <a key={platform} href={result.permalink} target="_blank" rel="noreferrer">{platform === 'instagram' ? 'Instagram' : 'Facebook'} ↗</a>)}</dd></div>}
              {detail.error && <div><dt>Last error</dt><dd>{detail.error}</dd></div>}
            </dl>
          </div>
        </div>
      </Modal>}
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

const prettyDay = (value) => new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const thisMonth = () => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1) }

export function ContentCalendar({ notify, onGo, adsConnected = false }) {
  const [anchor, setAnchor] = useState(thisMonth)
  const [selected, setSelected] = useState(null)
  const cells = useMemo(() => monthCells(anchor), [anchor])
  const range = useMemo(() => {
    const start = cells[0].date
    const end = new Date(cells[cells.length - 1].date)
    end.setDate(end.getDate() + 1)
    return { from: start.toISOString(), to: end.toISOString() }
  }, [cells])
  const posts = useResource(() => listPosts(range).then((list) => list.map(toPostRecord)), [range])
  const campaignTable = useResource(() => (adsConnected ? getCampaignTable({ datePreset: 'maximum' }).catch(() => null) : Promise.resolve(null)), [adsConnected])
  const liveCampaigns = (campaignTable.data?.rows || []).filter((campaign) => ['active', 'learning'].includes(campaign.status) && campaign.start)
  const currency = campaignTable.data?.currency || 'USD'
  const campaignsOn = (dateKey) => liveCampaigns.filter((campaign) => dateKey >= campaign.start && (!campaign.end || dateKey <= campaign.end))
  const month = anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const move = (amount) => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + amount, 1))
  const campaignOpen = selected?.kind === 'campaign'
  const todayKey = isoDay(new Date())
  useEffect(() => { if (posts.error) notify(posts.error.message, 'error') }, [posts.error, notify])
  return (
    <div className="db-page">
      <PageIntro eyebrow="Content calendar" icon="calendar" title="See the whole story." description="Posts and live campaigns sit on the days they run." actions={<Button icon="plus" onClick={() => onGo('create')}>New post</Button>} />
      <section className="db-calendar db-card">
        <header>
          <div><button onClick={() => move(-1)} aria-label="Previous month"><Icon name="back" size={17} /></button><button onClick={() => setAnchor(thisMonth())}>Today</button><button onClick={() => move(1)} aria-label="Next month"><Icon name="arrow" size={17} /></button></div>
          <h2>{month}{posts.loading ? ' · loading…' : ''}</h2>
          <div className="db-calendar-legend"><span><i className="lime" />Published</span><span><i className="blue" />Scheduled</span><span><i className="campaign" />Live campaign</span></div>
        </header>
        <div className="db-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="db-month-grid">{cells.map(({ date: cellDate, muted }, index) => {
          const dateKey = isoDay(cellDate)
          const events = (posts.data || []).filter((item) => item.date === dateKey)
          const running = muted ? [] : campaignsOn(dateKey)
          return <div className={`db-day ${muted ? 'muted' : ''} ${dateKey === todayKey ? 'today' : ''}`} key={`${dateKey}-${index}`}>
            <span>{cellDate.getDate()}</span>
            {events.map((event) => <button className={`db-cal-post ${event.status}`} onClick={() => setSelected(event)} key={event.id}>
              {event.image ? <img src={event.image} alt="" /> : <CreativeArt compact palette={event.palette} theme={event.theme || event.title.toUpperCase()} />}
              <em><img src={channelLogo(event.platforms[0] || 'Instagram')} alt="" /><span><b>{event.title}</b><small>{event.time}</small></span></em>
            </button>)}
            {running.map((campaign) => <button className="db-cal-live" onClick={() => setSelected({ ...campaign, kind: 'campaign', title: campaign.name })} key={campaign.id}>{campaign.image ? <img src={campaign.image} alt="" /> : <i />}<b>{campaign.name}</b></button>)}
            {!muted && dateKey >= todayKey && <button className="db-day-add" onClick={() => onGo('create', { scheduleDate: dateKey })}><Icon name="plus" size={13} /> Add</button>}
          </div>
        })}</div>
      </section>
      {selected && <Modal title={selected.title || selected.name} onClose={() => setSelected(null)} footer={<><Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>{campaignOpen ? <Button icon="arrow" onClick={() => { setSelected(null); onGo('campaigns') }}>View campaign</Button> : <Button icon="edit" onClick={() => { setSelected(null); onGo('create', selected) }}>Edit post</Button>}</>}>
        <div className="db-calendar-popover">
          {selected.image ? <img className="db-cal-modal-shot" src={selected.image} alt="" /> : <CreativeArt palette={selected.palette} theme={(selected.title || selected.name).toUpperCase().replace(' ', ' / ')} compact />}
          <Badge tone={campaignOpen ? 'blue' : selected.status === 'published' ? 'lime' : selected.status === 'failed' ? 'orange' : 'blue'}>{campaignOpen ? selected.delivery : selected.status}</Badge>
          {campaignOpen ? <p>{prettyDay(selected.start)} – {selected.end ? prettyDay(selected.end) : 'ongoing'} · {money(selected.budget, currency, 0)}/day · {selected.leads} leads</p> : <p>{prettyDay(selected.date)} at {selected.time}{selected.format ? ` · ${selected.format}` : ''}</p>}
          {!campaignOpen && <div>{selected.platforms.map((platform) => <span key={platform}><img src={channelLogo(platform)} alt="" /> {platform}</span>)}</div>}
        </div>
      </Modal>}
    </div>
  )
}
