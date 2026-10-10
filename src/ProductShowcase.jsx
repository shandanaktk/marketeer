import { useState } from 'react'
import { SmallIcon, SocialMark } from './landingIcons.jsx'
import { productTabs, showcasePost, calendarPosts, campaignStats } from './landingMockData.js'

const navigation = [['home', 'Home', 'plan'], ['compass', 'Explore', 'explore'], ['calendar', 'Posts', 'plan'], ['image', 'Media', 'explore'], ['chart', 'Analytics', 'analyze']]

function Composer({ announce }) {
  const [caption, setCaption] = useState(showcasePost.caption)
  const [platform, setPlatform] = useState('instagram')
  const [image, setImage] = useState(showcasePost.image)
  const [previewOpen, setPreviewOpen] = useState(false)
  return <div className={`mk-composer-layout ${previewOpen ? 'mk-preview-open' : ''}`}>
    <button className="mk-mobile-preview-toggle" aria-expanded={previewOpen} onClick={() => setPreviewOpen(!previewOpen)}>{previewOpen ? '← Back to editor' : 'Post preview →'}</button>
    <div className="mk-composer">
      <div className="mk-editor-top"><button onClick={() => setCaption('')}>⌫ Clear</button><span>↗ &nbsp; ×</span></div>
      <span className="mk-editor-label">◇ New collection</span>
      <div className="mk-composer-row">
        <div className="mk-channel-rail" aria-label="Preview platform">{['facebook', 'instagram'].map((name) => <button className={platform === name ? 'selected' : ''} key={name} onClick={() => setPlatform(name)} aria-label={`Preview on ${name}`} aria-pressed={platform === name}><SocialMark platform={name} /></button>)}</div>
        <div className="mk-editor-box">
          <label className="mk-sr" htmlFor="demo-caption">Edit demo post caption</label>
          <textarea id="demo-caption" value={caption} onChange={e => setCaption(e.target.value)} />
          <p className="mk-hashtags">{showcasePost.hashtags}</p>
          <div className="mk-editor-tools"><button onClick={() => setCaption(c => `${c}\n\n${showcasePost.hashtags}`)}># Hashtags</button><button onClick={() => { setCaption('Good design starts with a fresh perspective.\n\nDiscover our latest collection — made for bold ideas and everyday inspiration. What will you create next?'); announce('Demo caption refreshed with an example AI suggestion.') }}><SmallIcon name="spark" size={12} /> AI Assist</button><span>{caption.length}</span><b>B</b><i>I</i></div>
          <div className="mk-attachments"><img src={image} alt="Attached creative" /><button aria-label="Try another demo image" onClick={() => setImage(image === showcasePost.image ? '/reference/project-6.webp' : showcasePost.image)}><SmallIcon name="plus" size={36} /></button></div>
        </div>
      </div>
      <div className="mk-composer-toolbar" aria-hidden="true">{['settings', 'compass', 'image', 'spark', 'chat', 'clock'].map(name => <SmallIcon key={name} name={name} />)}</div>
      <div className="mk-composer-bottom"><span>◇ Bulk options</span><button onClick={() => announce('Demo draft saved. No post has been published.')}>Draft</button><button className="mk-outline" onClick={() => announce('Publish preview ready. Connect your accounts in the workspace to publish.')}>Publish</button><button className="mk-demo-primary" onClick={() => announce('Demo post scheduled for October 14 at 10:00 AM. No live account is connected.')}>Schedule <SmallIcon name="clock" size={12} /></button></div>
    </div>
    <aside className="mk-post-preview"><b>Post Preview</b><div className="mk-preview-selector"><SocialMark platform={platform} /> {platform} <span>⌄</span></div><div className="mk-demo-profile"><span>{showcasePost.initials}</span><b>{showcasePost.brand}</b><small>•••</small></div><p>{caption.split('\n')[0] || 'Your next great idea starts here.'}</p><p className="mk-hashtags">#MadeToCreate #FormStudio</p><img className="mk-preview-image" src={image} alt="Demo social post preview" /><div className="mk-post-reactions">♡ &nbsp; ◯ &nbsp; ↗ <span>▱</span></div></aside>
  </div>
}

