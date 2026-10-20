import { useEffect, useRef, useState } from 'react'
import { LanguageButton, t } from './i18n.js'
import { ThemeButton } from './theme.jsx'
import { Arrow, SocialMark } from './landingIcons.jsx'
import { workflowSteps } from './landingMockData.js'
import ProductShowcase from './ProductShowcase.jsx'

function Wordmark() {
  return <span className="mk-wordmark">marketeer<span>.</span></span>
}

function Nav({ navigate, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false)
  const links = [
    [t('Platform'), 'platform'],
    [t('Content'), 'content'],
    [t('Meta ads'), 'meta'],
    [t('How it works'), 'how'],
    [t('Quality'), 'quality'],
  ]
  return (
    <header className="mk-nav">
      <a href="#top" aria-label={t('Marketeer home')} onClick={() => setOpen(false)}><Wordmark /></a>
      <nav className={open ? 'mk-nav-links open' : 'mk-nav-links'} aria-label={t('Main navigation')}>
        {links.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>)}
      </nav>
      <div className="mk-nav-actions">
        <LanguageButton />
        <ThemeButton theme={theme} onToggle={onToggleTheme} />
        <button className="mk-button mk-nav-signup" onClick={() => navigate('signup')}>{t('Sign up')} <Arrow /></button>
        <button className="mk-login" onClick={() => navigate('signin')}>{t('Login')}</button>
        <button className="mk-menu-toggle" aria-label={open ? t('Close menu') : t('Open menu')} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '×' : '☰'}</button>
      </div>
    </header>
  )
}

function Hero({ navigate }) {
  return (
    <section className="mk-hero" id="top">
      <div className="mk-hero-photo" aria-hidden="true">
        <img src="/brand/walk-sunrise.jpg" alt="" fetchPriority="high" />
      </div>
      <div className="mk-hero-copy">
        <p className="mk-hero-eyebrow">{t('Built for Personal Sigma Schwyz')}</p>
        <h1>
          <span><b>{t('Competent. Regional.')}</b></span>
          <span className="mk-headline-highlight"><b>{t('Personal — now digital.')}</b></span>
        </h1>
        <p className="mk-hero-description">{t('Content and Meta campaigns that sound like your team: close to the market, clear with people, and at home in Central Switzerland.')}</p>
        <div className="mk-hero-facts">
          <span>{t('German first')}</span>
          <span>CHF</span>
          <span>Europe/Zurich</span>
          <span>{t('Schwyz')}</span>
        </div>
        <button className="mk-button mk-button-orange" onClick={() => navigate('signup')}>{t('Open your workspace')} <Arrow /></button>
      </div>
    </section>
  )
}

function Marquee() {
  const words = [t('Competent'), t('Regional'), t('Personal'), t('Individual'), t('Smart'), t('Passionate')]
  return (
    <div className="mk-marquee" aria-label={t('Personal Sigma in six words')}>
      <div className="mk-marquee-track" aria-hidden="true">
        {[0, 1, 2, 3].map((copy) => (
          <div className="mk-marquee-group" key={copy}>
            {words.map((word) => <span key={word}>{word}<i>+</i></span>)}
          </div>
        ))}
      </div>
    </div>
  )
}

