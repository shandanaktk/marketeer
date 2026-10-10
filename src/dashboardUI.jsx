import { useEffect } from 'react'

export function Icon({ name, size = 18 }) {
  const paths = {
    home: <><path d="M3 10.8 12 3l9 7.8" /><path d="M5.5 9.5V21h13V9.5M9.5 21v-6h5v6" /></>,
    create: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    content: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    ads: <><path d="M4 13.5v-3l13-5v13l-13-5Z" /><path d="M7 14.6 8.5 20h3l-1.2-4.4M17 9l3-2M17 15l3 2" /></>,
    campaigns: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    leads: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    optimize: <><path d="M4 14a8 8 0 1 1 16 0" /><path d="m12 14 4-5" /><path d="M5 19h14" /></>,
    library: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="m7 15 3-3 2.2 2.2L16 9l2 3M8 8h.01" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.6.5l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.6-.5l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 15a2 2 0 0 0 .4 2l-2.5 2.5a2 2 0 0 0-2-.4 2 2 0 0 0-1 1.7H10A2 2 0 0 0 9 19a2 2 0 0 0-2 .4L4.5 17a2 2 0 0 0 .4-2A2 2 0 0 0 3 14v-4a2 2 0 0 0 1.8-1 2 2 0 0 0-.4-2L7 4.5a2 2 0 0 0 2 .4A2 2 0 0 0 10 3h4a2 2 0 0 0 1 1.8 2 2 0 0 0 2-.4L19.5 7a2 2 0 0 0-.4 2 2 2 0 0 0 1.8 1v4a2 2 0 0 0-1.9 1Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    plus: <path d="M12 5v14M5 12h14" />, minus: <path d="M5 12h14" />,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>, back: <><path d="M19 12H5M10 17l-5-5 5-5" /></>,
    spark: <path d="M12 2c.4 5.7 3.7 9 9 9.5-5.3.5-8.6 3.8-9 9.5-.4-5.7-3.7-9-9-9.5C8.3 11 11.6 7.7 12 2Z" />,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    wallet: <><path d="M4 6.5h14a2 2 0 0 1 2 2V19H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h13" /><path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>, check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />, menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v4h16v-4" /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" /></>,
    refresh: <><path d="M20 7v5h-5" /><path d="M19 12a7 7 0 1 0-2 5" /></>, play: <path d="m8 5 11 7-11 7Z" />,
    pause: <><path d="M9 5H6v14h3ZM18 5h-3v14h3Z" /></>, clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></>,
    filter: <path d="M4 5h16l-6 7v6l-4 2v-8Z" />, download: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 20h16" /></>,
    edit: <><path d="M12 20h9" /><path d="m16.5 3.5 4 4L8 20l-5 1 1-5Z" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    file: <><path d="M6 2h8l4 4v16H6Z" /><path d="M14 2v5h5M9 12h6M9 16h6" /></>, folder: <path d="M3 6h7l2 2h9v11H3Z" />,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4H4v12h4" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="m4 17 5-5 3 3 2-2 6 5" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    phone: <path d="M6 3h4l2 5-3 2a16 16 0 0 0 5 5l2-3 5 2v4a3 3 0 0 1-3 3C10 20 4 14 3 6a3 3 0 0 1 3-3Z" />,
    bolt: <path d="m13 2-8 12h7l-1 8 8-12h-7Z" />, undo: <><path d="M9 7 4 12l5 5" /><path d="M5 12h8a6 6 0 0 1 6 6" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  }
  return <svg className="db-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{paths[name] || paths.spark}</svg>
}

export function Button({ children, variant = 'primary', className = '', icon, disabled, onClick, type = 'button' }) {
  return <button type={type} className={`db-button ${variant} ${className}`} disabled={disabled} onClick={onClick}>{icon && <Icon name={icon} size={16} />}{children}</button>
}

export function Badge({ children, tone = 'lime' }) {
  return <span className={`db-badge ${tone}`}><i />{children}</span>
}

export function PlatformMark({ platform }) {
  const key = platform.toLowerCase()
  const marks = { facebook: 'f', instagram: '◎', tiktok: '♪', linkedin: 'in' }
  return <span className={`db-platform ${key}`} title={platform}>{marks[key] || platform.slice(0, 1)}</span>
}

