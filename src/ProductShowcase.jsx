import { useEffect, useRef, useState } from 'react'
import { t, weekdayShort } from './i18n.js'
import { SmallIcon, SocialMark } from './landingIcons.jsx'
import { productTabs, showcasePost, calendarPosts, campaignStats } from './landingMockData.js'

const navigation = [['home', 'Home', 'plan'], ['compass', 'Explore', 'explore'], ['calendar', 'Posts', 'plan'], ['image', 'Media', 'explore'], ['chart', 'Analytics', 'analyze']]

function Composer({ announce }) {
  const [caption, setCaption] = useState(showcasePost.caption)
  const [platform, setPlatform] = useState('instagram')
  const [image, setImage] = useState(showcasePost.image)
  const [previewOpen, setPreviewOpen] = useState(false)
  return <div className={`mk-composer-layout ${previewOpen ? 'mk-preview-open' : ''}`}>
    <button className="mk-mobile-preview-toggle" aria-expanded={previewOpen} onClick={() => setPreviewOpen(!previewOpen)}>{previewOpen ? t('← Back to editor') : t('Post preview →')}</button>
    <div className="mk-composer">
      <div className="mk-editor-top"><button onClick={() => setCaption('')}>{t('⌫ Clear')}</button><span>↗ &nbsp; ×</span></div>
      <span className="mk-editor-label">{t('◇ New collection')}</span>
      <div className="mk-composer-row">
        <div className="mk-channel-rail" aria-label={t('Preview platform')}>{['facebook', 'instagram'].map((name) => <button className={platform === name ? 'selected' : ''} key={name} onClick={() => setPlatform(name)} aria-label={`Preview on ${name}`} aria-pressed={platform === name}><SocialMark platform={name} /></button>)}</div>
        <div className="mk-editor-box">
          <label className="mk-sr" htmlFor="demo-caption">{t('Edit demo post caption')}</label>
          <textarea id="demo-caption" value={caption} onChange={e => setCaption(e.target.value)} />
          <p className="mk-hashtags">{showcasePost.hashtags}</p>
          <div className="mk-editor-tools"><button onClick={() => setCaption(c => `${c}\n\n${showcasePost.hashtags}`)}># Hashtags</button><button onClick={() => { setCaption(t('You have the craft. We have the role.\n\nNew apprenticeship, new shift, new team — told in the language of your region.')); announce(t('Demo caption refreshed with an example AI suggestion.')) }}><SmallIcon name="spark" size={12} /> {t('AI Assist')}</button><span>{caption.length}</span><b>B</b><i>I</i></div>
          <div className="mk-attachments"><img src={image} alt={t('Attached creative')} /><button aria-label={t('Try another demo image')} onClick={() => setImage(image === showcasePost.image ? '/brand/engineer-drawing.jpg' : showcasePost.image)}><SmallIcon name="plus" size={36} /></button></div>
        </div>
      </div>
      <div className="mk-composer-toolbar" aria-hidden="true">{['settings', 'compass', 'image', 'spark', 'chat', 'clock'].map(name => <SmallIcon key={name} name={name} />)}</div>
      <div className="mk-composer-bottom"><span>{t('◇ Bulk options')}</span><button onClick={() => announce('Demo draft saved. No post has been published.')}>{t('Draft')}</button><button className="mk-outline" onClick={() => announce('Publish preview ready. Connect your accounts in the workspace to publish.')}>{t('Publish')}</button><button className="mk-demo-primary" onClick={() => announce('Demo post scheduled for October 14 at 10:00 AM. No live account is connected.')}>{t('Schedule')} <SmallIcon name="clock" size={12} /></button></div>
    </div>
    <aside className="mk-post-preview"><b>{t('Post Preview')}</b><div className="mk-preview-selector"><SocialMark platform={platform} /> {platform} <span>⌄</span></div><div className="mk-demo-profile"><span>{showcasePost.initials}</span><b>{showcasePost.brand}</b><small>•••</small></div><p>{caption.split('\n')[0] || t('Your next great idea starts here.')}</p><p className="mk-hashtags">{showcasePost.hashtags}</p><img className="mk-preview-image" src={image} alt={t('Demo social post preview')} /><div className="mk-post-reactions">♡ &nbsp; ◯ &nbsp; ↗ <span>▱</span></div></aside>
  </div>
}