const feedPosts = () => [
  { platform: 'instagram', name: 'ps.schwyz', place: 'Schwyz', avatar: '/brand/portrait-2.jpg', image: '/brand/craft-plasterer.jpg', likes: '186', comments: '12', time: '2 hours ago', caption: t('Craftsmanship, close to home.'), tag: '#personalsigma', verified: true },
  { platform: 'facebook', name: 'Personal Sigma Schwyz', time: '2h', avatar: '/brand/portrait-1.jpg', image: '/brand/office-review.jpg', caption: t('A conversation first. Then the right role.'), reactions: '94', comments: '11' },
  { platform: 'instagram', name: 'ps.schwyz', place: 'Ingenieure', avatar: '/brand/portrait-3.jpg', image: '/brand/engineer-drawing.jpg', likes: '241', comments: '18', time: '5 hours ago', caption: t('Technical talent, found regionally.'), tag: '#stellenangebot' },
  { platform: 'facebook', name: 'Personal Sigma Schwyz', time: '5h', avatar: '/brand/portrait-4.jpg', image: '/brand/workshop-plans.jpg', caption: t('From the workshop to the office — we know both worlds.'), reactions: '128', comments: '9' },
  { platform: 'instagram', name: 'ps.schwyz', place: 'Team Schwyz', avatar: '/brand/portrait-1.jpg', image: '/brand/team-outdoor.jpg', likes: '412', comments: '27', time: '1 day ago', caption: t('A team that shows up in person.'), tag: '#teamschwyz', verified: true },
  { platform: 'facebook', name: 'Personal Sigma Schwyz', time: '1d', avatar: '/brand/portrait-2.jpg', image: '/brand/cnc-hands.jpg', caption: t('Hands-on roles. Honest matching.'), reactions: '76', comments: '6' },
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
  return (
    <article className={`mk-feed-card mk-feed-${post.platform}`}>
      <header>
        {instagram ? <span className="mk-ig-avatar"><img src={post.avatar} alt="" /></span> : <img src={post.avatar} alt="" />}
        <p><b>{post.name}{instagram && post.verified ? <IgIcon name="verified" /> : null}</b><small>{instagram ? post.place : `${post.time} · ${t('Public')}`}</small></p>
        {instagram ? <IgIcon name="more" /> : <FeedIcon name="globe" />}
      </header>
      <img className="mk-feed-photo" src={post.image} alt="" />
      <div className="mk-feed-foot">
        {instagram
          ? <div className="mk-feed-actions mk-ig-actions"><span><IgIcon name="heart" /><IgIcon name="comment" /><IgIcon name="send" /></span><IgIcon name="bookmark" /></div>
          : <div className="mk-feed-actions mk-feed-fb-actions"><span><FeedIcon name="like" /> {t('Like')}</span><span><FeedIcon name="comment" /> {t('Comment')}</span><span><FeedIcon name="share" /> {t('Share')}</span></div>}
        <p className="mk-feed-caption">{instagram ? <><b>{post.name}</b> {post.caption} <span>{post.tag}</span></> : post.caption}</p>
        <small>{instagram ? `${post.likes} ${t('likes')} · ${post.comments} ${t('comments')}` : <><span className="mk-feed-pills" aria-hidden="true"><i /><i /><i /></span>{post.reactions} · {post.comments} {t('comments')}</>}</small>
      </div>
    </article>
  )
}

function Statement({ navigate }) {
  return (
    <section className="mk-statement" id="content">
      <div className="mk-statement-copy" data-enter>
        <h2>{t('A presence that feels like')}<br /><em>{t('Personal Sigma.')}</em></h2>
        <p>{t('Captions in your voice. Recruitment campaigns tied to real vacancies. One workspace, with you still in control.')}</p>
        <strong>{t('Less tool-hopping. More time with people.')}</strong>
        <button className="mk-button mk-button-cream" onClick={() => navigate('signup')}>{t('See the workspace')} <Arrow /></button>
      </div>
      <div className="mk-post-rail" aria-label={t('Instagram and Facebook post previews')}>
        <div className="mk-post-rail-track">
          {[0, 1].map((copy) => (
            <div className="mk-post-rail-set" key={copy} aria-hidden={copy === 1 || undefined}>
              {feedPosts().map((post) => <FeedCard key={`${copy}-${post.image}`} post={post} />)}
            </div>
          ))}
        </div>
      </div>
      <div className="mk-giant-word" aria-hidden="true"><span>MARKETEER</span><span>MARKETEER</span></div>
    </section>
  )
}

