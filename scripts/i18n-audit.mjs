// German interface audit (run from the frontend root: `node scripts/i18n-audit.mjs`).
//
// 1. UI-looking string literals and JSX text in the dashboard screens that have no
//    German entry — they show in English because t() falls back to the source.
// 2. German entries whose value is still the English source, apart from proper
//    names, product names, metric abbreviations and German words spelled the same.
// Exit code 1 when either list is not empty.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import * as espree from 'espree'

const SRC = path.resolve('src')
const { default: de } = await import(pathToFileURL(path.join(SRC, 'locales', 'de.js')).href)

const SCREENS = ['Dashboard.jsx', 'AdsWorkspace.jsx', 'ContentWorkspace.jsx', 'SrsWorkspace.jsx', 'AiEmployee.jsx', 'dashboardUI.jsx', 'AccountMenu.jsx']
// Not interface language: proper names, products, abbreviations, demo data, and German example phrases.
const NAMES = new Set(['Alex Kim', 'Apple', 'Google', 'Facebook', 'Instagram', 'Meta', 'Meta Ads', 'Jamie Lee', 'MARKETEER / SETUP', 'MARKETEER AI', 'Marketeer',
  'Marketeer.', 'M↗', '⇧ N', 'Polymechaniker/in EFZ', 'Schwyz', 'Personal Sigma.', 'PERSONAL SIGMA SCHWYZ', '© 2026 Marketeer · Personal Sigma Schwyz AG',
  'CPC', 'CPL', 'CTR', 'CPM', 'Higgsfield', 'Story', 'Reel', 'Jetzt bewerben', 'Traumjob', 'Escape', 'Enter', 'Tab', 'Home', 'End', 'ArrowDown', 'ArrowUp'])
// German words that are spelled exactly like the English source.
const SAME_IN_GERMAN = new Set(['Budget', 'Details', 'Format', 'Hashtags', 'Emojis', 'Logo', 'Name', 'Status', 'Radius', 'Position', 'Lead', 'Leads',
  'Optional', 'Person', 'Regional', 'Hybrid', 'Mission', 'Website', 'Traffic', 'Smart', 'Dashboard', 'Feed'])

// A literal looks like interface text: starts with a capital letter, has a lowercase letter, no code-ish characters.
const looksLikeUi = (s) => /^[A-Z][^]*[a-z]/.test(s) && s.length >= 3 && !/[{}<>=_/\\]|^[A-Z][a-z]+[A-Z]|^https?:|\.(js|jsx|css|png|svg)$/.test(s) && !/^[A-Z_]+$/.test(s)

function walk(node, visit, parent) {
  if (!node || typeof node.type !== 'string') return
  visit(node, parent)
  for (const key of Object.keys(node)) {
    if (key === 'parent') continue
    const value = node[key]
    if (Array.isArray(value)) value.forEach((child) => walk(child, visit, node))
    else if (value && typeof value.type === 'string') walk(value, visit, node)
  }
}

const missing = new Map()
for (const file of SCREENS) {
  const code = fs.readFileSync(path.join(SRC, file), 'utf8')
  const ast = espree.parse(code, { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true }, loc: true })
  walk(ast, (node, parent) => {
    let text = null
    if (node.type === 'Literal' && typeof node.value === 'string') {
      // Skip imports, object keys, className / key / type / value / icon props, and comparisons.
      if (parent?.type === 'ImportDeclaration' || (parent?.type === 'Property' && parent.key === node)) return
      if (parent?.type === 'JSXAttribute' && !['label', 'placeholder', 'title', 'aria-label', 'alt', 'hint', 'body', 'eyebrow', 'description'].includes(parent.name?.name)) return
      if (parent?.type === 'BinaryExpression') return
      text = node.value
    } else if (node.type === 'JSXText') {
      text = node.value.trim()
    }
    if (!text || !looksLikeUi(text) || text in de || NAMES.has(text)) return
    const where = `${file}:${node.loc.start.line}`
    missing.set(text, [...(missing.get(text) || []), where])
  })
}

const same = Object.entries(de).filter(([k, v]) => k === v && !NAMES.has(k) && !SAME_IN_GERMAN.has(k))

console.log(`Interface text with no German entry: ${missing.size}`)
for (const [text, where] of missing) console.log(`  ${JSON.stringify(text)}  ${where.slice(0, 3).join(', ')}`)
console.log(`German entries still equal to the English: ${same.length}`)
for (const [k] of same) console.log(`  ${JSON.stringify(k)}`)
process.exit(missing.size || same.length ? 1 : 0)