function Planner({ announce }) {
  const [selected, setSelected] = useState(10)
  return <div className="mk-planner mk-demo-screen"><div className="mk-screen-heading"><div><small>{t('YOUR CONTENT, IN SYNC')}</small><h3>{t('October 2026')}</h3></div><button className="mk-demo-primary" onClick={() => announce(`October ${selected} selected. Open the workspace to add a real post.`)}><SmallIcon name="plus" size={13} /> {t('New post')}</button></div><div className="mk-calendar-toolbar"><span>{t('‹   Today   ›')}</span><span>{t('All accounts ⌄   Month ⌄')}</span></div><div className="mk-demo-calendar">{weekdayShort().map(day => <b key={day}>{day}</b>)}{Array.from({ length: 28 }, (_, i) => {
    const post = calendarPosts.find(p => p.day === i + 1)
    return <button key={i} className={selected === i + 1 ? 'selected' : ''} onClick={() => setSelected(i + 1)} aria-label={`October ${i + 1}${post ? `, ${post.text}` : ''}`}><span>{i + 1}</span>{post && <div><img src={`/brand/${post.file}`} alt="" /><small><SocialMark platform={post.platform} /> {post.text}</small></div>}</button>
  })}</div><div className="mk-screen-foot"><span><i /> {t('6 posts scheduled')}</span><span>{t('Selected: October')} {selected}</span></div></div>
}

const libraryPhotos = ['craft-plasterer', 'engineer-drawing', 'office-review', 'workshop-plans', 'team-outdoor', 'cnc-hands']
const libraryLabels = ['Craftsmanship, close to home.', 'Technical talent, found regionally.', 'A conversation first. Then the right role.', 'From the workshop to the office — we know both worlds.', 'A team that shows up in person.', 'Hands-on roles. Honest matching.']

function Explorer({ announce }) {
  const [filter, setFilter] = useState('All media')
  return <div className="mk-demo-screen"><div className="mk-screen-heading"><div><small>{t('A HOME FOR YOUR IDEAS')}</small><h3>{t('Your creative library')}</h3></div><SmallIcon name="search" /></div><div className="mk-demo-filters">{['All media', 'Images', 'Campaigns'].map(name => <button key={name} className={filter === name ? 'selected' : ''} onClick={() => setFilter(name)}>{t(name)}</button>)}</div><div className="mk-media-grid">{libraryPhotos.map((name, i) => <button key={`${filter}-${name}`} onClick={() => announce(t('Creative selected. Open Create content in the workspace to use your own assets.'))}><img src={`/brand/${name}.jpg`} alt="" /><span>{t(libraryLabels[i])}<SmallIcon name="plus" size={13} /></span></button>)}</div><div className="mk-screen-foot">{t('Your brand assets. Always within reach.')}<span>{t('Demo media library')}</span></div></div>
}

