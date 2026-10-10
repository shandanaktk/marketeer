import { useEffect, useState } from 'react'

const showcaseTabs = [
  { id: 'plan', label: 'Plan', kicker: 'AI content calendar', title: 'Turn your brand context into a month of ideas.', copy: 'Marketeer reads your Knowledge Base, balances content pillars, and maps the right format to every channel.', stat: '30 days', statLabel: 'planned in one pass', tone: 'olive' },
  { id: 'create', label: 'Create', kicker: 'Platform-native creative', title: 'One brief becomes captions, images, video, and hashtags.', copy: 'Every output is adapted to each platform while your voice, products, services, and rules stay consistent.', stat: '4 formats', statLabel: 'from one idea', tone: 'orange' },
  { id: 'schedule', label: 'Schedule', kicker: 'Always-on publishing', title: 'Approve once. Let the calendar keep moving.', copy: 'Choose the cadence and Marketeer handles platform formatting, scheduling, and automatic publishing.', stat: '5 hrs', statLabel: 'saved each week', tone: 'sand' },
  { id: 'campaign', label: 'Campaign', kicker: 'Vacancy to Meta campaign', title: 'A new vacancy becomes a launch-ready recruitment campaign.', copy: 'Campaign, ad sets, creatives, copy, Employment category, lead form, budget, and review mode are assembled together.', stat: '< 10 min', statLabel: 'from role to review', tone: 'blue' },
  { id: 'measure', label: 'Measure', kicker: 'Vacancy-linked reporting', title: 'See every result without opening Ads Manager.', copy: 'Spend, impressions, clicks, CTR, CPC, leads, and CPL refresh automatically by vacancy, campaign, and ad.', stat: '7 metrics', statLabel: 'in one clear view', tone: 'rose' },
]

const socialMarks = [
  { mark: '◎', name: 'Instagram', detail: 'Posts · Reels · Stories' },
  { mark: 'f', name: 'Facebook', detail: 'Organic + paid' },
]

export function BrandLoader({ onDone }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setLeaving(true), 1050)
    const doneTimer = window.setTimeout(onDone, 1480)
    return () => { window.clearTimeout(exitTimer); window.clearTimeout(doneTimer) }
  }, [onDone])

  return <div className={`brand-loader ${leaving ? 'is-leaving' : ''}`} role="status" aria-label="Loading Marketeer">
    <div className="loader-orbit"><i /><i /><i /></div>
    <p><span>Market</span><em>eer</em><b>.</b></p>
    <small>Ideas in motion</small>
    <div className="loader-line"><i /></div>
  </div>
}

function MiniCalendar({ active }) {
  const cells = Array.from({ length: 14 }, (_, index) => index + 1)
  return <div className="showcase-calendar">
    <header><span>October 2026</span><b>AI planned</b></header>
    <div className="calendar-week"><small>M</small><small>T</small><small>W</small><small>T</small><small>F</small><small>S</small><small>S</small></div>
    <div className="calendar-cells">{cells.map((cell) => <i className={[2, 5, 8, 11, 13].includes(cell) ? `filled ${active}` : ''} key={cell}>{cell}</i>)}</div>
  </div>
}

function MiniCreative({ active }) {
  return <div className={`showcase-creative ${active}`}>
    <span>NEW ROLE / AMSTERDAM</span>
    <div className="creative-rings"><i /><i /></div>
    <strong>MAKE<br /><em>WORK</em><br />MATTER.</strong>
    <small>Senior Product Designer · Apply today</small>
  </div>
}

export function InteractivePipeline() {
  const [activeId, setActiveId] = useState(showcaseTabs[0].id)
  const active = showcaseTabs.find((item) => item.id === activeId)

  return <section className="interactive-pipeline section-light" id="platform">
    <div className="shell">
      <div className="pipeline-heading">
        <div className="eyebrow dark"><span>01</span> One connected system</div>
        <h2>Streamline your social.<br /><em>Hire with real momentum.</em></h2>
        <p>From the first idea to the final lead, every step stays connected to your brand.</p>
      </div>
      <div className="pipeline-tabs" role="tablist" aria-label="Product capabilities">
        {showcaseTabs.map((tab) => <button className={activeId === tab.id ? 'active' : ''} type="button" role="tab" aria-selected={activeId === tab.id} onClick={() => setActiveId(tab.id)} key={tab.id}><span>{tab.label}</span><i /></button>)}
      </div>
      <article className={`pipeline-stage tone-${active.tone}`} key={active.id}>
        <div className="pipeline-stage-copy">
          <span>{active.kicker}</span><h3>{active.title}</h3><p>{active.copy}</p><a href="?view=signup">Explore in Marketeer <b>↗</b></a>
        </div>
        <div className="pipeline-stage-ui" aria-label={`${active.label} product preview`}>
          <div className="mini-app-chrome"><i /><i /><i /><span>marketeer / {active.id}</span></div>
          <div className="mini-app-body">
            <aside><b>M.</b><i /><i /><i /><i /></aside>
            <main><header><div><small>{active.kicker}</small><strong>{active.label} workspace</strong></div><button>AI active</button></header><div className="mini-layout"><MiniCalendar active={active.id} /><MiniCreative active={active.id} /></div></main>
          </div>
          <div className="pipeline-stat"><strong>{active.stat}</strong><span>{active.statLabel}</span></div>
        </div>
      </article>
    </div>
  </section>
}

export function KineticPromise() {
  const phrase = 'YOUR BRAND · EVERY FEED · ALWAYS IN MOTION · '
  return <section className="kinetic-promise" aria-label="Your brand, every feed, always in motion">
    <div className="kinetic-line" aria-hidden="true"><span>{phrase}{phrase}</span><span>{phrase}{phrase}</span></div>
    <div className="shell kinetic-copy" data-reveal><span className="kinetic-index">02 / SOCIAL ENGINE</span><h2>A social presence that<br /><em>doesn’t wait on you.</em></h2><p>Marketeer plans, creates, formats, schedules, and publishes from one shared source of truth—so your brand keeps showing up even when your calendar fills up.</p></div>
    <div className="kinetic-line reverse" aria-hidden="true"><span>{phrase}{phrase}</span><span>{phrase}{phrase}</span></div>
  </section>
}

export function PlatformWall() {
  const doubled = [...socialMarks, ...socialMarks]
  return <section className="platform-wall section-light"><div className="shell platform-wall-grid">
    <div className="platform-wall-copy" data-reveal><div className="eyebrow dark"><span>05</span> Bring every channel</div><h2>One brand brain.<br /><em>Everywhere it matters.</em></h2><p>Connect your official accounts once. Marketeer gives every network the native format it needs without losing what makes your brand recognizable.</p><a className="wall-link" href="?view=signup">Connect your channels <span>↗</span></a></div>
    <div className="platform-columns" aria-label="Supported social platforms">
      <div className="platform-column up"><div>{doubled.map((item, index) => <article key={`${item.name}-a-${index}`}><span>{item.mark}</span><p><b>{item.name}</b><small>{item.detail}</small></p></article>)}</div></div>
      <div className="platform-column down"><div>{[...doubled].reverse().map((item, index) => <article key={`${item.name}-b-${index}`}><span>{item.mark}</span><p><b>{item.name}</b><small>{item.detail}</small></p></article>)}</div></div>
    </div>
  </div></section>
}
