// Client colours — macher.ki Brand Guidelines v2, section 03.
//
// 1. Input: a hex colour from onboarding (or the first saturated colour of the brand palette).
// 2. Convert to OKLCH. Only L is ever changed — the hue stays untouched.
// 3. Neutral check: C < 0.045 (grey, black, white, pastel) → fall back to macher Lime.
// 4. WCAG contrast against the background: logo head ≥ 1.5 : 1 · UI accent ≥ 3 : 1.
// 5. Adjust: lower L in steps of 0.015 (light mode) or raise it (dark mode) until the ratio
//    is met. Out of sRGB gamut → reduce chroma.
// 6. Store 4 tokens: client.logo · client.ui · client.dark · client.on.

export const BRAND = {
  lime: '#B9DC20', // own head + dot
  limeDark: '#7D9602', // UI accent on light bg
  ink: '#151514', // text, body of figure
  paper: '#F4F2EC', // light background
  stone: '#CFCBC1', // dots on light bg
  graphite: '#4A4843', // dots on dark bg
  white: '#FFFFFF',
}

const NEUTRAL_CHROMA = 0.045
const STEP = 0.015
const LOGO_RATIO = 1.5
const UI_RATIO = 3

// macher Lime is the fixed brand colour and exempt from the logo rule.
export const LIME_TOKENS = Object.freeze({
  logo: BRAND.lime,
  ui: BRAND.limeDark,
  dark: BRAND.lime,
  on: BRAND.ink,
  onDark: BRAND.ink,
  fallback: true,
})

// ── colour maths ────────────────────────────────────────────────────────────
const clamp01 = (value) => Math.min(1, Math.max(0, value))
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

export function parseHex(input) {
  const raw = String(input || '').trim().replace(/^#/, '')
  const hex = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
}

export function toHex(rgb) {
  return `#${rgb.map((c) => Math.round(clamp01(c) * 255).toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

function rgbToOklch([r, g, b]) {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)]
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return { L, C: Math.hypot(A, B), H: Math.atan2(B, A) }
}

// Returns gamma-encoded sRGB — values may fall outside 0…1 when out of gamut.
function oklchToRgb({ L, C, H }) {
  const A = C * Math.cos(H)
  const B = C * Math.sin(H)
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => (c < 0 ? -toGamma(-c) : toGamma(c)))
}

const inGamut = (rgb) => rgb.every((c) => c >= -0.0005 && c <= 1.0005)

// Out of sRGB gamut → reduce chroma (hue and lightness stay).
function toDisplayable(lch) {
  let { C } = lch
  let rgb = oklchToRgb({ ...lch, C })
  while (!inGamut(rgb) && C > 0) {
    C = Math.max(0, C - 0.002)
    rgb = oklchToRgb({ ...lch, C })
  }
  return rgb.map(clamp01)
}

function luminance(rgb) {
  const [r, g, b] = rgb.map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a, b) {
  const one = luminance(typeof a === 'string' ? parseHex(a) : a)
  const two = luminance(typeof b === 'string' ? parseHex(b) : b)
  return (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05)
}

// Move only L until the colour reaches `ratio` against `background`.
function fit(lch, background, ratio, direction) {
  const bg = parseHex(background)
  let current = { ...lch }
  let rgb = toDisplayable(current)
  let guard = 0
  while (contrast(rgb, bg) < ratio && guard < 80) {
    current = { ...current, L: clamp01(current.L + direction * STEP) }
    rgb = toDisplayable(current)
    guard += 1
    if (current.L === 0 || current.L === 1) break
  }
  return toHex(rgb)
}

// Text colour on a client-colour fill: Ink or White, whichever has higher contrast.
export const onColor = (hex) => (contrast(hex, BRAND.ink) >= contrast(hex, BRAND.white) ? BRAND.ink : BRAND.white)

export const isNeutral = (hex) => {
  const rgb = parseHex(hex)
  return !rgb || rgbToOklch(rgb).C < NEUTRAL_CHROMA
}

/**
 * Compute the four client tokens for one input colour.
 * @param {string} input  hex colour, e.g. '#E07A2E'
 * @param {{ light?: string, dark?: string }} backgrounds  the light and dark UI backgrounds
 */
export function clientTokens(input, { light = BRAND.paper, dark = BRAND.ink } = {}) {
  const rgb = parseHex(input)
  if (!rgb) return LIME_TOKENS
  const lch = rgbToOklch(rgb)
  if (lch.C < NEUTRAL_CHROMA) return LIME_TOKENS
  if (toHex(rgb) === BRAND.lime) return LIME_TOKENS
  const logo = fit(lch, light, LOGO_RATIO, -1)
  const ui = fit(lch, light, UI_RATIO, -1)
  const darkMode = fit(lch, dark, UI_RATIO, +1)
  return { logo, ui, dark: darkMode, on: onColor(ui), onDark: onColor(darkMode), fallback: false }
}

// Brand palettes list several colours; the first saturated one becomes the client colour.
export function pickClientColor(colors = []) {
  return (Array.isArray(colors) ? colors : [colors]).find((color) => parseHex(color) && !isNeutral(color)) || null
}

const TOKEN_VARS = { logo: '--client-logo', ui: '--client-ui', dark: '--client-dark', on: '--client-on', onDark: '--client-on-dark' }

/** Write the tokens as CSS custom properties (default: on <html>). Pass null to reset to Lime. */
export function applyClientColors(input, element = typeof document !== 'undefined' ? document.documentElement : null) {
  if (!element) return LIME_TOKENS
  const tokens = input ? clientTokens(input) : LIME_TOKENS
  Object.entries(TOKEN_VARS).forEach(([key, name]) => element.style.setProperty(name, tokens[key]))
  element.dataset.clientColor = tokens.fallback ? 'lime' : 'client'
  return tokens
}

export function clearClientColors(element = typeof document !== 'undefined' ? document.documentElement : null) {
  if (!element) return
  Object.values(TOKEN_VARS).forEach((name) => element.style.removeProperty(name))
  delete element.dataset.clientColor
}
