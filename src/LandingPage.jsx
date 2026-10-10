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

function Statement({ navigate }) {
  return <section className="mk-statement" id="content"><div className="mk-statement-copy" data-enter><h2>A social presence<br />that doesn’t<br /><em>take over your life.</em></h2><p>Content that sounds like you. Campaigns that know your goals. Everything in one place, with you in control.</p><strong>Less tab-hopping. More making things happen.</strong><button className="mk-button mk-button-cream" onClick={() => navigate('signup')}>Meet your new studio <Arrow /></button></div><div className="mk-giant-word" aria-hidden="true"><span>MARKETEER</span><span>MARKETEER</span></div></section>
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
    <footer className="mk-footer"><a href="#top"><Wordmark /></a><span>© 2026 Marketeer. Made for your next move.</span><button onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? '▶ Resume motion' : 'Ⅱ Pause motion'}</button><a href="#top">Back to top ↑</a></footer>
  </div>
}