function Planner({ announce }) {
  const [selected, setSelected] = useState(10)
  return <div className="mk-planner mk-demo-screen"><div className="mk-screen-heading"><div><small>YOUR CONTENT, IN SYNC</small><h3>October 2026</h3></div><button className="mk-demo-primary" onClick={() => announce(`October ${selected} selected. Open the workspace to add a real post.`)}><SmallIcon name="plus" size={13} /> New post</button></div><div className="mk-calendar-toolbar"><span>‹ &nbsp; Today &nbsp; ›</span><span>All accounts ⌄ &nbsp; Month ⌄</span></div><div className="mk-demo-calendar">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => <b key={day}>{day}</b>)}{Array.from({ length: 28 }, (_, i) => {
    const post = calendarPosts.find(p => p.day === i + 1)
    return <button key={i} className={selected === i + 1 ? 'selected' : ''} onClick={() => setSelected(i + 1)} aria-label={`October ${i + 1}${post ? `, ${post.text}` : ''}`}><span>{i + 1}</span>{post && <div><img src={`/reference/${post.file}`} alt="" /><small><SocialMark platform={post.platform} /> {post.text}</small></div>}</button>
  })}</div><div className="mk-screen-foot"><span><i /> 6 posts scheduled</span><span>Selected: October {selected}</span></div></div>
}

function Explorer({ announce }) {
  const [filter, setFilter] = useState('All media')
  return <div className="mk-demo-screen"><div className="mk-screen-heading"><div><small>A HOME FOR YOUR IDEAS</small><h3>Your creative library</h3></div><SmallIcon name="search" /></div><div className="mk-demo-filters">{['All media', 'Images', 'Campaigns'].map(name => <button key={name} className={filter === name ? 'selected' : ''} onClick={() => setFilter(name)}>{name}</button>)}</div><div className="mk-media-grid">{Array.from({ length: 6 }, (_, i) => <button key={`${filter}-${i}`} onClick={() => announce('Creative selected. Open Create content in the workspace to use your own assets.')}><img src={`/reference/${filter === 'Campaigns' ? 'project' : 'work'}-${i + 1}.webp`} alt={`Example ${filter.toLowerCase()} creative ${i + 1}`} /><span>{['A fresh perspective', 'Made for the moment', 'The new collection', 'Less, but better', 'An everyday original', 'Make something good'][i]}<SmallIcon name="plus" size={13} /></span></button>)}</div><div className="mk-screen-foot">Your brand assets. Always within reach.<span>Demo media library</span></div></div>
}

function Collaborator({ announce }) {
  const [approved, setApproved] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState(['Love this direction. Can we make the opening line a little bolder?', 'Updated the caption and added the new creative. Ready for your eyes!'])
  return <div className="mk-demo-screen"><div className="mk-screen-heading"><div><small>BETTER, TOGETHER</small><h3>One final look.</h3></div><span className="mk-approval-badge">{approved ? '✓ Approved' : '● Awaiting review'}</span></div><div className="mk-review-layout"><div className="mk-review-creative"><img src="/reference/project-6.webp" alt="Creative awaiting team approval" /><b>New collection · Instagram</b><p>A fresh perspective, made for your feed.</p><button className="mk-demo-primary" onClick={() => { setApproved(!approved); announce(approved ? 'Demo approval reset.' : 'Demo creative approved by you.') }}><SmallIcon name="check" size={14} /> {approved ? 'Approved — undo' : 'Approve creative'}</button></div><div className="mk-comments"><h4>Team conversation <span>{comments.length}</span></h4>{comments.map((text, i) => <div className="mk-comment" key={i}><span>{i > 1 ? 'YOU' : i === 0 ? 'JL' : 'AK'}</span><div><b>{i > 1 ? 'You' : i === 0 ? 'Jamie Lee' : 'Alex Kim'} <small>just now</small></b><p>{text}</p></div></div>)}<form onSubmit={e => { e.preventDefault(); if (comment.trim()) { setComments([...comments, comment]); setComment('') } }}><input aria-label="Demo team comment" placeholder="Leave a little feedback…" value={comment} onChange={e => setComment(e.target.value)} /><button aria-label="Send demo comment" type="submit">↑</button></form></div></div></div>
}

