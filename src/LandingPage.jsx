import { useEffect, useRef, useState } from 'react'
import { ThemeButton } from './theme.jsx'
import { Arrow, SocialMark } from './landingIcons.jsx'
import { heroArtwork, workflowSteps } from './landingMockData.js'
import ProductShowcase from './ProductShowcase.jsx'

function Wordmark() { return <span className="mk-wordmark">marketeer<span>↗</span></span> }

function Nav({ navigate, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false)
  return <header className="mk-nav">
    <a href="#top" aria-label="Marketeer home" onClick={() => setOpen(false)}><Wordmark /></a>
    <nav className={open ? 'mk-nav-links open' : 'mk-nav-links'} aria-label="Main navigation">{[['Platform', 'platform'], ['Content', 'content'], ['Meta ads', 'meta'], ['How it works', 'how'], ['Connect', 'connect']].map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>)}</nav>
    <div className="mk-nav-actions"><ThemeButton theme={theme} onToggle={onToggleTheme} /><button className="mk-button mk-nav-signup" onClick={() => navigate('signup')}>Sign up <Arrow /></button><button className="mk-login" onClick={() => navigate('signin')}>Login</button><button className="mk-menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '×' : '☰'}</button></div>
  </header>
}

function Hero({ navigate }) {
  return <section className="mk-hero" id="top">
    <div className="mk-hero-grid" aria-hidden="true" />
    <div className="mk-hero-art" aria-hidden="true">{heroArtwork.map((art, index) => <div key={art.file} className={`mk-float mk-float-${index}`} style={{ left: `${art.x}%`, top: `${art.y}%`, width: `${art.w}%`, aspectRatio: art.aspect, '--dx': `${art.dx}px`, '--dy': `${art.dy}px`, '--delay': `${index * 45}ms` }}><img src={`/reference/${art.file}`} alt="" fetchPriority={index === 0 ? 'high' : 'auto'} /></div>)}</div>
    <div className="mk-hero-copy"><p className="mk-hero-eyebrow">AI SOCIAL CONTENT & META ADS FOR</p><h1><span><b>Creators</b></span><span><b>Marketers</b></span><span className="mk-headline-highlight"><b>Go-getters</b></span></h1><p className="mk-hero-description">Make great content, launch smarter ads,<br />and get back to what you do best.</p><button className="mk-button mk-button-orange" onClick={() => navigate('signup')}>Make your next move <Arrow /></button></div>
  </section>
}

function Marquee() {
  return <div className="mk-marquee" aria-label="For creators, brands, agencies, and go-getters"><div className="mk-marquee-track" aria-hidden="true">{[0, 1, 2, 3].map(i => <div className="mk-marquee-group" key={i}>{['Creators', 'Brands', 'Agencies', 'Go-getters'].map(word => <span key={word}>{word}<i>✣</i></span>)}</div>)}</div></div>
}

const feedPosts = [
  { platform: 'instagram', name: 'atelier.north', place: 'Copenhagen', avatar: '/reference/avatar-victoria.webp', image: '/social-posts/post-atelier.jpg', likes: '2,418', comments: '86', time: '2 hours ago', caption: 'Quiet forms, made to last.', tag: '#newcollection', verified: true },
  { platform: 'facebook', name: 'Maison Sol', time: '2h', avatar: '/reference/avatar-shelby.webp', image: '/social-posts/post-maison.jpg', caption: 'A softer light. The evening fragrance, now in the studio.', reactions: '1.2K', comments: '84' },
  { platform: 'instagram', name: 'lumen.studio', place: 'Lisbon', avatar: '/reference/avatar-thomas.webp', image: '/social-posts/post-lumen.jpg', likes: '3,902', comments: '41', time: '5 hours ago', caption: 'Rooms that hold the afternoon.', tag: '#lumenstudio' },
  { platform: 'facebook', name: 'Coastline', time: '5h', avatar: '/reference/avatar-ilja.webp', image: '/social-posts/post-coast.jpg', caption: 'One chair. One view. The kind of evening you plan the year around.', reactions: '4.8K', comments: '216' },
  { platform: 'instagram', name: 'form.studio', place: 'Milan', avatar: '/reference/avatar-ross.webp', image: '/social-posts/post-form.jpg', likes: '8,114', comments: '132', time: '1 day ago', caption: 'Tailored for the long way home.', tag: '#formstudio', verified: true },
  { platform: 'facebook', name: 'Table Twelve', time: '1d', avatar: '/reference/avatar-benjamin.webp', image: '/social-posts/post-table.jpg', caption: 'Tonight’s table, set before the room fills.', reactions: '986', comments: '54' },
]

