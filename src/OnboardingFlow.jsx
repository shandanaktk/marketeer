import { useEffect, useRef, useState } from 'react'
import { DEFAULT_COUNTRY, LanguageButton, TIMEZONE, t } from './i18n.js'
import { currencySymbol } from './api.js'
import Dashboard from './Dashboard.jsx'
import { ThemeButton } from './theme.jsx'
import { COUNTRIES, RADII, isCountry } from './countries.js'
import {
  completeOnboarding, connectChannel, disconnectChannel, getChannels, getMe, getOnboarding, initialsOf,
  linkSocialLogin, login, saveOnboarding, scanWebsite, signup, startSocialLogin, uploadMedia,
} from './api.js'

const roles = [
  { name: 'Business Owner', icon: '↗', caption: 'Grow my own business' },
  { name: 'Marketer', icon: '✦', caption: 'Run marketing in-house' },
  { name: 'Agency', icon: '◎', caption: 'Manage multiple clients' },
  { name: 'Freelancer', icon: '⌁', caption: 'Create for my clients' },
]

const industries = [
  'Staffing & Recruitment',
  'E-commerce',
  'SaaS',
  'Local Service',
  'Real Estate',
  'Coaching/Consulting',
  'Health & Wellness',
  'Restaurant/Food',
  'Other',
]

const goals = [
  { name: 'Generate Leads', emoji: '🎯', detail: 'Turn attention into qualified prospects', tone: 'violet' },
  { name: 'Sell Products', emoji: '🛒', detail: 'Drive more purchases and revenue', tone: 'lime' },
  { name: 'Grow Social Following', emoji: '📈', detail: 'Build a community that keeps growing', tone: 'orange' },
  { name: 'Build Brand Awareness', emoji: '🌟', detail: 'Become the name people remember', tone: 'blue' },
]

const voices = ['Professional', 'Playful', 'Bold', 'Friendly', 'Luxury']

const palette = [
  '#B3DC1F', '#A1C631', '#E1FF74', '#00B2FF', '#1269CF', '#0A2463',
  '#000000', '#2E2E2E', '#585858', '#999999', '#F8F8F8', '#FFFFFF',
  '#D8315B', '#E47E3D', '#F0B429', '#0F766E', '#7C3AED', '#C8A791',
]

const DEFAULT_COLORS = ['#B3DC1F', '#000000', '#FFFFFF', '#00B2FF']
const TIMEZONES = [TIMEZONE, 'Europe/Berlin', 'Europe/Vienna', 'Europe/Paris', 'Europe/Rome', 'Europe/London', 'America/New_York']

const platforms = [
  { id: 'facebook', name: 'Facebook', detail: 'Pages, feed, and lead ads through the Meta Graph API', color: '#1877f2' },
  { id: 'instagram', name: 'Instagram', detail: 'Feed posts, stories, and reels through the Meta Graph API', color: '#c13584' },
]

// Answers saved to the server between steps (credentials never are).
const SAVED_KEYS = ['role', 'provider', 'businessName', 'industry', 'website', 'goals', 'logo', 'colors', 'voice', 'customVoice', 'description', 'postingPlatforms', 'postingFrequency', 'timezone', 'metaBudget', 'metaDuration', 'metaCountry', 'metaCity', 'metaRadius', 'connected', 'workspaceName', 'invites', 'logoPosition', 'logoSize', 'logoOnPosts']
const savable = (data) => Object.fromEntries(SAVED_KEYS.filter((key) => data[key] !== undefined).map((key) => [key, data[key]]))
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

function MenuField({ value, placeholder = 'Select', options, onChange, label }) {
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  useEffect(() => {
    const close = (event) => { if (root.current && !root.current.contains(event.target)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])
  const current = options.find((option) => (option.value ?? option) === value)
  const currentLabel = current ? (current.label ?? current) : ''
  return (
    <div className={`ob-menu ${open ? 'open' : ''}`} ref={root}>
      <button type="button" className="ob-menu-trigger" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen((state) => !state)}>
        <span className={currentLabel ? '' : 'is-placeholder'}>{currentLabel || placeholder}</span>
        <i aria-hidden="true" />
      </button>
      {open && <ul className={options.length > 5 ? 'is-grid' : ''} role="listbox" aria-label={label}>{options.map((option) => {
        const optionValue = option.value ?? option
        const optionLabel = option.label ?? option
        const selected = optionValue === value
        return <li key={optionValue}><button type="button" role="option" aria-selected={selected} className={selected ? 'selected' : ''} onClick={() => { onChange(optionValue); setOpen(false) }}><span>{optionLabel}</span>{selected && <CheckIcon />}</button></li>
      })}</ul>}
    </div>
  )
}

function ArrowIcon({ back = false }) {
  return (
    <svg className={back ? 'ob-arrow ob-arrow-back' : 'ob-arrow'} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4.5 10h11M11.5 5.5 16 10l-4.5 4.5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4.5 10.2 3.4 3.4 7.7-7.7" />
    </svg>
  )
}

function EyeIcon({ closed }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z" />
      <circle cx="12" cy="12" r="2.4" />
      {closed && <path d="m4 4 16 16" />}
    </svg>
  )
}

function GoogleLogo() {
  return (
    <svg className="google-mark" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  )
}

function AppleLogo() {
  return (
    <svg className="apple-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16.37 12.72c-.03-2.72 2.22-4.02 2.32-4.09-1.27-1.85-3.24-2.1-3.93-2.13-1.67-.17-3.26.98-4.11.98-.85 0-2.16-.96-3.55-.93-1.83.03-3.51 1.06-4.45 2.7-1.9 3.29-.49 8.16 1.36 10.83.9 1.31 1.98 2.77 3.39 2.72 1.36-.06 1.88-.88 3.53-.88 1.64 0 2.11.88 3.55.85 1.46-.02 2.39-1.33 3.29-2.64.1-.15 1.79-2.48 1.83-2.53-.04-.02-3.49-1.34-3.53-5.31zM14.3 5.3c.75-.91 1.25-2.17 1.11-3.43-1.08.04-2.38.72-3.15 1.62-.69.8-1.3 2.08-1.14 3.31 1.2.09 2.43-.61 3.18-1.5z" />
    </svg>
  )
}

function Wordmark({ onHome }) {
  return (
    <button className="ob-wordmark" type="button" onClick={onHome} aria-label={t('Back to Marketeer home')}>
      Marketeer<span>.</span>
    </button>
  )
}