function Analytics() {
  const [range, setRange] = useState('Last 7 days')
  return <div className="mk-demo-screen"><div className="mk-screen-heading"><div><small>MAKE YOUR NEXT MOVE COUNT</small><h3>A clearer picture.</h3></div><select aria-label="Demo reporting period" value={range} onChange={e => setRange(e.target.value)}><option>Last 7 days</option><option>Last 30 days</option></select></div><div className="mk-demo-stats">{campaignStats.map(([name, value, change]) => <div key={name}><small>{name}</small><strong>{range === 'Last 7 days' ? value : name === 'Leads' ? '324' : name === 'Link clicks' ? '4,862' : name === 'Impressions' ? '182,740' : '$4.12'}</strong><span>{change} <small>vs previous period</small></span></div>)}</div><div className="mk-demo-chart"><div><b>Campaign performance</b><span><i /> Leads &nbsp; <i /> Link clicks</span></div><div className="mk-chart-canvas"><div className="mk-chart-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><svg viewBox="0 0 600 190" preserveAspectRatio="none" role="img" aria-label={`Illustrative campaign growth chart for ${range}`}><defs><linearGradient id="mk-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#898f65" stopOpacity=".25" /><stop offset="1" stopColor="#898f65" stopOpacity="0" /></linearGradient></defs><path d="M0 165 C40 165 45 110 85 120S145 150 185 100S245 135 290 80S355 115 405 60S460 90 505 40S560 45 600 12V190H0Z" fill="url(#mk-chart-fill)" /><path d={range === 'Last 7 days' ? 'M0 165 C40 165 45 110 85 120S145 150 185 100S245 135 290 80S355 115 405 60S460 90 505 40S560 45 600 12' : 'M0 178 C60 178 65 120 130 125S200 100 250 110S350 25 400 60S510 50 600 10'} fill="none" stroke="#898f65" strokeWidth="3" /><path d="M0 180 C65 180 60 155 130 160S225 115 285 135S375 90 420 110S515 75 600 65" fill="none" stroke="#e47e3d" strokeWidth="2" /></svg></div><div className="mk-chart-dates">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}</div></div><div className="mk-screen-foot">Meta recruitment · Autumn campaign <span>Illustrative data</span></div></div>
}

export default function ProductShowcase({ navigate }) {
  const [active, setActive] = useState('schedule')
  const [notice, setNotice] = useState('')
  const current = productTabs.find(tab => tab.id === active)
  const selectTab = (id) => { setActive(id); setNotice('') }
  const keyboardTabs = e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const index = productTabs.findIndex(tab => tab.id === active)
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? 4 : (index + (e.key === 'ArrowRight' ? 1 : -1) + 5) % 5
    selectTab(productTabs[next].id)
    document.getElementById(`showcase-tab-${productTabs[next].id}`)?.focus()
  }
  return <section className="mk-product" id="platform">
    <div className="mk-section-title" data-enter><span className="mk-overline">LESS BUSYWORK. MORE POSSIBILITY.</span><h2>Your whole social world.<br />Finally, in one place.</h2><p>From the first idea to the next big result.<br />Meet your new everyday workspace.</p></div>
    <div className="mk-product-tabs" role="tablist" aria-label="Explore the Marketeer workspace" onKeyDown={keyboardTabs}>{productTabs.map(tab => <button type="button" key={tab.id} id={`showcase-tab-${tab.id}`} role="tab" aria-selected={active === tab.id} aria-controls="showcase-panel" tabIndex={active === tab.id ? 0 : -1} onClick={() => selectTab(tab.id)}>{tab.label}</button>)}</div>
    <div className="mk-product-scroll"><div className="mk-product-app">
      <aside className="mk-demo-sidebar"><div className="mk-demo-brand">marketeer<span>↗</span></div><button className="mk-demo-create" onClick={() => selectTab('schedule')}><SmallIcon name="plus" size={16} /> Create <small>⇧ N</small></button><nav aria-label="Demo workspace">{navigation.map(([icon, text, id]) => <button key={text} onClick={() => selectTab(id)} className={active === id ? 'active' : ''}><SmallIcon name={icon} size={14} />{text}</button>)}</nav><div className="mk-demo-workspace"><span>FS</span><b>Form Studio</b><SmallIcon name="settings" size={12} /></div><button onClick={() => navigate('signup')}><SmallIcon name="grid" size={14} /> Social accounts</button><button onClick={() => selectTab('collaborate')}><SmallIcon name="people" size={14} /> Members</button><small className="mk-demo-label">INTERACTIVE DEMO</small></aside>
      <div className="mk-product-panel" id="showcase-panel" role="tabpanel" aria-labelledby={`showcase-tab-${active}`} tabIndex={0}><div className="mk-panel-transition" key={active}>{active === 'schedule' ? <Composer announce={setNotice} /> : active === 'plan' ? <Planner announce={setNotice} /> : active === 'explore' ? <Explorer announce={setNotice} /> : active === 'collaborate' ? <Collaborator announce={setNotice} /> : <Analytics />}</div>{notice && <div className="mk-demo-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notice">×</button></div>}</div>
    </div></div>
    <div className="mk-product-caption" aria-live="polite"><h3>{current.title}</h3><p>{current.description}</p></div>
  </section>
}