function FeedIcon({ name }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (name === 'heart') return <svg {...common}><path d="M12 20s-7-4.35-9.2-8.2C1.2 9.2 2.4 6 5.5 5.2 7.4 4.7 9.2 5.4 12 8c2.8-2.6 4.6-3.3 6.5-2.8 3.1.8 4.3 4 2.7 6.6C19 15.65 12 20 12 20z" /></svg>
  if (name === 'comment') return <svg {...common}><path d="M6 6.5h12a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H9.2L6 18.5V6.5z" /></svg>
  if (name === 'send') return <svg {...common}><path d="M4.5 12 19 5.5 14 19l-2.2-5.2L4.5 12z" /></svg>
  if (name === 'bookmark') return <svg {...common}><path d="M7 4.5h10v15l-5-3-5 3v-15z" /></svg>
  if (name === 'like') return <svg {...common}><path d="M8 11v8H4.5v-8zM8 18.5h8.2a1.8 1.8 0 0 0 1.8-1.5l.8-4.6a1.7 1.7 0 0 0-1.7-2H13l.5-2.8A1.7 1.7 0 0 0 11.9 6L8 10.2" /></svg>
  if (name === 'share') return <svg {...common}><circle cx="7" cy="12" r="2.2" /><circle cx="17" cy="7" r="2.2" /><circle cx="17" cy="17" r="2.2" /><path d="m9 11 6-3M9 13l6 3" /></svg>
  return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M4 12h16M12 4c2.2 2.2 3.2 5 3.2 8s-1 5.8-3.2 8c-2.2-2.2-3.2-5-3.2-8s1-5.8 3.2-8z" /></svg>
}

function IgIcon({ name }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (name === 'heart') return <svg {...common}><path d="M12 20.2s-6.7-4.2-8.8-8.1C1.6 9.6 2.7 6.2 5.8 5.5c1.8-.4 3.4.3 4.7 2 .4.5.8.9 1.5.9s1.1-.4 1.5-.9c1.3-1.7 2.9-2.4 4.7-2 3.1.7 4.2 4.1 2.6 6.6-2.1 3.9-8.8 8.1-8.8 8.1z" /></svg>
  if (name === 'comment') return <svg {...common}><path d="M12 20.5a8.5 8.5 0 1 0-3.7-.8L4.5 21l1.4-3.5A8.5 8.5 0 0 0 12 20.5z" /></svg>
  if (name === 'send') return <svg {...common}><path d="M21.5 3.5 10.8 14.2" /><path d="M21.5 3.5 14.8 20.2l-4-6-6-4 16.7-6.7z" /></svg>
  if (name === 'bookmark') return <svg {...common}><path d="M7 4.2h10a1 1 0 0 1 1 1V20l-6-3.4L6 20V5.2a1 1 0 0 1 1-1z" /></svg>
  if (name === 'verified') return <svg className="mk-ig-verified" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#0095f6" /><path d="m7.5 12.2 3 3 6-6.4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
  return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.6" fill="currentColor" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /><circle cx="19" cy="12" r="1.6" fill="currentColor" /></svg>
}

function FeedCard({ post }) {
  const instagram = post.platform === 'instagram'
  return <article className={`mk-feed-card mk-feed-${post.platform}`}>
    <header>
      {instagram ? <span className="mk-ig-avatar"><img src={post.avatar} alt="" /></span> : <img src={post.avatar} alt="" />}
      <p><b>{post.name}{instagram && post.verified ? <IgIcon name="verified" /> : null}</b><small>{instagram ? post.place : `${post.time} · Public`}</small></p>
      {instagram ? <IgIcon name="more" /> : <FeedIcon name="globe" />}
    </header>
    <img className="mk-feed-photo" src={post.image} alt="" />
    <div className="mk-feed-foot">
      {instagram
        ? <div className="mk-feed-actions mk-ig-actions"><span><IgIcon name="heart" /><IgIcon name="comment" /><IgIcon name="send" /></span><IgIcon name="bookmark" /></div>
        : <div className="mk-feed-actions mk-feed-fb-actions"><span><FeedIcon name="like" /> Like</span><span><FeedIcon name="comment" /> Comment</span><span><FeedIcon name="share" /> Share</span></div>}
      <p className="mk-feed-caption">{instagram ? <><b>{post.name}</b> {post.caption} <span>{post.tag}</span></> : post.caption}</p>
      <small>{instagram ? `${post.likes} likes · ${post.comments} comments` : <><span className="mk-feed-pills" aria-hidden="true"><i /><i /><i /></span>{post.reactions} · {post.comments} comments</>}</small>
    </div>
  </article>
}