function AmbientBackground() {
  return (
    <div className="ob-ambient" aria-hidden="true">
      <span className="ob-orb ob-orb-blue" />
      <span className="ob-orb ob-orb-pink" />
      <span className="ob-orb-lime" />
      <span className="ob-grid" />
      <span className="ob-noise" />
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <label className="ob-field">
      <span className="ob-field-label">{label}{hint && <small>{hint}</small>}</span>
      {children}
    </label>
  )
}

function AuthScreen({ mode, onNavigate, onSignedIn }) {
  const isSignIn = mode === 'signin'
  const params = new URLSearchParams(window.location.search)
  const [account, setAccount] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(params.get('auth_error') || (params.get('expired') ? t('Your session expired. Please sign in again.') : ''))
  const [busy, setBusy] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    if ((!isSignIn && !account.name.trim()) || !account.email.trim() || !account.password.trim()) {
      setError(t('Add your details to continue.'))
      return
    }
    if (!isEmail(account.email)) { setError(t('Enter a valid email address.')); return }
    if (!isSignIn && account.password.length < 8) { setError(t('Use at least 8 characters for your password.')); return }
    setError('')
    setBusy('email')
    try {
      const user = isSignIn
        ? await login({ email: account.email.trim(), password: account.password })
        : await signup({ name: account.name.trim(), email: account.email.trim(), password: account.password })
      onSignedIn(user, account.password)
    } catch (failure) {
      setError(failure.message)
      setBusy('')
    }
  }

  const social = async (provider) => {
    setError('')
    setBusy(provider)
    try { await startSocialLogin(provider, isSignIn ? 'signin' : 'signup') } catch (failure) { setError(failure.message); setBusy('') }
  }

  return (
    <main className="ob-auth-page">
      <AmbientBackground />
      <nav className="ob-auth-nav">
        <Wordmark onHome={() => onNavigate('home')} />
        <p>
          {isSignIn ? t('New to Marketeer?') : t('Already have an account?')}
          <button type="button" onClick={() => onNavigate(isSignIn ? 'signup' : 'signin')}>
            {isSignIn ? t('Create account') : t('Sign in')}
          </button>
        </p>
      </nav>

      <div className="ob-auth-layout">
        <section className="ob-auth-story" aria-label={t('Marketeer introduction')}>
          <div className="ob-kicker"><span>✦</span> {t('AI-powered campaign studio')}</div>
          <h1>{isSignIn ? <>{t('Welcome')}<br /><em>{t('back.')}</em></> : <>{t('Your ideas.')}<br /><em>{t('Everywhere.')}</em></>}</h1>
          <p>{isSignIn ? t('Your next campaign is closer than you think.') : t('Build campaigns, create on-brand content, and publish across every feed—all in one place.')}</p>
          <div className="ob-story-preview">
            <div className="ob-preview-card preview-one"><span>{t('NEW CAMPAIGN')}</span><b>{t('Less setup.')}<br />{t('More impact.')}</b><i>↗</i></div>
            <div className="ob-preview-card preview-two"><span>{t('READY TO POST')}</span><b>{t('Meet your')}<br /><em>{t('new routine.')}</em></b><i>✦</i></div>
            <div className="ob-preview-card preview-three"><span>{t('MARKETEER AI')}</span><b>{t('12 ideas')}</b><small>{t('generated in 8 sec')}</small></div>
          </div>
          <div className="ob-auth-proof"><span>4.8</span><div>★★★★★<small>{t('Trusted across Central Switzerland')}</small></div></div>
        </section>

        <section className="ob-glass ob-auth-card">
          <div className="ob-card-glint" />
          <div className="ob-auth-heading">
            <span className="ob-mini-index">{isSignIn ? t('WELCOME BACK') : t('START FOR FREE')}</span>
            <h2>{isSignIn ? t('Sign in to Marketeer') : t('Create your account')}</h2>
            <p>{isSignIn ? t('Pick up right where you left off.') : t('No credit card. Just better marketing.')}</p>
          </div>

          <div className="ob-social-row">
            <button type="button" disabled={Boolean(busy)} onClick={() => social('google')}><GoogleLogo /> {busy === 'google' ? t('Opening…') : t('Google')}</button>
            <button type="button" disabled={Boolean(busy)} onClick={() => social('apple')}><AppleLogo /> {busy === 'apple' ? t('Opening…') : t('Apple')}</button>
          </div>
          <div className="ob-divider"><span>{t('or use email')}</span></div>

          <form onSubmit={submit} className="ob-auth-form">
            {!isSignIn && (
              <Field label={t('Your name')}>
                <input value={account.name} onChange={(event) => setAccount((current) => ({ ...current, name: event.target.value }))} placeholder={t('Your full name')} autoComplete="name" />
              </Field>
            )}
            <Field label={t('Email address')}>
              <input type="email" value={account.email} onChange={(event) => setAccount((current) => ({ ...current, email: event.target.value }))} placeholder={t('you@company.com')} autoComplete="email" />
            </Field>
            <Field label={t('Password')}>
              <span className="ob-password-wrap">
                <input type={showPassword ? 'text' : 'password'} value={account.password} onChange={(event) => setAccount((current) => ({ ...current, password: event.target.value }))} placeholder={t('8+ characters')} autoComplete={isSignIn ? 'current-password' : 'new-password'} />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? t('Hide password') : t('Show password')}><EyeIcon closed={showPassword} /></button>
              </span>
            </Field>
            {error && <p className="ob-form-error" role="alert">{error}</p>}
            <button className="ob-primary ob-auth-submit" type="submit" disabled={Boolean(busy)}>
              <span>{busy === 'email' ? (isSignIn ? t('Signing in…') : t('Creating your account…')) : isSignIn ? t('Sign in') : t('Create free account')}</span><i><ArrowIcon /></i>
            </button>
          </form>
          <p className="ob-legal">{t('By continuing, you agree to our')} <button type="button" className="ob-legal-link" onClick={() => onNavigate('terms')}>{t('Terms')}</button> {t('and')} <button type="button" className="ob-legal-link" onClick={() => onNavigate('privacy')}>{t('Privacy Policy')}</button>.</p>
        </section>
      </div>
    </main>
  )
}

function ScreenHeading({ index, eyebrow, title, subtitle }) {
  return (
    <header className="ob-screen-heading">
      <div className="ob-screen-kicker"><span>{String(index).padStart(2, '0')}</span>{eyebrow}</div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  )
}