export function PageIntro({ eyebrow, title, description, actions, icon }) {
  return (
    <header className="db-page-intro">
      <div><span className="db-eyebrow">{icon && <Icon name={icon} size={14} />}{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>
      {actions && <div className="db-page-actions">{actions}</div>}
    </header>
  )
}

export function Field({ label, hint, children, className = '' }) {
  return <label className={`db-field ${className}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}

export function Toggle({ checked, onChange, label, hint }) {
  return <button type="button" className={`db-toggle-row ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}><span className="db-toggle"><i /></span><span><b>{label}</b>{hint && <small>{hint}</small>}</span></button>
}

export function CreativeArt({ palette = 'lime', theme = 'MOVE / WITH PURPOSE', compact = false, imageUrl }) {
  const [first, ...rest] = theme.split(' / ')
  return (
    <div className={`db-creative-art ${palette} ${compact ? 'compact' : ''}`} style={imageUrl ? { backgroundImage: `linear-gradient(180deg, transparent, rgba(5,5,5,.45)), url(${imageUrl})` } : undefined}>
      <span>MARKETEER / 2026</span><i className="orbit one" /><i className="orbit two" /><b>{first}<em>{rest.join(' ') || 'CREATE'}</em></b><small>MADE TO MOVE</small>
    </div>
  )
}

export function SocialPreview({ caption, hashtags = [], platforms = ['Instagram'], palette = 'lime', theme, imageUrl, format = 'Post' }) {
  return (
    <article className={`db-social-preview ${format.toLowerCase()}`}>
      <header><span className="db-preview-avatar">AC</span><div><b>Marketeer Studio</b><small>Sponsored · now</small></div><Icon name="more" size={18} /></header>
      <CreativeArt palette={palette} theme={theme} imageUrl={imageUrl} />
      <div className="db-preview-actions"><span>♡</span><span>○</span><span>⌁</span><small>{platforms.map((platform) => <PlatformMark platform={platform} key={platform} />)}</small></div>
      <p><b>marketeer.studio</b> {caption || 'Your caption will appear here.'}</p>
      {!!hashtags.length && <p className="tags">{hashtags.map((tag) => `#${tag}`).join(' ')}</p>}
    </article>
  )
}

export function AdPreview({ headline, primary, cta = 'SIGN_UP', palette = 'lime', theme = 'MOVE / WITH PURPOSE' }) {
  return (
    <article className="db-ad-preview-card">
      <header><span className="db-preview-avatar meta">f</span><div><b>Marketeer Studio</b><small>Sponsored · public</small></div><Icon name="more" size={18} /></header>
      <p>{primary}</p><CreativeArt palette={palette} theme={theme} />
      <footer><div><small>MARKETEER.CO</small><b>{headline}</b></div><button>{cta.replaceAll('_', ' ')}</button></footer>
    </article>
  )
}

export function EmptyState({ icon = 'spark', title, body, action }) {
  return <div className="db-empty"><span><Icon name={icon} size={25} /></span><h3>{title}</h3><p>{body}</p>{action}</div>
}

export function Modal({ title, onClose, children, wide = false, footer }) {
  useEffect(() => {
    const close = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [onClose])
  return (
    <div className="db-modal-layer" role="dialog" aria-modal="true" aria-label={title}>
      <button className="db-modal-scrim" onClick={onClose} aria-label="Close dialog" />
      <section className={`db-modal ${wide ? 'wide' : ''}`}><header><h2>{title}</h2><button onClick={onClose} aria-label="Close"><Icon name="close" size={19} /></button></header><div className="db-modal-body">{children}</div>{footer && <footer>{footer}</footer>}</section>
    </div>
  )
}

export function Spinner({ label = 'Working on it…', progress }) {
  return <div className="db-spinner-state"><span><Icon name="spark" size={27} /></span><h2>{label}</h2><p>Marketeer is using your brand context and selections.</p><div className="db-progress"><i style={{ width: `${progress || 68}%` }} /></div></div>
}