function Split({ navigate }) {
  return (
    <div className="mk-split">
      <article className="lime">
        <h3>{t('I want stronger content')}</h3>
        <button type="button" onClick={() => navigate('signup')}><i>+</i> {t('Plan, write, and publish')}</button>
        <button type="button" onClick={() => document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' })}><i>+</i> {t('Open the content studio')}</button>
      </article>
      <article className="ink">
        <h3>{t('I want to find talent')}</h3>
        <button type="button" onClick={() => navigate('signup')}><i>+</i> {t('Turn a vacancy into ads')}</button>
        <button type="button" onClick={() => document.getElementById('meta')?.scrollIntoView({ behavior: 'smooth' })}><i>+</i> {t('Explore Meta campaigns')}</button>
      </article>
    </div>
  )
}

function Values() {
  const items = [
    ['/brand/office-tablet.jpg', t('Competent'), t('Quality and professionalism, with specialists for commercial, technical, and skilled trades.')],
    ['/brand/schwyz-square.jpg', t('Regional'), t('Rooted in Central Switzerland. Close to people, realistic about the market, and present on the ground.')],
    ['/brand/portrait-1.jpg', t('Personal'), t('Fixed contacts, individual advice, and a collaboration built on trust.')],
  ]
  return (
    <section className="mk-values" data-enter>
      <header>
        <span className="mk-overline">{t('Personal Sigma in three words')}</span>
        <h2>{t('The same values. A clearer daily tool.')}</h2>
      </header>
      <div className="mk-value-grid">
        {items.map(([src, title, copy]) => (
          <article key={title}>
            <img src={src} alt="" />
            <div><h3>{title}</h3><p>{copy}</p></div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Gallery({ navigate }) {
  const photos = ['craft-plasterer', 'engineer-drawing', 'office-review', 'workshop-plans', 'cnc-hands', 'office-tablet', 'portrait-2', 'portrait-3', 'team-outdoor', 'testimonial-1', 'walk-sunrise', 'schwyz-square', 'portrait-1', 'portrait-4', 'office-review']
  return (
    <section className="mk-gallery-section">
      <div className="mk-gallery-layout">
        <div className="mk-gallery-window" aria-label={t('Photography from Personal Sigma Schwyz')}>
          <div className="mk-gallery-grid">
            {[0, 1, 2].map((col) => (
              <div className="mk-gallery-col" key={col}>
                {photos.slice(col * 5, col * 5 + 5).map((name) => <img key={name} src={`/brand/${name}.jpg`} loading="lazy" alt="" />)}
              </div>
            ))}
          </div>
        </div>
        <div className="mk-gallery-copy" data-enter>
          <span className="mk-overline">{t('Imagery from your world')}</span>
          <h2>{t('People, trades, and the region — not stock SaaS.')}</h2>
          <p>{t('Every visual in the product can sit next to the photography you already use. The platform should feel like it belongs to Schwyz.')}</p>
          <button className="mk-text-button" onClick={() => navigate('signup')}>{t('Start with your brand')} <Arrow /></button>
          <small>{t('Personal Sigma Schwyz · visual language')}</small>
        </div>
      </div>
    </section>
  )
}

function Quality() {
  return (
    <section className="mk-quality" id="quality" data-enter>
      <img src="/brand/swissstaffing-label.png" alt={t('swissstaffing quality label')} />
      <div>
        <h2>{t('We live quality.')}</h2>
        <p>{t('Personal Sigma is a swissstaffing member. Marketeer follows that same standard: clear, careful, and made for the Swiss staffing market.')}</p>
      </div>
    </section>
  )
}

function Connections({ navigate }) {
  const columns = [['instagram', 'facebook', 'instagram', 'facebook', 'instagram'], ['facebook', 'instagram', 'facebook', 'instagram', 'facebook'], ['instagram', 'facebook', 'instagram', 'facebook', 'instagram']]
  return (
    <section className="mk-connections" id="connect">
      <div className="mk-connect-inner">
        <div className="mk-connect-copy" data-enter>
          <h2>{t('Your channels.')}<br />{t('One desk.')}</h2>
          <p>{t('Facebook, Instagram, and Meta Ads in the same workspace as your vacancies and knowledge base.')}</p>
          <p>{t('Connect once. Review together. Keep every campaign facing the same regional market.')}</p>
          <button className="mk-button" onClick={() => navigate('signup')}>{t('Build your workspace')} <Arrow /></button>
        </div>
        <div className="mk-logo-wall" aria-label={t('Social platform ecosystem')}>
          {columns.map((col, i) => (
            <div className={`mk-logo-column mk-logo-column-${i}`} key={i}>
              <div>
                {[0, 1].map((set) => (
                  <div className="mk-logo-set" key={set} aria-hidden={set === 1}>
                    {col.map((name, index) => <div className={`mk-logo-tile mk-tile-${name}`} key={`${name}-${index}`}><SocialMark platform={name} /></div>)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Region() {
  const places = ['Schwyz', 'Aarau', 'Altdorf', 'Basel', 'Stans', 'Sursee']
  return (
    <section className="mk-region" data-enter>
      <img src="/brand/schwyz-square.jpg" alt="" />
      <div>
        <span className="mk-overline">{t('Central Switzerland')}</span>
        <h2>{t('Close to the people we work with.')}</h2>
        <p>{t('Personal Sigma Schwyz AG, Rickenbachstrasse 1, 6430 Schwyz. Marketeer uses CHF, German, and Europe/Zurich so the product matches the office — not a generic test market.')}</p>
        <ul>{places.map((place) => <li key={place}>{place}</li>)}</ul>
      </div>
    </section>
  )
}

function MetaSection({ navigate }) {
  return (
    <section className="mk-meta" id="meta">
      <div className="mk-meta-inner">
        <div className="mk-meta-copy" data-enter>
          <span className="mk-overline">{t('YOUR NEXT GREAT HIRE STARTS HERE')}</span>
          <h2>{t('From vacancy')}<br />{t('to campaign.')}</h2>
          <p>{t('Turn a vacancy into a complete Meta campaign. Creative, copy, lead forms, and targeting, all connected to the role you need to fill.')}</p>
          <p>{t('Set your budget in CHF. Review your campaign. Track every lead. You stay in charge of what goes live.')}</p>
          <button className="mk-button" onClick={() => navigate('signup')}>{t('Explore Meta campaigns')} <Arrow /></button>
        </div>
        <div className="mk-campaign-stack" data-enter>
          <div className="mk-campaign-back">
            <SocialMark platform="meta" />
            <span>{t('CAMPAIGN STUDIO')}</span>
            <b>{t('Good people.')}<br />{t('Great possibilities.')}</b>
          </div>
          <div className="mk-campaign-front">
            <div>
              <span className="mk-campaign-avatar">PS</span>
              <p><b>{t('Your next chapter')}</b><small>{t('Sponsored · Demo preview')}</small></p>
              <span>•••</span>
            </div>
            <div className="mk-job-art">
              <small>{t('PERSONAL SIGMA SCHWYZ')}</small>
              <strong>{t('Good work.')}<br />{t('Great people.')}<br /><em>{t('Your move.')}</em></strong>
              <span>{t('JOIN THE TEAM ↗')}</span>
            </div>
            <footer>
              <div>
                <small>{t('YOUR BRAND · CAREERS')}</small>
                <b>{t('Find where you belong.')}</b>
              </div>
              <button onClick={() => navigate('signup')}>{t('Learn more ↗')}</button>
            </footer>
          </div>
          <div className="mk-campaign-status"><i /> {t('Ready for your review')} <span>✓</span></div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const [open, setOpen] = useState(0)
  return (
    <section className="mk-how" id="how">
      <div className="mk-how-heading" data-enter>
        <span className="mk-overline">{t('A LITTLE SETUP. A WHOLE LOT OF GO.')}</span>
        <h2>{t('Find your flow.')}</h2>
        <p>{t('From the first vacancy')}<br />{t('to a campaign you can stand behind.')}</p>
      </div>
      <div className="mk-workflow">
        {workflowSteps.map(([title, description], i) => (
          <div className={`mk-workflow-item ${open === i ? 'open' : ''}`} key={title}>
            <button aria-expanded={open === i} aria-controls={`workflow-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
              <span>0{i + 1}</span>
              <h3>{t(title)}</h3>
              <b>{open === i ? '−' : '+'}</b>
            </button>
            <div id={`workflow-${i}`} hidden={open !== i}><p>{t(description)}</p></div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function LandingPage({ navigate, theme, onToggleTheme }) {
  const root = useRef(null)
  const [loading, setLoading] = useState(true)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    let live = true
    const timer = setTimeout(() => { if (live) setLoading(false) }, 900)
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
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.target.classList.toggle('mk-entered', entry.isIntersecting)), { threshold: .12 })
    element.querySelectorAll('[data-enter]').forEach((item) => observer.observe(item))
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
      if (gallery) {
        const offset = motion ? Math.max(-70, Math.min(70, (gallery.getBoundingClientRect().top - window.innerHeight / 2) * .12)) : 0
        gallery.style.setProperty('--gallery-drift', `${offset}px`)
      }
      element.classList.toggle('mk-scrolled', target > 40)
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
  return (
    <div ref={root} className={`mk-site ${loading ? 'mk-loading' : 'mk-loaded'} ${paused ? 'mk-paused' : ''}`}>
      {loading && (
        <div className="mk-loader" role="status" aria-label={t('Loading Marketeer')}>
          <Wordmark />
          <div><i /></div>
          <small>{t('PERSONAL SIGMA SCHWYZ')}</small>
        </div>
      )}
      <a className="mk-skip-link" href="#main">{t('Skip to content')}</a>
      <Nav navigate={navigate} theme={theme} onToggleTheme={onToggleTheme} />
      <main id="main">
        <Hero navigate={navigate} />
        <Marquee />
        <Statement navigate={navigate} />
        <Split navigate={navigate} />
        <Values />
        <ProductShowcase navigate={navigate} />
        <Gallery navigate={navigate} />
        <Quality />
        <Connections navigate={navigate} />
        <MetaSection navigate={navigate} />
        <Region />
        <HowItWorks />
        <section className="mk-final">
          <div data-enter>
            <h2>{t('You’ve got the market.')}<br /><span>{t('Let’s get the stories out.')}</span></h2>
            <button className="mk-button mk-button-orange" onClick={() => navigate('signup')}>{t('Let’s make things happen')} <Arrow /></button>
          </div>
          <div className="mk-footer-display" aria-hidden="true">MARKETEER</div>
        </section>
      </main>
      <footer className="mk-footer">
        <a href="#top"><Wordmark /></a>
        <nav className="mk-footer-links" aria-label={t('Legal')}>
          <button type="button" onClick={() => navigate('privacy')}>{t('Privacy')}</button>
          <button type="button" onClick={() => navigate('terms')}>{t('Terms')}</button>
        </nav>
        <span>{t('© 2026 Marketeer · Personal Sigma Schwyz AG')}</span>
        <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? t('▶ Resume motion') : t('Ⅱ Pause motion')}</button>
        <a href="#top">{t('Back to top ↑')}</a>
      </footer>
    </div>
  )
}