function FooterActions({ onBack, onContinue, skipLabel, onSkip, continueLabel, disabled = false, busy = false }) {
  return (
    <footer className="ob-form-actions">
      <button className="ob-back" type="button" onClick={onBack}><ArrowIcon back /> {t('Back')}</button>
      <div>
        {skipLabel && <button className="ob-skip" type="button" onClick={onSkip} disabled={busy}>{skipLabel}</button>}
        <button className="ob-primary" type="submit" onClick={onContinue} disabled={disabled || busy}>
          <span>{busy ? t('Saving…') : continueLabel || t('Continue')}</span><i><ArrowIcon /></i>
        </button>
      </div>
    </footer>
  )
}

function BasicsStep({ data, setData, onBack, onContinue, busy }) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [linking, setLinking] = useState('')
  const submit = (event) => {
    event.preventDefault()
    if (!data.email.trim() || !data.role) {
      setError(t('Add your account details and choose the option that fits you best.'))
      return
    }
    if (!isEmail(data.email)) { setError(t('Enter a valid email address.')); return }
    if (data.password && data.password.length < 8) { setError(t('Passwords need at least 8 characters.')); return }
    setError('')
    onContinue()
  }
  const link = async (provider) => {
    setError('')
    setLinking(provider)
    try {
      await saveOnboarding(1, savable(data))
      await linkSocialLogin(provider)
    } catch (failure) {
      setError(failure.message)
      setLinking('')
    }
  }

  return (
    <form className="ob-step" onSubmit={submit}>
      <ScreenHeading index={1} eyebrow={t('Account basics')} title={<>{t('Welcome to')} <em>{t('Marketeer.')}</em></>} subtitle={t('Let’s get your account set up in under 2 minutes.')} />
      <div className="ob-two-fields">
        <Field label={t('Email')}>
          <input type="email" value={data.email} onChange={(event) => setData({ ...data, email: event.target.value })} autoComplete="email" />
        </Field>
        <Field label={t('Password')} hint={data.hasPassword ? t('Leave blank to keep') : t('Optional')}>
          <span className="ob-password-wrap">
            <input type={showPassword ? 'text' : 'password'} value={data.password} onChange={(event) => setData({ ...data, password: event.target.value })} autoComplete="new-password" placeholder={data.hasPassword ? '••••••••' : t('8+ characters')} />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={t('Toggle password visibility')}><EyeIcon closed={showPassword} /></button>
          </span>
        </Field>
      </div>
      <div className="ob-inline-divider"><span>{t('or continue with')}</span></div>
      <div className="ob-social-row compact">
        <button type="button" disabled={Boolean(linking)} onClick={() => link('google')} className={data.providers?.includes('google') ? 'selected' : ''}><GoogleLogo /> {linking === 'google' ? t('Opening…') : t('Google')} {data.providers?.includes('google') && <CheckIcon />}</button>
        <button type="button" disabled={Boolean(linking)} onClick={() => link('apple')} className={data.providers?.includes('apple') ? 'selected' : ''}><AppleLogo /> {linking === 'apple' ? t('Opening…') : t('Apple')} {data.providers?.includes('apple') && <CheckIcon />}</button>
      </div>
      <fieldset className="ob-choice-set">
        <legend>{t('What best describes you?')}</legend>
        <div className="ob-role-grid">
          {roles.map((role) => (
            <button key={role.name} type="button" className={data.role === role.name ? 'ob-choice-card selected' : 'ob-choice-card'} onClick={() => setData({ ...data, role: role.name })}>
              <i>{role.icon}</i><span><b>{t(role.name)}</b><small>{t(role.caption)}</small></span><em><CheckIcon /></em>
            </button>
          ))}
        </div>
      </fieldset>
      {error && <p className="ob-form-error" role="alert">{error}</p>}
      <FooterActions onBack={onBack} busy={busy} />
    </form>
  )
}

function BusinessStep({ data, setData, onBack, onContinue, busy }) {
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const scan = async () => {
    if (!data.website || data.scannedWebsite === data.website) return data
    setScanning(true)
    try {
      const found = await scanWebsite(data.website)
      const next = {
        ...data,
        scannedWebsite: data.website,
        description: data.description || (found.description || '').slice(0, 240),
        colors: (found.colors?.length && data.colors.join() === DEFAULT_COLORS.join()) ? [...found.colors, ...DEFAULT_COLORS].slice(0, Math.max(2, Math.min(4, found.colors.length + 1))) : data.colors,
        logo: data.logo || found.logo_url || '',
        scanned: true,
      }
      setData(next)
      return next
    } catch {
      const next = { ...data, scannedWebsite: data.website, scanned: false }
      setData(next)
      return next
    } finally {
      setScanning(false)
    }
  }
  const submit = async (event) => {
    event.preventDefault()
    if (!data.businessName.trim() || !data.industry) {
      setError(t('Add a business name and choose an industry to continue.'))
      return
    }
    setError('')
    onContinue(await scan())
  }
  return (
    <form className="ob-step" onSubmit={submit}>
      <ScreenHeading index={2} eyebrow={t('Your business')} title={<>{t('Tell us about')}<br /><em>{t('your business.')}</em></>} subtitle={t('This helps Marketeer understand what you do and who you’re talking to.')} />
      <div className="ob-business-fields">
        <Field label={t('Business name')}>
          <input value={data.businessName} onChange={(event) => setData({ ...data, businessName: event.target.value })} placeholder={t('e.g. Personal Sigma Schwyz AG')} autoFocus />
        </Field>
        <div className="ob-field">
          <span className="ob-field-label">{t('Industry')}</span>
          <MenuField label={t('Industry')} placeholder={t('Select your industry')} value={data.industry} options={industries.map((industry) => ({ value: industry, label: t(industry) }))} onChange={(industry) => setData({ ...data, industry })} />
        </div>
        <Field label={t('Website URL')} hint={t('Optional')}>
          <span className="ob-url-wrap"><i>https://</i><input value={data.website} onChange={(event) => setData({ ...data, website: event.target.value.replace(/^https?:\/\//, '') })} placeholder="ihr-unternehmen.ch" inputMode="url" /></span>
        </Field>
        {data.website && <div className="ob-smart-note"><span>✦</span><p><b>{scanning ? t('Scanning your site…') : t('Website detected')}</b>{t('We’ll scan your site to auto-fill your branding in the next step.')}</p></div>}
      </div>
      {error && <p className="ob-form-error" role="alert">{error}</p>}
      <FooterActions onBack={onBack} skipLabel={t('Skip for now')} onSkip={() => onContinue(data)} busy={busy || scanning} continueLabel={scanning ? t('Scanning…') : t('Continue')} />
    </form>
  )
}