function Collaborator({ announce }) {
  const [approved, setApproved] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState(['Love this direction. Can we make the opening line a little bolder?', 'Updated the caption and added the new creative. Ready for your eyes!'])
  return <div className="mk-demo-screen"><div className="mk-screen-heading"><div><small>{t('BETTER, TOGETHER')}</small><h3>{t('One final look.')}</h3></div><span className="mk-approval-badge">{approved ? t('✓ Approved') : t('● Awaiting review')}</span></div><div className="mk-review-layout"><div className="mk-review-creative"><img src="/brand/office-tablet.jpg" alt={t('Creative awaiting team approval')} /><b>{t('Vacancy · Instagram')}</b><p>{t('A conversation first. Then the right role.')}</p><button className="mk-demo-primary" onClick={() => { setApproved(!approved); announce(approved ? t('Demo approval reset.') : t('Demo creative approved by you.')) }}><SmallIcon name="check" size={14} /> {approved ? t('Approved — undo') : t('Approve creative')}</button></div><div className="mk-comments"><h4>{t('Team conversation')} <span>{comments.length}</span></h4>{comments.map((text, i) => <div className="mk-comment" key={i}><span>{i > 1 ? 'YOU' : i === 0 ? 'JL' : 'AK'}</span><div><b>{i > 1 ? t('You') : i === 0 ? t('Jamie Lee') : t('Alex Kim')} <small>{t('just now')}</small></b><p>{text}</p></div></div>)}<form onSubmit={e => { e.preventDefault(); if (comment.trim()) { setComments([...comments, comment]); setComment('') } }}><input aria-label={t('Demo team comment')} placeholder={t('Leave a little feedback…')} value={comment} onChange={e => setComment(e.target.value)} /><button aria-label={t('Send demo comment')} type="submit">↑</button></form></div></div></div>
}

function Analytics() {
  const [range, setRange] = useState('Last 7 days')
  return <div className="mk-demo-screen"><div className="mk-screen-heading"><div><small>{t('MAKE YOUR NEXT MOVE COUNT')}</small><h3>{t('A clearer picture.')}</h3></div><select aria-label={t('Demo reporting period')} value={range} onChange={e => setRange(e.target.value)}><option value="Last 7 days">{t('Last 7 days')}</option><option value="Last 30 days">{t('Last 30 days')}</option></select></div><div className="mk-demo-stats">{campaignStats.map(([name, value, change]) => <div key={name}><small>{t(name)}</small><strong>{range === 'Last 7 days' ? value : name === 'Leads' ? '324' : name === 'Link clicks' ? '4’862' : name === 'Impressions' ? '182’740' : 'CHF 3.90'}</strong><span>{change} <small>{t('vs previous period')}</small></span></div>)}</div><div className="mk-demo-chart"><div><b>{t('Campaign performance')}</b><span><i /> {t('Leads')} <i /> {t('Link clicks')}</span></div><div className="mk-chart-canvas"><div className="mk-chart-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><svg viewBox="0 0 600 190" preserveAspectRatio="none" role="img" aria-label={`Illustrative campaign growth chart for ${range}`}><defs><linearGradient id="mk-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#b3dc1f" stopOpacity=".25" /><stop offset="1" stopColor="#b3dc1f" stopOpacity="0" /></linearGradient></defs><path d="M0 165 C40 165 45 110 85 120S145 150 185 100S245 135 290 80S355 115 405 60S460 90 505 40S560 45 600 12V190H0Z" fill="url(#mk-chart-fill)" /><path d={range === 'Last 7 days' ? 'M0 165 C40 165 45 110 85 120S145 150 185 100S245 135 290 80S355 115 405 60S460 90 505 40S560 45 600 12' : 'M0 178 C60 178 65 120 130 125S200 100 250 110S350 25 400 60S510 50 600 10'} fill="none" stroke="#b3dc1f" strokeWidth="3" /><path d="M0 180 C65 180 60 155 130 160S225 115 285 135S375 90 420 110S515 75 600 65" fill="none" stroke="#00b2ff" strokeWidth="2" /></svg></div><div className="mk-chart-dates">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}</div></div><div className="mk-screen-foot">{t('Meta recruitment · Autumn campaign')} <span>{t('Illustrative data')}</span></div></div>
}

