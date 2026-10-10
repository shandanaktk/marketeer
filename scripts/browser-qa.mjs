// Local browser QA using Chrome's DevTools protocol. No runtime dependency.
import { writeFile, mkdir } from 'node:fs/promises'
const [,, mode = 'landing', width = '1365', height = '768'] = process.argv
const tabs = await fetch('http://127.0.0.1:9222/json').then(r => r.json())
const page = tabs.find(t => t.type === 'page')
if (!page) throw new Error('No Chrome page available')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }))
let counter = 0
const pending = new Map()
const errors = []
ws.addEventListener('message', e => {
  const msg = JSON.parse(e.data)
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.text + ': ' + msg.params.exceptionDetails.exception?.description)
  if (msg.method === 'Network.loadingFailed' && !msg.params.canceled) errors.push(msg.params.errorText)
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) reject(new Error(JSON.stringify(msg.error)))
    else resolve(msg.result)
  }
})
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++counter
  pending.set(id, { resolve, reject })
  ws.send(JSON.stringify({ id, method, params }))
})
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
const screenshot = async name => {
  await mkdir('qa', { recursive: true })
  const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  await writeFile(`qa/${name}.png`, Buffer.from(result.data, 'base64'))
}
await send('Page.enable')
await send('Runtime.enable')
await send('Network.enable')
await send('Emulation.setDeviceMetricsOverride', { width: +width, height: +height, deviceScaleFactor: 1, mobile: false })
const route = mode.startsWith('dashboard') ? '/?view=dashboard' : mode.startsWith('signup') ? '/?view=signup' : mode.startsWith('onboarding') ? '/?view=onboarding' : '/'
await send('Page.navigate', { url: `http://127.0.0.1:5173${route}` })
await sleep(1800)
await evaluate(`localStorage.setItem('marketeer-theme','${mode.includes('dark') ? 'dark' : 'light'}')`)
await send('Page.reload')
await sleep(2700)
await evaluate('document.fonts.ready')
for (let attempt = 0; attempt < 30; attempt++) {
  if (await evaluate(`!document.querySelector('.mk-loader') && !!document.querySelector('h1')`)) break
  await sleep(200)
}
await sleep(1500)
console.log('PAGE', JSON.stringify(await evaluate(`({title:document.title,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,font:getComputedStyle(document.querySelector('h1')).fontFamily,theme:document.documentElement.dataset.theme,images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)})`)))
await screenshot(`${mode}-${width}`)
if (mode.startsWith('dashboard') && mode.includes('account')) {
  const assert = async (label, expression) => {
    if (!await evaluate(expression)) throw new Error(`Account menu check failed: ${label}`)
    console.log('PASS', label)
  }
  await assert('Header search hidden', `!document.querySelector('.db-topbar .db-search')`)
  await evaluate(`document.getElementById('account-menu-trigger').click()`)
  await sleep(250)
  await assert('Menu opens and focuses Settings', `document.activeElement.textContent.includes('Settings') && document.querySelectorAll('#account-menu [role="menuitem"]').length === 2`)
  await screenshot(`${mode}-${width}-open`)
  await assert('Popover fits viewport', `document.querySelector('.db-account-popover').getBoundingClientRect().right <= innerWidth && document.querySelector('.db-account-popover').getBoundingClientRect().left >= 0`)
  await evaluate(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}))`)
  await assert('Arrow keys select Log out', `document.activeElement.textContent.includes('Log out')`)
  await evaluate(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`)
  await assert('Escape closes and restores focus', `!document.getElementById('account-menu') && document.activeElement.id === 'account-menu-trigger'`)
  await evaluate(`document.getElementById('account-menu-trigger').click()`)
  await sleep(100)
  await evaluate(`document.querySelector('.db-main-content').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`)
  await assert('Outside click closes', `!document.getElementById('account-menu')`)
  await evaluate(`document.getElementById('account-menu-trigger').click()`)
  await sleep(100)
  await evaluate(`document.querySelector('#account-menu a').click()`)
  await sleep(250)
  await assert('Settings link navigates and closes', `location.search.includes('tab=settings') && !document.getElementById('account-menu') && document.querySelector('.db-main-content h1').textContent.includes('on brand')`)
  const savedTheme = await evaluate(`localStorage.getItem('marketeer-theme')`)
  await evaluate(`localStorage.setItem('access_token','qa-only-token'); document.getElementById('account-menu-trigger').click()`)
  await sleep(100)
  await evaluate(`document.querySelector('#account-menu button').click()`)
  await sleep(1200)
  await assert('Log out redirects to sign-in and clears token', `location.search === '?view=signin' && !localStorage.getItem('access_token') && !!document.querySelector('.ob-auth-page') && !document.querySelector('.db-dashboard')`)
  await assert('Log out preserves theme', `localStorage.getItem('marketeer-theme') === ${JSON.stringify(savedTheme)}`)
}
if (mode.startsWith('landing')) {
  for (const id of ['content', 'platform', 'connect', 'meta', 'how']) {
    await evaluate(`document.getElementById('${id}').scrollIntoView({behavior:'instant',block:'start'})`)
    await sleep(1000)
    await screenshot(`${mode}-${width}-${id}`)
  }
  await evaluate(`window.scrollTo({top:document.querySelector('.mk-product-tabs').getBoundingClientRect().top + scrollY - 110,behavior:'instant'})`)
  await sleep(700)
  for (const tab of ['plan', 'explore', 'collaborate', 'analyze', 'schedule']) {
    await evaluate(`document.getElementById('showcase-tab-${tab}').click()`)
    await sleep(550)
    console.log('TAB', tab, await evaluate(`document.getElementById('showcase-tab-${tab}').getAttribute('aria-selected')`))
    await screenshot(`${mode}-${width}-tab-${tab}`)
  }
  await evaluate(`document.querySelector('.mk-editor-tools button:nth-child(2)').click()`)
  console.log('AI_DEMO', await evaluate(`document.getElementById('demo-caption').value.startsWith('Good design')`))
  await evaluate(`document.querySelector('.mk-channel-rail button[aria-label="Preview on facebook"]').click()`)
  console.log('PLATFORM_PREVIEW', await evaluate(`document.querySelector('.mk-preview-selector').textContent.trim()`))
  if (+width <= 700) {
    await evaluate(`document.querySelector('.mk-mobile-preview-toggle').click()`)
    await sleep(200)
    console.log('MOBILE_PREVIEW', await evaluate(`getComputedStyle(document.querySelector('.mk-post-preview')).display`))
    await screenshot(`${mode}-${width}-mobile-preview`)
    await evaluate(`document.querySelector('.mk-mobile-preview-toggle').click()`)
  }
  await evaluate(`document.getElementById('showcase-tab-schedule').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))`)
  console.log('KEYBOARD_TAB', await evaluate(`document.getElementById('showcase-tab-explore').getAttribute('aria-selected')`))
  await evaluate(`window.scrollTo({top:0,behavior:'instant'})`)
  await sleep(1200)
  await sleep(1000)
  const start = await evaluate(`getComputedStyle(document.querySelector('.mk-float')).transform`)
  await evaluate(`window.scrollTo({top:350,behavior:'instant'})`)
  await sleep(1200)
  const scrolled = await evaluate(`getComputedStyle(document.querySelector('.mk-float')).transform`)
  await screenshot(`${mode}-${width}-scroll-motion`)
  await evaluate(`window.scrollTo({top:0,behavior:'instant'})`)
  await sleep(1200)
  await sleep(1000)
  const returned = await evaluate(`getComputedStyle(document.querySelector('.mk-float')).transform`)
  console.log('HERO_MOTION', JSON.stringify({start, scrolled, returned, changes:start!==scrolled, restores:start===returned}))
  await evaluate(`document.querySelector('.mk-footer>button').click()`)
  console.log('PAUSE_MOTION', await evaluate(`getComputedStyle(document.querySelector('.mk-marquee-track')).animationPlayState`))
  await evaluate(`document.querySelector('.mk-footer>button').click()`)
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
  console.log('REDUCED_MOTION', await evaluate(`getComputedStyle(document.querySelector('.mk-marquee-track')).animationName`))
  await send('Emulation.setEmulatedMedia',{features:[]})
}
if (mode.includes('sweep') && mode.startsWith('dashboard')) {
  for (const name of ['Knowledge Base', 'Vacancies', 'Create', 'Content library', 'Calendar', 'Campaign studio', 'Campaigns', 'Reporting', 'Leads', 'Optimize', 'Asset library', 'Connections', 'Settings']) {
    await evaluate(`[...document.querySelectorAll('.db-nav-group button')].find(b=>b.querySelector('b').textContent===${JSON.stringify(name)}).click()`)
    await sleep(550)
    const state = await evaluate(`({heading:document.querySelector('.db-main-content h1')?.textContent,width:document.documentElement.scrollWidth,viewport:innerWidth})`)
    if (state.width > state.viewport) throw new Error(`${name} overflows: ${JSON.stringify(state)}`)
    console.log('WORKSPACE', name, JSON.stringify(state))
    await screenshot(`${mode}-${width}-${name.replaceAll(' ', '-').toLowerCase()}`)
  }
}
if (mode.startsWith('onboarding') && mode.includes('sweep')) {
  await evaluate(`[...document.querySelectorAll('.ob-choice-card')].find(b=>b.textContent.includes('Agency')).click()`)
  await evaluate(`document.querySelector('form.ob-step').requestSubmit()`)
  await sleep(350)
  await evaluate(`document.querySelector('.ob-skip').click()`)
  await sleep(350)
  await evaluate(`document.querySelector('.ob-goal-card').click()`)
  await evaluate(`document.querySelector('form.ob-step').requestSubmit()`)
  for (let step = 4; step <= 8; step++) {
    await sleep(400)
    console.log('ONBOARDING', step, await evaluate(`document.querySelector('.ob-screen-heading h1').textContent`))
    await screenshot(`${mode}-${width}-step-${step}`)
    if (step < 8) await evaluate(`document.querySelector('form.ob-step').requestSubmit()`)
  }
}
console.log('BROKEN_LOADED_IMAGES', JSON.stringify(await evaluate(`[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)`)))
console.log('ERRORS', JSON.stringify(errors))
ws.close()
if (errors.length) process.exitCode = 1