function GoalsStep({ data, setData, onBack, onContinue, busy }) {
  const toggleGoal = (goal) => {
    const goalsNext = data.goals.includes(goal) ? data.goals.filter((item) => item !== goal) : [...data.goals, goal]
    setData({ ...data, goals: goalsNext })
  }
  return (
    <form className="ob-step" onSubmit={(event) => { event.preventDefault(); onContinue() }}>
      <ScreenHeading index={3} eyebrow={t('Your goals')} title={<>{t('What are you hoping')}<br /><em>{t('to achieve?')}</em></>} subtitle={t('Pick as many as apply—we’ll tailor your dashboard around this.')} />
      <div className="ob-goal-grid">
        {goals.map((goal) => (
          <button type="button" key={goal.name} className={`ob-goal-card ${goal.tone} ${data.goals.includes(goal.name) ? 'selected' : ''}`} onClick={() => toggleGoal(goal.name)}>
            <span className="ob-goal-emoji">{goal.emoji}</span><em><CheckIcon /></em>
            <b>{t(goal.name)}</b><small>{t(goal.detail)}</small>
          </button>
        ))}
      </div>
      <p className="ob-selection-count">{data.goals.length === 1 ? t('1 goal selected') : t('{n} goals selected', { n: data.goals.length || t('No') })}</p>
      <FooterActions onBack={onBack} disabled={!data.goals.length} busy={busy} />
    </form>
  )
}