function Statement({ navigate }) {
  return <section className="mk-statement" id="content">
    <div className="mk-statement-copy" data-enter><h2>A social presence<br />that doesn’t<br /><em>take over your life.</em></h2><p>Content that sounds like you. Campaigns that know your goals. Everything in one place, with you in control.</p><strong>Less tab-hopping. More making things happen.</strong><button className="mk-button mk-button-cream" onClick={() => navigate('signup')}>Meet your new studio <Arrow /></button></div>
    <div className="mk-post-rail" aria-label="Instagram and Facebook post previews">
      <div className="mk-post-rail-track">{[0, 1].map(copy => <div className="mk-post-rail-set" key={copy} aria-hidden={copy === 1 || undefined}>{feedPosts.map(post => <FeedCard key={`${copy}-${post.name}`} post={post} />)}</div>)}</div>
    </div>
    <div className="mk-giant-word" aria-hidden="true"><span>MARKETEER</span><span>MARKETEER</span></div>
  </section>
}

function Gallery({ navigate }) {
  return <section className="mk-gallery-section"><div className="mk-gallery-layout"><div className="mk-gallery-window" aria-label="Creative inspiration from the visual reference"><div className="mk-gallery-grid">{[0, 1, 2].map(col => <div className="mk-gallery-col" key={col}>{Array.from({ length: 5 }, (_, i) => <img key={i} src={`/reference/work-${col * 4 + i + 1}.webp`} loading="lazy" alt="Reference creative inspiration" />)}</div>)}</div></div><div className="mk-gallery-copy" data-enter><span className="mk-overline">FROM A SPARK TO A SCROLL-STOPPER</span><h2>Look at all the<br />things you could make.</h2><p>Turn your ideas into captions, visuals, and campaigns. Bring your brand voice, choose your channels, and give your next great idea a place to go.</p><button className="mk-text-button" onClick={() => navigate('signup')}>Find your creative flow <Arrow /></button><small>Visual inspiration · Reference artwork</small></div></div></section>
}

function Connections({ navigate }) {
  const columns = [['instagram', 'facebook', 'instagram', 'facebook', 'instagram'], ['facebook', 'instagram', 'facebook', 'instagram', 'facebook'], ['instagram', 'facebook', 'instagram', 'facebook', 'instagram']]
  return <section className="mk-connections" id="connect"><div className="mk-connect-inner"><div className="mk-connect-copy" data-enter><h2>Bring your<br />whole world.</h2><p>Your content. Your campaigns. Your people.<br />A little less scattered. A lot more connected.</p><p>Connect your social accounts and give every brand a home. Plan together, review together, and keep your work moving in the same direction.</p><button className="mk-button" onClick={() => navigate('signup')}>Build your workspace <Arrow /></button></div><div className="mk-logo-wall" aria-label="Social platform ecosystem">{columns.map((col, i) => <div className={`mk-logo-column mk-logo-column-${i}`} key={i}><div>{[0, 1].map(set => <div className="mk-logo-set" key={set} aria-hidden={set === 1}>{col.map((name, index) => <div className={`mk-logo-tile mk-tile-${name}`} key={`${name}-${index}`}><SocialMark platform={name} /></div>)}</div>)}</div></div>)}</div></div></section>
}

function MetaSection({ navigate }) {
  return <section className="mk-meta" id="meta"><div className="mk-meta-inner"><div className="mk-meta-copy" data-enter><span className="mk-overline">YOUR NEXT GREAT HIRE STARTS HERE</span><h2>Big opportunities.<br />Small to-do list.</h2><p>Turn a vacancy into a complete Meta campaign. Creative, copy, lead forms, and targeting, all connected to the role you need to fill.</p><p>Set your budget. Review your campaign. Track every lead. You stay in charge of what goes live.</p><button className="mk-button" onClick={() => navigate('signup')}>Explore Meta campaigns <Arrow /></button></div><div className="mk-campaign-stack" data-enter><div className="mk-campaign-back"><SocialMark platform="meta" /><span>CAMPAIGN STUDIO</span><b>Good people.<br />Great possibilities.</b></div><div className="mk-campaign-front"><div><span className="mk-campaign-avatar">M↗</span><p><b>Your next chapter</b><small>Sponsored · Demo preview</small></p><span>•••</span></div><div className="mk-job-art"><small>WE’RE MAKING ROOM FOR YOU.</small><strong>Good work.<br />Great people.<br /><em>Your move.</em></strong><span>JOIN THE TEAM ↗</span></div><footer><div><small>YOUR BRAND · CAREERS</small><b>Find where you belong.</b></div><button onClick={() => navigate('signup')}>Learn more ↗</button></footer></div><div className="mk-campaign-status"><i /> Ready for your review <span>✓</span></div></div></div></section>
}

