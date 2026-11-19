// macher.ki brand primitives — Brand Guidelines v2.
// Symbol «three dots, then one», the wordmark with its circle dot, the co-branding lockups
// (levels 0–4) and the brand-mechanic motion. Colours come from CSS custom properties
// (see macher.css) so the head can carry a client colour without touching this file.
import { t } from './i18n.js'
import { WHITE_LABEL } from './brandConfig.js'

/* eslint-disable react-refresh/only-export-components */

// Brand copy stays German in every language (Brand Guidelines v2 · 02).
export const CLAIM = 'Weil es einer machen muss.'
export const MECHANIC = ['Viele warten.', 'Einer macht.']

// Construction in units of u = dot Ø (×100):
// dots Ø 1u, centre spacing 1.36u · body 1.1u × 3u fully rounded, on the dots' baseline ·
// head Ø 1.75u floating 0.32u above the body · the doer stands apart from the row.
const BASE = 507
const DOTS = [50, 186, 322]
const BODY = { x: 512, w: 110, h: 300 }
const HEAD = { cx: 567, r: 87.5, cy: BASE - 300 - 32 - 87.5 }
const FULL_BOX = `0 0 622 ${BASE}`
const FIGURE_BOX = `${HEAD.cx - HEAD.r} 0 ${HEAD.r * 2} ${BASE}`

/**
 * The symbol. `figure` drops the dots — required below 24 px (favicon).
 * `motion` plays the brand mechanic (CSS, once).
 */
export function MacherSymbol({ figure = false, motion = false, className = '', title, ...rest }) {
  return (
    <svg
      className={`macher-symbol ${motion ? 'is-motion' : ''} ${className}`}
      viewBox={figure ? FIGURE_BOX : FULL_BOX}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {!figure && DOTS.map((cx, index) => <circle key={cx} className={`m-dot m-dot-${index + 1}`} cx={cx} cy={BASE - 50} r="50" />)}
      <g className="m-doer">
        <rect className="m-body" x={BODY.x} y={BASE - BODY.h} width={BODY.w} height={BODY.h} rx={BODY.w / 2} />
        <circle className="m-head" cx={HEAD.cx} cy={HEAD.cy} r={HEAD.r} />
      </g>
    </svg>
  )
}

/** «macher.ki» — the dot is a circle in the head colour, never a period glyph. */
export function MacherWordmark({ className = '' }) {
  return (
    <span className={`macher-wordmark ${className}`} role="img" aria-label="macher.ki">
      <span aria-hidden="true">macher</span><i className="macher-wordmark-dot" aria-hidden="true" /><span aria-hidden="true">ki</span>
    </span>
  )
}

/**
 * Lockups:
 *   level 0 — <MacherLogo tagline />                       own brand, Lime head
 *   level 1 — <MacherLogo client="Holzbau Brunner" />      «für [client]», head in client colour
 *   level 2 — <MacherLogo coBrand={{ name, logo }} />      client logo right of a 1 px line
 * `tone`: auto (follows theme) · dark (on ink) · light (on paper/white) · lime (on a lime fill).
 */
export function MacherLogo({ size = 28, tone = 'auto', tagline = false, client = '', coBrand = null, clientColor = false, symbolOnly = false, motion = false, className = '', style, ...rest }) {
  const classes = ['macher-logo', `macher-tone-${tone}`, clientColor || client ? 'macher-client' : '', motion ? 'is-motion' : '', className].filter(Boolean).join(' ')
  return (
    <span className={classes} style={{ '--logo-size': `${size}px`, ...style }} {...rest}>
      <MacherSymbol motion={motion} />
      {!symbolOnly && (
        <span className="macher-logo-text">
          <MacherWordmark />
          {tagline && <small className="macher-logo-claim" lang="de">{CLAIM}</small>}
          {client && !tagline && <small className="macher-logo-for"><span lang="de">für</span> {client}</small>}
        </span>
      )}
      {coBrand && !symbolOnly && (
        <span className="macher-cobrand">
          {coBrand.logo
            ? <img src={coBrand.logo} alt={coBrand.name || ''} />
            : <span className="macher-cobrand-name">{coBrand.name}</span>}
        </span>
      )}
    </span>
  )
}

/** Level 3 / 4 — candidate-facing and white-label: macher.ki only as a small grey «powered by». */
export function PoweredBy({ className = '' }) {
  return (
    <span className={`macher-powered ${className}`}>
      <span>powered by</span>
      <MacherSymbol />
      <span>macher.ki</span>
    </span>
  )
}

/**
 * The brand shown inside the product (app header, login). Normally «macher.ki für [client]»
 * (level 1); with a white-label partner configured, the partner replaces macher.ki (level 4).
 */
export function AppBrand({ client = '', size = 26, tone = 'auto', compact = false, className = '' }) {
  if (WHITE_LABEL) {
    return (
      <span className={`macher-partner ${compact ? 'is-compact' : ''} ${className}`} style={{ '--logo-size': `${size}px`, '--partner-color': WHITE_LABEL.color }}>
        {WHITE_LABEL.logo ? <img src={WHITE_LABEL.logo} alt={WHITE_LABEL.name} /> : <i aria-hidden="true">{WHITE_LABEL.name.slice(0, 1)}</i>}
        {!compact && !WHITE_LABEL.logo && <b>{WHITE_LABEL.name}</b>}
      </span>
    )
  }
  return <MacherLogo size={size} tone={tone} client={compact ? '' : client} clientColor symbolOnly={compact} className={className} />
}

/** The brand name as plain text — the partner name in white label. */
export const brandName = () => (WHITE_LABEL ? WHITE_LABEL.name : 'macher.ki')

/**
 * Brand mechanic, 3.5 s: three dots appear and bob (waiting) · the doer rises, head pops ·
 * he tips forward ~10° and returns · the wordmark slides in, the dot pops · claim fades in.
 * `short` is the 1.2 s app-start splash (symbol only). End frame = static logo.
 */
export function MacherIntro({ short = false, tone = 'dark', client = '', clientColor = false, label }) {
  return (
    <div className={`macher-intro ${short ? 'is-short' : ''}`} role="status" aria-label={label || t('Loading {name}', { name: brandName() })}>
      {short || WHITE_LABEL
        ? <MacherLogo size={short ? 54 : 64} tone={tone} motion symbolOnly clientColor={clientColor} />
        : <MacherLogo size={64} tone={tone} motion tagline={!client} client={client} clientColor={clientColor} />}
    </div>
  )
}

/** Loading indicator: the dots bob like a typing indicator — waiting, then the doer. */
export function MacherLoader({ size = 40, className = '' }) {
  return <span className={`macher-loader macher-tone-auto macher-client ${className}`} style={{ '--logo-size': `${size}px` }} aria-hidden="true"><MacherSymbol /></span>
}