function BrandStep({ data, setData, onBack, onContinue, busy }) {
  const paletteRef = useRef(null)
  const [error, setError] = useState('')
  const [paletteFor, setPaletteFor] = useState(null)
  const updateColor = (index, value) => {
    const colors = [...data.colors]
    colors[index] = value
    setData({ ...data, colors })
  }
  useEffect(() => {
    if (paletteFor === null) return undefined
    const close = (event) => {
      if (paletteRef.current?.contains(event.target)) return
      setPaletteFor(null)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [paletteFor])
  const choosePaletteColor = (color) => {
    const next = color.toUpperCase()
    if (paletteFor === 'add') {
      if (data.colors.length >= 6 || data.colors.some((item) => item.toUpperCase() === next)) return
      setData({ ...data, colors: [...data.colors, next] })
      return
    }
    if (typeof paletteFor === 'number') updateColor(paletteFor, next)
  }
  const submit = (event) => {
    event.preventDefault()
    if (data.colors.some((color) => !/^#[0-9a-fA-F]{6}$/.test(color))) { setError(t('Use six-digit hex colors, like #B3DC1F.')); return }
    onContinue()
  }
  return (
    <form className="ob-step" onSubmit={submit}>
      <ScreenHeading index={4} eyebrow={t('Brand identity')} title={<>{t('Let’s set up')}<br /><em>{t('your brand.')}</em></>} subtitle={data.scanned ? t('We pulled a starting point from your website—feel free to adjust anything.') : t('Give Marketeer a feel for your look, sound, and story.')} />
      <div className="ob-brand-layout">
        <div className="ob-brand-left">
          <div className="ob-color-block">
            <div className="ob-field-label">{t('Brand colors')} <small>{t('Pick from the palette or type a hex')}</small></div>
            <div className="ob-color-strip">
              {data.colors.map((color, index) => (
                <div className="ob-color-chip" key={index}>
                  <button type="button" className={`ob-color-swatch ${paletteFor === index ? 'is-editing' : ''}`} style={{ background: color }} aria-label={t('Edit brand color {n}', { n: index + 1 })} onClick={() => setPaletteFor(index)} />
                  <input className="ob-color-hex" aria-label={t('Hex for brand color {n}', { n: index + 1 })} value={color} maxLength={7} onChange={(event) => updateColor(index, event.target.value.startsWith('#') ? event.target.value : `#${event.target.value}`)} />
                  {data.colors.length > 2 && <button type="button" aria-label={t('Remove color {color}', { color })} onClick={() => setData({ ...data, colors: data.colors.filter((_, item) => item !== index) })}>×</button>}
                </div>
              ))}
              {data.colors.length < 6 && <button className={`ob-color-add ${paletteFor === 'add' ? 'is-open' : ''}`} type="button" onClick={() => setPaletteFor(paletteFor === 'add' ? null : 'add')}><b>+</b><small>{t('Custom')}</small></button>}
            </div>
            {paletteFor !== null && (
              <div className="ob-palette" ref={paletteRef}>
                <p>{paletteFor === 'add' ? t('Add a brand color') : t('Replace this color')}</p>
                <div className="ob-palette-grid">
                  {palette.map((color) => {
                    const used = data.colors.some((item) => item.toUpperCase() === color)
                    const current = paletteFor !== 'add' && data.colors[paletteFor]?.toUpperCase() === color
                    return <button type="button" key={color} className={current ? 'is-current' : used ? 'is-used' : ''} style={{ background: color }} aria-label={color} onClick={() => choosePaletteColor(color)} />
                  })}
                </div>
                <label className="ob-palette-any">
                  {t('Any color')}
                  <input type="color" aria-label={t('Pick any color')} value={/^#[0-9a-fA-F]{6}$/.test(paletteFor === 'add' ? '#b3dc1f' : data.colors[paletteFor] || '') ? (paletteFor === 'add' ? '#b3dc1f' : data.colors[paletteFor]) : '#b3dc1f'} onChange={(event) => choosePaletteColor(event.target.value)} />
                </label>
              </div>
            )}
          </div>
        </div>
        <div className="ob-brand-right">
          <div className="ob-voice-block">
            <div className="ob-field-label">{t('Brand voice')} <small>{t('Select one')}</small></div>
            <div className="ob-voice-options">
              {voices.map((voice) => <button type="button" key={voice} className={data.voice === voice ? 'selected' : ''} onClick={() => setData({ ...data, voice, customVoice: '' })}>{t(voice)}</button>)}
            </div>
            <input className="ob-own-voice" value={data.customVoice} onChange={(event) => setData({ ...data, customVoice: event.target.value, voice: '' })} placeholder={t('Or describe your own voice...')} />
          </div>
          <Field label={t('Short business description')}>
            <span className="ob-textarea-wrap"><textarea maxLength="240" value={data.description} onChange={(event) => setData({ ...data, description: event.target.value })} placeholder={t('In a sentence or two, what does your business do?')} /><small>{data.description.length}/240</small></span>
          </Field>
          <div className="ob-ai-note"><span>✦</span><p>{t('This is what Marketeer’s AI will use to write and design everything on your behalf.')}</p></div>
        </div>
      </div>
      {error && <p className="ob-form-error" role="alert">{error}</p>}
      <FooterActions onBack={onBack} busy={busy} />
    </form>
  )
}

const LOGO_POSITIONS = [['top-left', 'Top left'], ['top-right', 'Top right'], ['bottom-left', 'Bottom left'], ['bottom-right', 'Bottom right']]
const LOGO_WIDTH = { Small: 24, Medium: 33, Large: 44 }

function LogoStep({ data, setData, onBack, onContinue, busy }) {
  const uploadRef = useRef(null)
  const [logoName, setLogoName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const handleLogo = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setLogoName(file.name)
    setUploading(true)
    setError('')
    try {
      const stored = await uploadMedia(file)
      setData({ ...data, logo: stored.url, logoOnPosts: true })
    } catch (failure) {
      setError(failure.message)
      setLogoName('')
    } finally {
      setUploading(false)
    }
  }
  const [primary = '#0A2463', accent = '#3E92CC'] = data.colors
  return (
    <form className="ob-step" onSubmit={(event) => { event.preventDefault(); onContinue() }}>
      <ScreenHeading index={5} eyebrow={t('Your logo')} title={<>{t('Sign every post')}<br /><em>{t('with your logo.')}</em></>} subtitle={t('Upload it once. Marketeer places it on every post, story, reel and ad image it creates.')} />
      <div className="ob-logo-layout">
        <div className="ob-logo-controls">
          <div className="ob-field-label">{t('Logo')} <small>{t('PNG with a transparent background works best')}</small></div>
          <button className="ob-upload" type="button" onClick={() => uploadRef.current?.click()}>
            <input ref={uploadRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogo} tabIndex="-1" />
            {data.logo ? <img src={data.logo} alt={t('Uploaded logo preview')} /> : <span>{initialsOf(data.businessName || data.name)}</span>}
            <p><b>{uploading ? t('Uploading…') : logoName || (data.logo ? t('Your logo') : t('Upload your logo'))}</b><small>{data.logo ? t('Click to replace') : t('PNG, JPG or WebP')}</small></p><i>↑</i>
          </button>
          <button type="button" className={`ob-rule-toggle ${data.logoOnPosts ? 'on' : ''}`} disabled={!data.logo} onClick={() => setData({ ...data, logoOnPosts: !data.logoOnPosts })}><span><i /></span><p><b>{t('Add my logo to every post')}</b><small>{t('You can switch it off or move it later in the Knowledge Base.')}</small></p></button>
          <div className="ob-field-label">{t('Position')}</div>
          <div className="ob-logo-corners">{LOGO_POSITIONS.map(([id, label]) => <button type="button" key={id} className={data.logoPosition === id ? 'selected' : ''} onClick={() => setData({ ...data, logoPosition: id })}><i className={id} />{t(label)}</button>)}</div>
          <div className="ob-field-label">{t('Size')}</div>
          <div className="ob-voice-options">{['Small', 'Medium', 'Large'].map((size) => <button type="button" key={size} className={data.logoSize === size ? 'selected' : ''} onClick={() => setData({ ...data, logoSize: size })}>{t(size)}</button>)}</div>
        </div>
        <div className="ob-logo-preview" style={{ '--logo-a': primary, '--logo-b': accent }}>
          <div className={`ob-logo-canvas ${data.logoPosition}`}>
            {data.logo && data.logoOnPosts ? <img src={data.logo} alt="" style={{ width: `${LOGO_WIDTH[data.logoSize] || 33}%` }} /> : <span className="ob-logo-name">{(data.businessName || t('Your brand')).toUpperCase()}</span>}
            <strong>{t('YOUR NEXT')}<br /><em>{t('BIG MESSAGE')}</em></strong>
          </div>
          <small>{t('Preview of a generated feed post')}</small>
        </div>
      </div>
      {error && <p className="ob-form-error" role="alert">{error}</p>}
      <FooterActions onBack={onBack} skipLabel={data.logo ? '' : t('I’ll add it later')} onSkip={onContinue} busy={busy || uploading} />
    </form>
  )
}

function AutomationStep({ data, setData, onBack, onContinue, busy }) {
  const [error, setError] = useState('')
  const togglePlatform = (platform) => setData({
    ...data,
    postingPlatforms: data.postingPlatforms.includes(platform)
      ? data.postingPlatforms.filter((item) => item !== platform)
      : [...data.postingPlatforms, platform],
  })
  const timezones = TIMEZONES.includes(data.timezone) ? TIMEZONES : [data.timezone, ...TIMEZONES]
  const submit = (event) => {
    event.preventDefault()
    if (!(Number(data.metaBudget) >= 5)) { setError(t('The daily budget needs to be at least {amount}.', { amount: `${currencySymbol()} 5` })); return }
    if (!isCountry(data.metaCountry)) { setError(t('Choose the country you hire in from the list — Meta needs it to target recruitment ads.')); return }
    setError('')
    onContinue()
  }

  return (
    <form className="ob-step" onSubmit={submit}>
      <ScreenHeading index={6} eyebrow={t('Automation rules')} title={<>{t('Set the rhythm.')}<br /><em>{t('We’ll run it.')}</em></>} subtitle={t('Choose the publishing cadence and recruitment ad defaults Marketeer should apply automatically.')} />
      <div className="ob-automation-layout">
        <section>
          <header className="ob-rule-head"><b>{t('Organic publishing')}</b><small>{t('Select every channel Marketeer should post to')}</small></header>
          <div className="ob-rule-platforms">
            {[{ name: 'Instagram', detail: t('Feed, stories, and reels') }, { name: 'Facebook', detail: t('Pages, feed, and lead ads') }].map((platform) => <button type="button" className={data.postingPlatforms.includes(platform.name) ? 'selected' : ''} onClick={() => togglePlatform(platform.name)} key={platform.name}><img src={`/social_logos/${platform.name.toLowerCase()}.png`} alt="" /><span><b>{platform.name}</b><small>{platform.detail}</small></span><i><CheckIcon /></i></button>)}
          </div>
          <p className="ob-rhythm-note"><b>{data.postingPlatforms.length === 1 ? t('1 channel') : t('{n} channels', { n: data.postingPlatforms.length || t('No') })}</b> · {t(data.postingFrequency)} · {data.timezone.replace('_', ' ')}</p>
          <div className="ob-two-fields">
            <div className="ob-field"><span className="ob-field-label">{t('Publishing frequency')}</span><MenuField label={t('Publishing frequency')} value={data.postingFrequency} options={['3 posts per week', '4 posts per week', '5 posts per week', 'Daily'].map((item) => ({ value: item, label: t(item) }))} onChange={(postingFrequency) => setData({ ...data, postingFrequency })} /></div>
            <div className="ob-field"><span className="ob-field-label">{t('Timezone')}</span><MenuField label={t('Timezone')} value={data.timezone} options={timezones} onChange={(timezone) => setData({ ...data, timezone })} /></div>
          </div>
        </section>
        <section className="ob-meta-rules">
          <header className="ob-rule-head"><b>{t('Meta recruitment ads')}</b><small>{t('Employment defaults stay locked for compliance')}</small></header>
          <div className="ob-two-fields">
            <Field label={t('Daily budget')}><span className="ob-budget-input"><i>{currencySymbol()}</i><input type="number" min="5" value={data.metaBudget} onChange={(event) => setData({ ...data, metaBudget: event.target.value })} /></span></Field>
            <div className="ob-field"><span className="ob-field-label">{t('Campaign duration')}</span><MenuField label={t('Campaign duration')} value={data.metaDuration} options={[{ value: '14', label: t('14 days') }, { value: '21', label: t('21 days') }, { value: '30', label: t('30 days') }]} onChange={(metaDuration) => setData({ ...data, metaDuration })} /></div>
          </div>
          <div className="ob-two-fields">
            <Field label={t('Hiring country')}><input list="ob-country-list" value={data.metaCountry} onChange={(event) => setData({ ...data, metaCountry: event.target.value })} placeholder={t('Start typing a country')} autoComplete="off" /></Field>
            <Field label={t('City')} hint={t('Optional')}><input value={data.metaCity} onChange={(event) => setData({ ...data, metaCity: event.target.value })} placeholder={t('e.g. Schwyz')} /></Field>
          </div>
          <datalist id="ob-country-list">{COUNTRIES.map((country) => <option value={country.name} key={country.code} />)}</datalist>
          {data.metaCity.trim() && <div className="ob-field"><span className="ob-field-label">{t('Reach around the city')}</span><MenuField label={t('Radius')} value={String(data.metaRadius)} options={RADII.map((km) => ({ value: String(km), label: `${km} km` }))} onChange={(metaRadius) => setData({ ...data, metaRadius })} /></div>}
          <div className="ob-ai-note"><span>✦</span><p>{t('Every imported vacancy is turned into a complete campaign and launched automatically. You can edit it any time afterwards.')}</p></div>
          <div className="ob-employment-lock"><span>!</span><p><b>{t('Employment targeting stays compliant.')}</b> {t('Age, gender, and detailed-targeting limitations are locked automatically.')}</p></div>
        </section>
      </div>
      {error && <p className="ob-form-error" role="alert">{error}</p>}
      <FooterActions onBack={onBack} disabled={!data.postingPlatforms.length} busy={busy} />
    </form>
  )
}

function ConnectStep({ data, setData, onBack, onContinue, busy, notice }) {
  const [channels, setChannels] = useState([])
  const [working, setWorking] = useState('')
  const [error, setError] = useState(notice?.type === 'error' ? notice.message : '')
  useEffect(() => {
    getChannels().then((list) => {
      setChannels(list)
      setData((current) => ({ ...current, connected: list.filter((item) => item.connected).map((item) => item.id) }))
    }).catch((failure) => setError(failure.message))
  }, [setData])
  const toggle = async (id) => {
    setError('')
    setWorking(id)
    try {
      if (channels.find((item) => item.id === id)?.connected) {
        const list = await disconnectChannel(id)
        setChannels(list)
        setData({ ...data, connected: list.filter((item) => item.connected).map((item) => item.id) })
        setWorking('')
      } else {
        await saveOnboarding(7, savable(data))
        await connectChannel(id, 'onboarding')
      }
    } catch (failure) {
      setError(failure.message)
      setWorking('')
    }
  }
  return (
    <form className="ob-step" onSubmit={(event) => { event.preventDefault(); onContinue() }}>
      <ScreenHeading index={7} eyebrow={t('Your platforms')} title={<>{t('Connect your')}<br /><em>{t('accounts.')}</em></>} subtitle={t('Link your platforms so Marketeer can publish on your behalf. You can always do this later.')} />
      <div className="ob-connect-list">
        {platforms.map((platform) => {
          const channel = channels.find((item) => item.id === platform.id)
          const connected = Boolean(channel?.connected)
          return (
            <article className={connected ? 'ob-connect-card connected' : 'ob-connect-card'} key={platform.id}>
              <span className="ob-platform-icon"><img src={`/social_logos/${platform.id}.png`} alt="" /></span>
              <div><h3>{platform.name}{platform.optional && <small>{t('Optional')}</small>}</h3><p>{connected && channel.handle ? `${channel.handle} · ` : ''}{t(platform.detail)}</p></div>
              <button type="button" disabled={Boolean(working)} onClick={() => toggle(platform.id)}>{working === platform.id ? t('Opening…') : connected ? <><CheckIcon /> {t('Connected')}</> : <>{t('Connect')} <ArrowIcon /></>}</button>
            </article>
          )
        })}
      </div>
      {error && <p className="ob-form-error" role="alert">{error}</p>}
      <div className="ob-security-note"><span>⌾</span><p><b>{t('Your accounts stay yours.')}</b> {t('Secure OAuth means we never see or store your passwords.')}</p></div>
      <FooterActions onBack={onBack} skipLabel={t('I’ll connect these later')} onSkip={onContinue} busy={busy} />
    </form>
  )
}

function WorkspaceStep({ data, setData, onBack, onContinue, busy }) {
  const [invite, setInvite] = useState('')
  const [error, setError] = useState('')
  const addInvite = () => {
    const cleanInvite = invite.trim().toLowerCase()
    if (!cleanInvite || data.invites.includes(cleanInvite)) return
    if (!isEmail(cleanInvite)) { setError(t('Enter a valid teammate email.')); return }
    setError('')
    setData({ ...data, invites: [...data.invites, cleanInvite] })
    setInvite('')
  }
  return (
    <form className="ob-step" onSubmit={(event) => { event.preventDefault(); onContinue() }}>
      <ScreenHeading index={8} eyebrow={t('Your workspace')} title={<>{t('Set up your')}<br /><em>{t('workspace.')}</em></>} subtitle={t('Invite your team or set up separate spaces for each client.')} />
      <div className="ob-workspace-fields">
        <Field label={t('Workspace name')}>
          <input value={data.workspaceName} onChange={(event) => setData({ ...data, workspaceName: event.target.value })} placeholder={data.role === 'Agency' ? t('My Agency') : t('My Client Workspace')} autoFocus />
        </Field>
        <div className="ob-invite-block">
          <div className="ob-field-label">{t('Invite teammates')} <small>{t('Optional')}</small></div>
          <div className="ob-invite-input"><input type="email" value={invite} onChange={(event) => setInvite(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addInvite() } }} placeholder={t('teammate@company.com')} /><button type="button" onClick={addInvite}>{t('+ Add')}</button></div>
          {data.invites.length > 0 && <div className="ob-invite-list">{data.invites.map((email) => <span key={email}>{email}<button type="button" onClick={() => setData({ ...data, invites: data.invites.filter((item) => item !== email) })} aria-label={t('Remove {email}', { email })}>×</button></span>)}</div>}
          <button className="ob-add-another" type="button" onClick={addInvite}>{t('+ Add another teammate')}</button>
        </div>
      </div>
      {error && <p className="ob-form-error" role="alert">{error}</p>}
      <div className="ob-workspace-preview">
        <span>{initialsOf(data.workspaceName || data.businessName || data.name)}</span><p><small>{t('WORKSPACE PREVIEW')}</small><b>{data.workspaceName || (data.role === 'Agency' ? t('My Agency') : t('My Workspace'))}</b></p><em>{data.invites.length ? t('{n} members', { n: data.invites.length + 1 }) : t('1 member')}</em>
      </div>
      <FooterActions onBack={onBack} skipLabel={t('Skip for now')} onSkip={onContinue} busy={busy} />
    </form>
  )
}

function CompleteStep({ data, onBack, onDashboard, busy, error }) {
  const displayName = data.name.trim().split(' ')[0] || t('there')
  const channels = data.postingPlatforms.map((name) => ({ name, src: `/social_logos/${name.toLowerCase()}.png` }))
  return (
    <section className="ob-step ob-complete-step">
      <div className="ob-confetti" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="ob-success-mark"><CheckIcon /></div>
      <ScreenHeading index={9} eyebrow={t('Setup complete')} title={<>{t('You’re all set,')}<br /><em>{displayName}!</em> 🎉</>} subtitle={t('Your creative command center is ready to go.')} />
      <div className="ob-summary-card">
        <div className="ob-summary-band">
          <div>
            <p><b>{data.businessName || t('Your brand')}</b><span>{[data.industry, data.voice || data.customVoice].filter(Boolean).join(' · ') || t('Brand profile')}</span></p>
            <div className="ob-summary-swatches">{data.colors.map((color, index) => <span key={`${color}-${index}`} style={{ background: color }} />)}</div>
          </div>
          <em>{t('Ready')}</em>
        </div>
        <ul>
          <li><span>{t('Logo')}</span>{data.logo ? <b className="ob-summary-logo"><img src={data.logo} alt="" /> {data.logoOnPosts ? t('on every post · {where}', { where: t(LOGO_POSITIONS.find(([id]) => id === data.logoPosition)?.[1] || 'Top right').toLowerCase() }) : t('not added to posts')}</b> : <b>{t('Add it in the Knowledge Base')}</b>}</li>
          <li><span>{t('Rhythm')}</span><b>{t(data.postingFrequency)}</b></li>
          <li><span>{t('Timezone')}</span><b>{data.timezone.replace('_', ' ')}</b></li>
          <li><span>{t('Meta ads')}</span><b>{currencySymbol()} {data.metaBudget}{t('/day')} · {t('{n} days', { n: data.metaDuration })} · {t('launches automatically')}</b></li>
          {data.metaCountry && <li><span>{t('Hiring area')}</span><b>{data.metaCity.trim() ? `${data.metaCity.trim()} + ${data.metaRadius} km, ` : t('All of ')}{data.metaCountry}</b></li>}
          <li><span>{t('Channels')}</span>{channels.length > 0 ? <div className="ob-summary-logos">{channels.map((channel) => <img key={channel.name} src={channel.src} alt={channel.name} />)}</div> : <b>{t('Add these in Settings')}</b>}</li>
          {(data.role === 'Agency' || data.role === 'Freelancer') && <li><span>{t('Workspace')}</span><b>{data.workspaceName || t('Personal workspace')} · {data.invites.length ? t('{n} members', { n: data.invites.length + 1 }) : t('1 member')}</b></li>}
        </ul>
      </div>
      <p className="ob-complete-copy">{t('Your dashboard is ready. This is where you’ll create ads, generate content, and publish across Facebook and Instagram—all powered by AI.')}</p>
      {error && <p className="ob-form-error" role="alert">{error}</p>}
      <footer className="ob-form-actions">
        <button className="ob-back" type="button" onClick={onBack}><ArrowIcon back /> {t('Back')}</button>
        <button className="ob-primary ob-dashboard-button" type="button" disabled={busy} onClick={onDashboard}><span>{busy ? t('Setting up…') : t('Go to dashboard')}</span><i><ArrowIcon /></i></button>
      </footer>
    </section>
  )
}

function ProgressRail({ step, role }) {
  const sequence = (role === 'Agency' || role === 'Freelancer') ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3, 4, 5, 6, 7, 9]
  const active = Math.max(0, sequence.indexOf(step))
  return (
    <aside className="ob-progress-rail">
      <div className="ob-progress-count"><span>{String(active + 1).padStart(2, '0')}</span><i>/</i><em>{String(sequence.length).padStart(2, '0')}</em></div>
      <div className="ob-progress-bars">{sequence.map((screen, index) => <span key={screen} className={index <= active ? 'active' : ''}><i /></span>)}</div>
      <p>{step === 9 ? t('Your setup is complete.') : t('Your progress is saved automatically.')}</p>
    </aside>
  )
}

function initialData(account) {
  return {
    name: account?.name || '',
    email: account?.email || '',
    password: '',
    hasPassword: Boolean(account?.has_password),
    providers: account?.providers || [],
    provider: '',
    role: account?.role || '',
    businessName: '',
    industry: '',
    website: '',
    goals: [],
    logo: '',
    colors: DEFAULT_COLORS,
    voice: 'Professional',
    customVoice: '',
    description: '',
    postingPlatforms: ['Instagram', 'Facebook'],
    postingFrequency: '4 posts per week',
    timezone: TIMEZONE,
    metaBudget: '45',
    metaDuration: '21',
    metaCountry: DEFAULT_COUNTRY,
    metaCity: 'Schwyz',
    metaRadius: '40',
    logoPosition: 'top-right',
    logoSize: 'Medium',
    logoOnPosts: true,
    connected: [],
    workspaceName: '',
    invites: [],
  }
}

function OnboardingFlow({ initialView, account, setAccount, onNavigate, theme, onToggleTheme }) {
  const [data, setData] = useState(() => initialData(account))
  const [step, setStep] = useState(1)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(null)

  // Resume where the user left off; OAuth returns land back on their step.
  useEffect(() => {
    if (initialView !== 'onboarding') return
    let cancelled = false
    getOnboarding().then((state) => {
      if (cancelled) return
      const params = new URLSearchParams(window.location.search)
      setData((current) => ({
        ...initialData(state.account),
        ...Object.fromEntries(Object.entries(state.data || {}).filter(([, value]) => value !== null && value !== undefined && value !== '')),
        name: state.account?.name || current.name,
        email: state.account?.email || current.email,
        password: current.password,
        hasPassword: Boolean(state.account?.has_password),
        providers: state.account?.providers || [],
      }))
      if (params.get('social')) {
        setStep(7)
        setNotice(params.get('social') === 'error' ? { type: 'error', message: params.get('message') || t('The connection did not complete.') } : { type: 'success' })
      } else if (params.get('linked')) {
        setStep(1)
      } else {
        setStep(state.completed ? 9 : Math.min(9, Math.max(1, state.step || 1)))
      }
      if (params.get('social') || params.get('linked')) window.history.replaceState({}, '', `${window.location.pathname}?view=onboarding`)
      setLoaded(true)
    }).catch((failure) => { setError(failure.message); setLoaded(true) })
    return () => { cancelled = true }
  }, [initialView])

  if (initialView === 'signin' || initialView === 'signup') {
    const signedIn = (user) => {
      setAccount(user)
      setData(initialData(user))
      onNavigate(user.onboarding_completed ? 'dashboard' : 'onboarding')
    }
    return <><div className="global-controls"><LanguageButton /><ThemeButton theme={theme} onToggle={onToggleTheme} className="global-theme-button" /></div><AuthScreen key={initialView} mode={initialView} onNavigate={onNavigate} onSignedIn={signedIn} /></>
  }

  if (initialView === 'dashboard') {
    return <Dashboard account={account} setAccount={setAccount} onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />
  }

  const agencyFlow = data.role === 'Agency' || data.role === 'Freelancer'
  const persist = async (nextStep, snapshot = data) => {
    setSaving(true)
    setError('')
    try {
      await saveOnboarding(nextStep, savable(snapshot))
      return true
    } catch (failure) {
      setError(failure.message)
      return false
    } finally {
      setSaving(false)
    }
  }
  const next = async (snapshot) => {
    const current = snapshot && snapshot.businessName !== undefined ? snapshot : data
    const target = step === 7 && !agencyFlow ? 9 : Math.min(step + 1, 9)
    if (await persist(target, current)) setStep(target)
  }
  const back = () => {
    if (step === 1) {
      onNavigate('home')
      return
    }
    setStep((current) => current === 9 && !agencyFlow ? 7 : Math.max(current - 1, 1))
  }
  const finish = async () => {
    setFinishing(true)
    setError('')
    try {
      await completeOnboarding({ ...savable(data), name: data.name, email: data.email, ...(data.password ? { password: data.password } : {}) })
      setAccount(await getMe())
      onNavigate('dashboard')
    } catch (failure) {
      setError(failure.message)
      setFinishing(false)
    }
  }
  const saveAndExit = async () => {
    await persist(step)
    onNavigate('home')
  }

  return (
    <main className="ob-onboarding-page">
      <div className="global-controls"><LanguageButton /><ThemeButton theme={theme} onToggle={onToggleTheme} className="global-theme-button" /></div>
      <AmbientBackground />
      <nav className="ob-onboarding-nav">
        <Wordmark onHome={() => onNavigate('home')} />
        <ProgressRail step={step} role={data.role} />
        <button className="ob-save-exit" type="button" onClick={saveAndExit}>{t('Save & exit')} <span>↗</span></button>
      </nav>
      <div className="ob-onboarding-wrap">
        <aside className="ob-side-note">
          <span>{t('MARKETEER / SETUP')}</span>
          <p>{step === 9 ? t('Ready when you are.') : t('A better campaign starts with a little context.')}</p>
          <div><i>✦</i><small>{step === 4 ? t('Your brand settings guide every AI-generated ad and post.') : step === 5 ? t('Your logo goes on every post the AI creates.') : step === 6 ? t('These defaults power both automatic pipelines.') : step === 7 ? t('Connect once, then publish everywhere from one place.') : t('About 2 minutes to your first AI-powered workspace.')}</small></div>
        </aside>
        <div className="ob-glass ob-flow-card" key={step}>
          <div className="ob-card-glint" />
          {!loaded ? <div className="ob-step"><ScreenHeading index={step} eyebrow={t('Loading')} title={<>{t('One moment…')}</>} subtitle={t('Picking up where you left off.')} /></div> : <>
            {step === 1 && <BasicsStep data={data} setData={setData} onBack={back} onContinue={next} busy={saving} />}
            {step === 2 && <BusinessStep data={data} setData={setData} onBack={back} onContinue={next} busy={saving} />}
            {step === 3 && <GoalsStep data={data} setData={setData} onBack={back} onContinue={next} busy={saving} />}
            {step === 4 && <BrandStep data={data} setData={setData} onBack={back} onContinue={next} busy={saving} />}
            {step === 5 && <LogoStep data={data} setData={setData} onBack={back} onContinue={next} busy={saving} />}
            {step === 6 && <AutomationStep data={data} setData={setData} onBack={back} onContinue={next} busy={saving} />}
            {step === 7 && <ConnectStep data={data} setData={setData} onBack={back} onContinue={next} busy={saving} notice={notice} />}
            {step === 8 && <WorkspaceStep data={data} setData={setData} onBack={back} onContinue={next} busy={saving} />}
            {step === 9 && <CompleteStep data={data} onBack={back} onDashboard={finish} busy={finishing} error={error} />}
            {error && step !== 9 && <p className="ob-form-error" role="alert">{error}</p>}
          </>}
        </div>
      </div>
    </main>
  )
}

export default OnboardingFlow