export default function ProductShowcase({ navigate }) {
  const [active, setActive] = useState('plan')
  const [notice, setNotice] = useState('')
  const showcaseRef = useRef(null)
  const timerRef = useRef(null)
  const startedRef = useRef(false)
  const current = productTabs.find(tab => tab.id === active)
  useEffect(() => {
    const element = showcaseRef.current
    if (!element) return undefined
    const start = () => {
      if (startedRef.current) return
      startedRef.current = true
      setActive('plan')
      timerRef.current = window.setInterval(() => {
        setActive((currentId) => {
          const index = productTabs.findIndex(tab => tab.id === currentId)
          return productTabs[(index + 1) % productTabs.length].id
        })
        setNotice('')
      }, 4200)
    }
    if (!('IntersectionObserver' in window)) {
      start()
      return () => window.clearInterval(timerRef.current)
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        start()
        observer.disconnect()
      }
    }, { threshold: 0.2 })
    observer.observe(element)
    return () => {
      observer.disconnect()
      window.clearInterval(timerRef.current)
    }
  }, [])
  const selectTab = (id) => { setActive(id); setNotice('') }
  const keyboardTabs = e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const index = productTabs.findIndex(tab => tab.id === active)
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? 4 : (index + (e.key === 'ArrowRight' ? 1 : -1) + 5) % 5
    selectTab(productTabs[next].id)
    document.getElementById(`showcase-tab-${productTabs[next].id}`)?.focus()
  }
  return <section ref={showcaseRef} className="mk-product" id="platform">
    <div className="mk-section-title" data-enter><span className="mk-overline">{t('LESS BUSYWORK. MORE POSSIBILITY.')}</span><h2>{t('Your whole social world.')}<br />{t('Finally, in one place.')}</h2><p>{t('From the first idea to the next big result.')}<br />{t('Meet your new everyday workspace.')}</p></div>
    <div className="mk-product-tabs" role="tablist" aria-label={t('Explore the Marketeer workspace')} onKeyDown={keyboardTabs}>{productTabs.map(tab => <button type="button" key={tab.id} id={`showcase-tab-${tab.id}`} role="tab" aria-selected={active === tab.id} aria-controls="showcase-panel" tabIndex={active === tab.id ? 0 : -1} onClick={() => selectTab(tab.id)}>{t(tab.label)}</button>)}</div>
    <div className="mk-product-scroll"><div className="mk-product-app">
      <aside className="mk-demo-sidebar"><div className="mk-demo-brand">marketeer<span>.</span></div><button className="mk-demo-create" onClick={() => selectTab('schedule')}><SmallIcon name="plus" size={16} /> {t('Create')} <small>{t('⇧ N')}</small></button><nav aria-label={t('Demo workspace')}>{navigation.map(([icon, text, id]) => <button key={text} onClick={() => selectTab(id)} className={active === id ? 'active' : ''}><SmallIcon name={icon} size={14} />{t(text)}</button>)}</nav><div className="mk-demo-workspace"><span>PS</span><b>PS Schwyz</b><SmallIcon name="settings" size={12} /></div><button onClick={() => navigate('signup')}><SmallIcon name="grid" size={14} /> {t('Social accounts')}</button><button onClick={() => selectTab('collaborate')}><SmallIcon name="people" size={14} /> {t('Members')}</button><small className="mk-demo-label">{t('INTERACTIVE DEMO')}</small></aside>
      <div className="mk-product-panel" id="showcase-panel" role="tabpanel" aria-labelledby={`showcase-tab-${active}`} tabIndex={0}><div className="mk-panel-transition" key={active}>{active === 'schedule' ? <Composer announce={setNotice} /> : active === 'plan' ? <Planner announce={setNotice} /> : active === 'explore' ? <Explorer announce={setNotice} /> : active === 'collaborate' ? <Collaborator announce={setNotice} /> : <Analytics />}</div>{notice && <div className="mk-demo-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label={t('Dismiss notice')}>×</button></div>}</div>
    </div></div>
    <div className="mk-product-caption" aria-live="polite"><h3>{t(current.title)}</h3><p>{t(current.description)}</p></div>
  </section>
}