function HowItWorks() {
  const [open, setOpen] = useState(0)
  return <section className="mk-how" id="how"><div className="mk-how-heading" data-enter><span className="mk-overline">A LITTLE SETUP. A WHOLE LOT OF GO.</span><h2>Find your flow.</h2><p>From “where do I start?”<br />to “look what I made.”</p></div><div className="mk-workflow">{workflowSteps.map(([title, description], i) => <div className={`mk-workflow-item ${open === i ? 'open' : ''}`} key={title}><button aria-expanded={open === i} aria-controls={`workflow-${i}`} onClick={() => setOpen(open === i ? -1 : i)}><span>0{i + 1}</span><h3>{title}</h3><b>{open === i ? '−' : '+'}</b></button><div id={`workflow-${i}`} hidden={open !== i}><p>{description}</p></div></div>)}</div></section>
}

export default function LandingPage({ navigate, theme, onToggleTheme }) {
  const root = useRef(null)
  const [loading, setLoading] = useState(true)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    let live = true
    const timer = setTimeout(() => { if (live) setLoading(false) }, 1150)
    return () => { live = false; clearTimeout(timer) }
  }, [])
  useEffect(() => {
    if (loading) return
    const target = document.getElementById(window.location.hash.slice(1))
    if (target) target.scrollIntoView({ behavior: 'instant' })
  }, [loading])
  useEffect(() => {
    const element = root.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('mk-entered', entry.isIntersecting)), { threshold: .12 })
    element.querySelectorAll('[data-enter]').forEach(item => observer.observe(item))
    let frame = 0
    let current = window.scrollY
    const update = () => {
      const target = window.scrollY
      current += (target - current) * .095
      if (Math.abs(target - current) < .1) current = target
      const motion = !reduce.matches && !paused
      const heroHeight = element.querySelector('.mk-hero').offsetHeight
      const progress = motion ? Math.min(current / (heroHeight * .8), 1) : 0
      element.style.setProperty('--hero-progress', progress.toFixed(4))
      const gallery = element.querySelector('.mk-gallery-window')
      const offset = motion ? Math.max(-70, Math.min(70, (gallery.getBoundingClientRect().top - window.innerHeight / 2) * .12)) : 0
      gallery.style.setProperty('--gallery-drift', `${offset}px`)
      element.classList.toggle('mk-scrolled', target > 65)
      if (Math.abs(target - current) > .1) frame = requestAnimationFrame(update)
      else frame = 0
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    reduce.addEventListener('change', schedule)
    schedule()
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); reduce.removeEventListener('change', schedule) }
  }, [paused])
  return <div ref={root} className={`mk-site ${loading ? 'mk-loading' : 'mk-loaded'} ${paused ? 'mk-paused' : ''}`}>
    {loading && <div className="mk-loader" role="status" aria-label="Loading Marketeer"><Wordmark /><div><i /></div><small>GOOD THINGS IN MOTION</small></div>}
    <a className="mk-skip-link" href="#main">Skip to content</a><Nav navigate={navigate} theme={theme} onToggleTheme={onToggleTheme} />
    <main id="main"><Hero navigate={navigate} /><Marquee /><Statement navigate={navigate} /><ProductShowcase navigate={navigate} /><Gallery navigate={navigate} /><Connections navigate={navigate} /><MetaSection navigate={navigate} /><HowItWorks /><section className="mk-final"><div data-enter><h2>You’ve got ideas.<br /><span>Let’s get them out there.</span></h2><button className="mk-button mk-button-orange" onClick={() => navigate('signup')}>Let’s make things happen <Arrow /></button></div><div className="mk-footer-display" aria-hidden="true">MARKETEER</div></section></main>
    <footer className="mk-footer">
      <a href="#top"><Wordmark /></a>
      <nav className="mk-footer-links" aria-label="Legal">
        <button type="button" onClick={() => navigate('privacy')}>Privacy</button>
        <button type="button" onClick={() => navigate('terms')}>Terms</button>
      </nav>
      <span>© 2026 Marketeer. Made for your next move.</span>
      <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? '▶ Resume motion' : 'Ⅱ Pause motion'}</button>
      <a href="#top">Back to top ↑</a>
    </footer>
  </div>
}
