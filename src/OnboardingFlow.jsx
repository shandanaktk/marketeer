import { useEffect, useRef, useState } from 'react'
import Dashboard from './Dashboard.jsx'
import { ThemeButton } from './theme.jsx'

const roles = [
  { name: 'Business Owner', icon: '↗', caption: 'Grow my own business' },
  { name: 'Marketer', icon: '✦', caption: 'Run marketing in-house' },
  { name: 'Agency', icon: '◎', caption: 'Manage multiple clients' },
  { name: 'Freelancer', icon: '⌁', caption: 'Create for my clients' },
]

const industries = [
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
  '#0A2463', '#1E4B8F', '#3E92CC', '#8EC8EF', '#D8315B', '#F28B9F',
  '#1E1B18', '#6A615C', '#C8A791', '#E47E3D', '#F8E6C4', '#898F65',
  '#102A43', '#2F7EB5', '#0F766E', '#C2410C', '#7C3AED', '#FFFAFF',
]

const platforms = [
  { id: 'facebook', name: 'Facebook', detail: 'Pages, feed, and lead ads through the Meta Graph API', color: '#1877f2' },
  { id: 'instagram', name: 'Instagram', detail: 'Feed posts, stories, and reels through the Meta Graph API', color: '#c13584' },
]

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
    <button className="ob-wordmark" type="button" onClick={onHome} aria-label="Back to Marketeer home">
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

function AuthScreen({ mode, account, setAccount, onNavigate, onContinue }) {
  const isSignIn = mode === 'signin'
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const submit = (event) => {
    event.preventDefault()
    if ((!isSignIn && !account.name.trim()) || !account.email.trim() || !account.password.trim()) {
      setError('Add your details to continue.')
      return
    }
    setError('')
    onContinue()
  }

  const useDemo = () => {
    setAccount((current) => ({ ...current, name: 'Alex Morgan', email: 'demo@marketeer.ai', password: 'demo1234' }))
    setError('')
  }

  return (
    <main className="ob-auth-page">
      <AmbientBackground />
      <nav className="ob-auth-nav">
        <Wordmark onHome={() => onNavigate('home')} />
        <p>
          {isSignIn ? 'New to Marketeer?' : 'Already have an account?'}
          <button type="button" onClick={() => onNavigate(isSignIn ? 'signup' : 'signin')}>
            {isSignIn ? 'Create account' : 'Sign in'}
          </button>
        </p>
      </nav>

      <div className="ob-auth-layout">
        <section className="ob-auth-story" aria-label="Marketeer introduction">
          <div className="ob-kicker"><span>✦</span> AI-powered campaign studio</div>
          <h1>{isSignIn ? <>Welcome<br /><em>back.</em></> : <>Your ideas.<br /><em>Everywhere.</em></>}</h1>
          <p>{isSignIn ? 'Your next campaign is closer than you think.' : 'Build campaigns, create on-brand content, and publish across every feed—all in one place.'}</p>
          <div className="ob-story-preview">
            <div className="ob-preview-card preview-one"><span>NEW CAMPAIGN</span><b>Less setup.<br />More impact.</b><i>↗</i></div>
            <div className="ob-preview-card preview-two"><span>READY TO POST</span><b>Meet your<br /><em>new routine.</em></b><i>✦</i></div>
            <div className="ob-preview-card preview-three"><span>MARKETEER AI</span><b>12 ideas</b><small>generated in 8 sec</small></div>
          </div>
          <div className="ob-auth-proof"><span>4.9</span><div>★★★★★<small>Loved by 1,000+ growing brands</small></div></div>
        </section>

        <section className="ob-glass ob-auth-card">
          <div className="ob-card-glint" />
          <div className="ob-auth-heading">
            <span className="ob-mini-index">{isSignIn ? 'WELCOME BACK' : 'START FOR FREE'}</span>
            <h2>{isSignIn ? 'Sign in to Marketeer' : 'Create your account'}</h2>
            <p>{isSignIn ? 'Pick up right where you left off.' : 'No credit card. Just better marketing.'}</p>
          </div>

          <div className="ob-social-row">
            <button type="button" onClick={onContinue}><GoogleLogo /> Google</button>
            <button type="button" onClick={onContinue}><AppleLogo /> Apple</button>
          </div>
          <div className="ob-divider"><span>or use email</span></div>

          <form onSubmit={submit} className="ob-auth-form">
            {!isSignIn && (
              <Field label="Your name">
                <input value={account.name} onChange={(event) => setAccount((current) => ({ ...current, name: event.target.value }))} placeholder="Alex Morgan" autoComplete="name" />
              </Field>
            )}
            <Field label="Email address">
              <input type="email" value={account.email} onChange={(event) => setAccount((current) => ({ ...current, email: event.target.value }))} placeholder="you@company.com" autoComplete="email" />
            </Field>
            <Field label="Password">
              <span className="ob-password-wrap">
                <input type={showPassword ? 'text' : 'password'} value={account.password} onChange={(event) => setAccount((current) => ({ ...current, password: event.target.value }))} placeholder="8+ characters" autoComplete={isSignIn ? 'current-password' : 'new-password'} />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}><EyeIcon closed={showPassword} /></button>
              </span>
            </Field>
            {error && <p className="ob-form-error" role="alert">{error}</p>}
            <button className="ob-primary ob-auth-submit" type="submit">
              <span>{isSignIn ? 'Sign in' : 'Create free account'}</span><i><ArrowIcon /></i>
            </button>
          </form>

          <button className="ob-demo-access" type="button" onClick={useDemo}>
            <span><i>DEMO</i> Use demo credentials</span>
            <small>demo@marketeer.ai&nbsp;&nbsp;·&nbsp;&nbsp;demo1234</small>
          </button>
          <p className="ob-legal">By continuing, you agree to our Terms and Privacy Policy.</p>
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

function FooterActions({ onBack, onContinue, skipLabel, onSkip, continueLabel = 'Continue', disabled = false }) {
  return (
    <footer className="ob-form-actions">
      <button className="ob-back" type="button" onClick={onBack}><ArrowIcon back /> Back</button>
      <div>
        {skipLabel && <button className="ob-skip" type="button" onClick={onSkip}>{skipLabel}</button>}
        <button className="ob-primary" type="submit" onClick={onContinue} disabled={disabled}>
          <span>{continueLabel}</span><i><ArrowIcon /></i>
        </button>
      </div>
    </footer>
  )
}

function BasicsStep({ data, setData, onBack, onContinue }) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const submit = (event) => {
    event.preventDefault()
    if (!data.email.trim() || !data.password.trim() || !data.role) {
      setError('Add your account details and choose the option that fits you best.')
      return
    }
    setError('')
    onContinue()
  }

  return (
    <form className="ob-step" onSubmit={submit}>
      <ScreenHeading index={1} eyebrow="Account basics" title={<>Welcome to <em>Marketeer.</em></>} subtitle="Let’s get your account set up in under 2 minutes." />
      <div className="ob-two-fields">
        <Field label="Email">
          <input type="email" value={data.email} onChange={(event) => setData({ ...data, email: event.target.value })} autoComplete="email" />
        </Field>
        <Field label="Password">
          <span className="ob-password-wrap">
            <input type={showPassword ? 'text' : 'password'} value={data.password} onChange={(event) => setData({ ...data, password: event.target.value })} autoComplete="new-password" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility"><EyeIcon closed={showPassword} /></button>
          </span>
        </Field>
      </div>
      <div className="ob-inline-divider"><span>or continue with</span></div>
      <div className="ob-social-row compact">
        <button type="button" onClick={() => setData({ ...data, provider: 'Google' })} className={data.provider === 'Google' ? 'selected' : ''}><GoogleLogo /> Google {data.provider === 'Google' && <CheckIcon />}</button>
        <button type="button" onClick={() => setData({ ...data, provider: 'Apple' })} className={data.provider === 'Apple' ? 'selected' : ''}><AppleLogo /> Apple {data.provider === 'Apple' && <CheckIcon />}</button>
      </div>
      <fieldset className="ob-choice-set">
        <legend>What best describes you?</legend>
        <div className="ob-role-grid">
          {roles.map((role) => (
            <button key={role.name} type="button" className={data.role === role.name ? 'ob-choice-card selected' : 'ob-choice-card'} onClick={() => setData({ ...data, role: role.name })}>
              <i>{role.icon}</i><span><b>{role.name}</b><small>{role.caption}</small></span><em><CheckIcon /></em>
            </button>
          ))}
        </div>
      </fieldset>
      {error && <p className="ob-form-error" role="alert">{error}</p>}
      <FooterActions onBack={onBack} />
    </form>
  )
}

function BusinessStep({ data, setData, onBack, onContinue }) {
  const [error, setError] = useState('')
  const submit = (event) => {
    event.preventDefault()
    if (!data.businessName.trim() || !data.industry) {
      setError('Add a business name and choose an industry to continue.')
      return
    }
    setError('')
    onContinue()
  }
  return (
    <form className="ob-step" onSubmit={submit}>
      <ScreenHeading index={2} eyebrow="Your business" title={<>Tell us about<br /><em>your business.</em></>} subtitle="This helps Marketeer understand what you do and who you’re talking to." />
      <div className="ob-business-fields">
        <Field label="Business name">
          <input value={data.businessName} onChange={(event) => setData({ ...data, businessName: event.target.value })} placeholder="e.g. Marketeer" autoFocus />
        </Field>
        <div className="ob-field">
          <span className="ob-field-label">Industry</span>
          <MenuField label="Industry" placeholder="Select your industry" value={data.industry} options={industries} onChange={(industry) => setData({ ...data, industry })} />
        </div>
        <Field label="Website URL" hint="Optional">
          <span className="ob-url-wrap"><i>https://</i><input value={data.website} onChange={(event) => setData({ ...data, website: event.target.value.replace(/^https?:\/\//, '') })} placeholder="yourbusiness.com" inputMode="url" /></span>
        </Field>
        {data.website && <div className="ob-smart-note"><span>✦</span><p><b>Website detected</b>We’ll scan your site to auto-fill your branding in the next step.</p></div>}
      </div>
      {error && <p className="ob-form-error" role="alert">{error}</p>}
      <FooterActions onBack={onBack} skipLabel="Skip for now" onSkip={onContinue} />
    </form>
  )
}

function GoalsStep({ data, setData, onBack, onContinue }) {
  const toggleGoal = (goal) => {
    const goalsNext = data.goals.includes(goal) ? data.goals.filter((item) => item !== goal) : [...data.goals, goal]
    setData({ ...data, goals: goalsNext })
  }
  return (
    <form className="ob-step" onSubmit={(event) => { event.preventDefault(); onContinue() }}>
      <ScreenHeading index={3} eyebrow="Your goals" title={<>What are you hoping<br /><em>to achieve?</em></>} subtitle="Pick as many as apply—we’ll tailor your dashboard around this." />
      <div className="ob-goal-grid">
        {goals.map((goal) => (
          <button type="button" key={goal.name} className={`ob-goal-card ${goal.tone} ${data.goals.includes(goal.name) ? 'selected' : ''}`} onClick={() => toggleGoal(goal.name)}>
            <span className="ob-goal-emoji">{goal.emoji}</span><em><CheckIcon /></em>
            <b>{goal.name}</b><small>{goal.detail}</small>
          </button>
        ))}
      </div>
      <p className="ob-selection-count"><span>{data.goals.length || 'No'}</span> goal{data.goals.length === 1 ? '' : 's'} selected</p>
      <FooterActions onBack={onBack} disabled={!data.goals.length} />
    </form>
  )
}

function BrandStep({ data, setData, onBack, onContinue }) {
  const uploadRef = useRef(null)
  const paletteRef = useRef(null)
  const [logoName, setLogoName] = useState('')
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
  const handleLogo = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setLogoName(file.name)
    setData({ ...data, logo: URL.createObjectURL(file) })
  }
  return (
    <form className="ob-step" onSubmit={(event) => { event.preventDefault(); onContinue() }}>
      <ScreenHeading index={4} eyebrow="Brand identity" title={<>Let’s set up<br /><em>your brand.</em></>} subtitle={data.website ? 'We pulled a starting point from your website—feel free to adjust anything.' : 'Give Marketeer a feel for your look, sound, and story.'} />
      <div className="ob-brand-layout">
        <div className="ob-brand-left">
          <div className="ob-field-label">Logo <small>PNG, JPG or SVG</small></div>
          <button className="ob-upload" type="button" onClick={() => uploadRef.current?.click()}>
            <input ref={uploadRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogo} tabIndex="-1" />
            {data.logo ? <img src={data.logo} alt="Uploaded logo preview" /> : <span>AC</span>}
            <p><b>{logoName || 'Upload your logo'}</b><small>{logoName ? 'Click to replace' : 'or drag and drop here'}</small></p><i>↑</i>
          </button>
          <div className="ob-color-block">
            <div className="ob-field-label">Brand colors <small>Pick from the palette or type a hex</small></div>
            <div className="ob-color-strip">
              {data.colors.map((color, index) => (
                <div className="ob-color-chip" key={index}>
                  <button type="button" className={`ob-color-swatch ${paletteFor === index ? 'is-editing' : ''}`} style={{ background: color }} aria-label={`Edit brand color ${index + 1}`} onClick={() => setPaletteFor(index)} />
                  <input className="ob-color-hex" aria-label={`Hex for brand color ${index + 1}`} value={color} maxLength={7} onChange={(event) => updateColor(index, event.target.value.startsWith('#') ? event.target.value : `#${event.target.value}`)} />
                  {data.colors.length > 2 && <button type="button" aria-label={`Remove color ${color}`} onClick={() => setData({ ...data, colors: data.colors.filter((_, item) => item !== index) })}>×</button>}
                </div>
              ))}
              {data.colors.length < 6 && <button className={`ob-color-add ${paletteFor === 'add' ? 'is-open' : ''}`} type="button" onClick={() => setPaletteFor(paletteFor === 'add' ? null : 'add')}><b>+</b><small>Custom</small></button>}
            </div>
            {paletteFor !== null && (
              <div className="ob-palette" ref={paletteRef}>
                <p>{paletteFor === 'add' ? 'Add a brand color' : 'Replace this color'}</p>
                <div className="ob-palette-grid">
                  {palette.map((color) => {
                    const used = data.colors.some((item) => item.toUpperCase() === color)
                    const current = paletteFor !== 'add' && data.colors[paletteFor]?.toUpperCase() === color
                    return <button type="button" key={color} className={current ? 'is-current' : used ? 'is-used' : ''} style={{ background: color }} aria-label={color} onClick={() => choosePaletteColor(color)} />
                  })}
                </div>
                <label className="ob-palette-any">
                  Any color
                  <input type="color" aria-label="Pick any color" value={/^#[0-9a-fA-F]{6}$/.test(paletteFor === 'add' ? '#3e92cc' : data.colors[paletteFor] || '') ? (paletteFor === 'add' ? '#3e92cc' : data.colors[paletteFor]) : '#3e92cc'} onChange={(event) => choosePaletteColor(event.target.value)} />
                </label>
              </div>
            )}
          </div>
        </div>
        <div className="ob-brand-right">
          <div className="ob-voice-block">
            <div className="ob-field-label">Brand voice <small>Select one</small></div>
            <div className="ob-voice-options">
              {voices.map((voice) => <button type="button" key={voice} className={data.voice === voice ? 'selected' : ''} onClick={() => setData({ ...data, voice })}>{voice}</button>)}
            </div>
            <input className="ob-own-voice" value={data.customVoice} onChange={(event) => setData({ ...data, customVoice: event.target.value, voice: '' })} placeholder="Or describe your own voice..." />
          </div>
          <Field label="Short business description">
            <span className="ob-textarea-wrap"><textarea maxLength="240" value={data.description} onChange={(event) => setData({ ...data, description: event.target.value })} placeholder="In a sentence or two, what does your business do?" /><small>{data.description.length}/240</small></span>
          </Field>
          <div className="ob-ai-note"><span>✦</span><p>This is what Marketeer’s AI will use to write and design everything on your behalf.</p></div>
        </div>
      </div>
      <FooterActions onBack={onBack} />
    </form>
  )
}

function AutomationStep({ data, setData, onBack, onContinue }) {
  const togglePlatform = (platform) => setData({
    ...data,
    postingPlatforms: data.postingPlatforms.includes(platform)
      ? data.postingPlatforms.filter((item) => item !== platform)
      : [...data.postingPlatforms, platform],
  })

  return (
    <form className="ob-step" onSubmit={(event) => { event.preventDefault(); onContinue() }}>
      <ScreenHeading index={5} eyebrow="Automation rules" title={<>Set the rhythm.<br /><em>We’ll run it.</em></>} subtitle="Choose the publishing cadence and recruitment ad defaults Marketeer should apply automatically." />
      <div className="ob-automation-layout">
        <section>
          <header className="ob-rule-head"><b>Organic publishing</b><small>Select every channel Marketeer should post to</small></header>
          <div className="ob-rule-platforms">
            {[{ name: 'Instagram', detail: 'Feed, stories, and reels' }, { name: 'Facebook', detail: 'Pages, feed, and lead ads' }].map((platform) => <button type="button" className={data.postingPlatforms.includes(platform.name) ? 'selected' : ''} onClick={() => togglePlatform(platform.name)} key={platform.name}><img src={`/social_logos/${platform.name.toLowerCase()}.png`} alt="" /><span><b>{platform.name}</b><small>{platform.detail}</small></span><i><CheckIcon /></i></button>)}
          </div>
          <p className="ob-rhythm-note"><b>{data.postingPlatforms.length || 'No'} channel{data.postingPlatforms.length === 1 ? '' : 's'}</b> · {data.postingFrequency} · {data.timezone.replace('_', ' ')}</p>
          <div className="ob-two-fields">
            <div className="ob-field"><span className="ob-field-label">Publishing frequency</span><MenuField label="Publishing frequency" value={data.postingFrequency} options={['3 posts per week', '4 posts per week', '5 posts per week', 'Daily']} onChange={(postingFrequency) => setData({ ...data, postingFrequency })} /></div>
            <div className="ob-field"><span className="ob-field-label">Timezone</span><MenuField label="Timezone" value={data.timezone} options={['Europe/Amsterdam', 'Europe/London', 'America/New_York', 'Asia/Karachi']} onChange={(timezone) => setData({ ...data, timezone })} /></div>
          </div>
        </section>
        <section className="ob-meta-rules">
          <header className="ob-rule-head"><b>Meta recruitment ads</b><small>Employment defaults stay locked for compliance</small></header>
          <div className="ob-two-fields">
            <Field label="Daily budget"><span className="ob-budget-input"><i>$</i><input type="number" min="5" value={data.metaBudget} onChange={(event) => setData({ ...data, metaBudget: event.target.value })} /></span></Field>
            <div className="ob-field"><span className="ob-field-label">Campaign duration</span><MenuField label="Campaign duration" value={data.metaDuration} options={[{ value: '14', label: '14 days' }, { value: '21', label: '21 days' }, { value: '30', label: '30 days' }]} onChange={(metaDuration) => setData({ ...data, metaDuration })} /></div>
          </div>
          <button type="button" className={`ob-rule-toggle ${data.reviewMode ? 'on' : ''}`} onClick={() => setData({ ...data, reviewMode: !data.reviewMode })}><span><i /></span><p><b>Review campaigns before launch</b><small>Hold generated campaigns for edits and approval.</small></p></button>
          <div className="ob-employment-lock"><span>!</span><p><b>Employment targeting stays compliant.</b> Age, gender, and detailed-targeting limitations are locked automatically.</p></div>
        </section>
      </div>
      <FooterActions onBack={onBack} disabled={!data.postingPlatforms.length} />
    </form>
  )
}

function ConnectStep({ data, setData, onBack, onContinue }) {
  const toggle = (id) => {
    const connected = data.connected.includes(id) ? data.connected.filter((item) => item !== id) : [...data.connected, id]
    setData({ ...data, connected })
  }
  return (
    <form className="ob-step" onSubmit={(event) => { event.preventDefault(); onContinue() }}>
      <ScreenHeading index={6} eyebrow="Your platforms" title={<>Connect your<br /><em>accounts.</em></>} subtitle="Link your platforms so Marketeer can publish on your behalf. You can always do this later." />
      <div className="ob-connect-list">
        {platforms.map((platform) => {
          const connected = data.connected.includes(platform.id)
          return (
            <article className={connected ? 'ob-connect-card connected' : 'ob-connect-card'} key={platform.id}>
              <span className="ob-platform-icon"><img src={`/social_logos/${platform.id}.png`} alt="" /></span>
              <div><h3>{platform.name}{platform.optional && <small>Optional</small>}</h3><p>{platform.detail}</p></div>
              <button type="button" onClick={() => toggle(platform.id)}>{connected ? <><CheckIcon /> Connected</> : <>Connect <ArrowIcon /></>}</button>
            </article>
          )
        })}
      </div>
      <div className="ob-security-note"><span>⌾</span><p><b>Your accounts stay yours.</b> Secure OAuth means we never see or store your passwords.</p></div>
      <FooterActions onBack={onBack} skipLabel="I’ll connect these later" onSkip={onContinue} />
    </form>
  )
}

function WorkspaceStep({ data, setData, onBack, onContinue }) {
  const [invite, setInvite] = useState('')
  const addInvite = () => {
    const cleanInvite = invite.trim()
    if (!cleanInvite || data.invites.includes(cleanInvite)) return
    setData({ ...data, invites: [...data.invites, cleanInvite] })
    setInvite('')
  }
  return (
    <form className="ob-step" onSubmit={(event) => { event.preventDefault(); onContinue() }}>
      <ScreenHeading index={7} eyebrow="Your workspace" title={<>Set up your<br /><em>workspace.</em></>} subtitle="Invite your team or set up separate spaces for each client." />
      <div className="ob-workspace-fields">
        <Field label="Workspace name">
          <input value={data.workspaceName} onChange={(event) => setData({ ...data, workspaceName: event.target.value })} placeholder={data.role === 'Agency' ? 'My Agency' : 'My Client Workspace'} autoFocus />
        </Field>
        <div className="ob-invite-block">
          <div className="ob-field-label">Invite teammates <small>Optional</small></div>
          <div className="ob-invite-input"><input type="email" value={invite} onChange={(event) => setInvite(event.target.value)} placeholder="teammate@company.com" /><button type="button" onClick={addInvite}>+ Add</button></div>
          {data.invites.length > 0 && <div className="ob-invite-list">{data.invites.map((email) => <span key={email}>{email}<button type="button" onClick={() => setData({ ...data, invites: data.invites.filter((item) => item !== email) })} aria-label={`Remove ${email}`}>×</button></span>)}</div>}
          <button className="ob-add-another" type="button" onClick={addInvite}>+ Add another teammate</button>
        </div>
      </div>
      <div className="ob-workspace-preview">
        <span>AC</span><p><small>WORKSPACE PREVIEW</small><b>{data.workspaceName || (data.role === 'Agency' ? 'My Agency' : 'My Workspace')}</b></p><em>{data.invites.length + 1} member{data.invites.length ? 's' : ''}</em>
      </div>
      <FooterActions onBack={onBack} skipLabel="Skip for now" onSkip={onContinue} />
    </form>
  )
}

function CompleteStep({ data, onBack, onDashboard }) {
  const displayName = data.name.trim().split(' ')[0] || 'there'
  const channels = data.postingPlatforms.map((name) => ({ name, src: `/social_logos/${name.toLowerCase()}.png` }))
  return (
    <section className="ob-step ob-complete-step">
      <div className="ob-confetti" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="ob-success-mark"><CheckIcon /></div>
      <ScreenHeading index={8} eyebrow="Setup complete" title={<>You’re all set,<br /><em>{displayName}!</em> 🎉</>} subtitle="Your creative command center is ready to go." />
      <div className="ob-summary-card">
        <div className="ob-summary-band">
          <div>
            <p><b>{data.businessName || 'Your brand'}</b><span>{[data.industry, data.voice || data.customVoice].filter(Boolean).join(' · ') || 'Brand profile'}</span></p>
            <div className="ob-summary-swatches">{data.colors.map((color, index) => <span key={`${color}-${index}`} style={{ background: color }} />)}</div>
          </div>
          <em>Ready</em>
        </div>
        <ul>
          <li><span>Rhythm</span><b>{data.postingFrequency}</b></li>
          <li><span>Timezone</span><b>{data.timezone.replace('_', ' ')}</b></li>
          <li><span>Meta ads</span><b>${data.metaBudget}/day · {data.metaDuration} days{data.reviewMode ? ' · review on' : ''}</b></li>
          <li><span>Channels</span>{channels.length > 0 ? <div className="ob-summary-logos">{channels.map((channel) => <img key={channel.name} src={channel.src} alt={channel.name} />)}</div> : <b>Add these in Settings</b>}</li>
          {(data.role === 'Agency' || data.role === 'Freelancer') && <li><span>Workspace</span><b>{data.workspaceName || 'Personal workspace'} · {data.invites.length + 1} member{data.invites.length ? 's' : ''}</b></li>}
        </ul>
      </div>
      <p className="ob-complete-copy">Your dashboard is ready. This is where you’ll create ads, generate content, and publish across Facebook and Instagram—all powered by AI.</p>
      <footer className="ob-form-actions">
        <button className="ob-back" type="button" onClick={onBack}><ArrowIcon back /> Back</button>
        <button className="ob-primary ob-dashboard-button" type="button" onClick={onDashboard}><span>Go to dashboard</span><i><ArrowIcon /></i></button>
      </footer>
    </section>
  )
}

function ProgressRail({ step, role }) {
  const sequence = (role === 'Agency' || role === 'Freelancer') ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 5, 6, 8]
  const active = sequence.indexOf(step)
  return (
    <aside className="ob-progress-rail">
      <div className="ob-progress-count"><span>{String(active + 1).padStart(2, '0')}</span><i>/</i><em>{String(sequence.length).padStart(2, '0')}</em></div>
      <div className="ob-progress-bars">{sequence.map((screen, index) => <span key={screen} className={index <= active ? 'active' : ''}><i /></span>)}</div>
      <p>{step === 8 ? 'Your setup is complete.' : 'Your progress is saved automatically.'}</p>
    </aside>
  )
}

function OnboardingFlow({ initialView, onNavigate, theme, onToggleTheme }) {
  const [account, setAccount] = useState({ name: 'Alex Morgan', email: 'demo@marketeer.ai', password: 'demo1234' })
  const [data, setData] = useState({
    name: 'Alex Morgan',
    email: 'demo@marketeer.ai',
    password: 'demo1234',
    provider: '',
    role: '',
    businessName: '',
    industry: '',
    website: '',
    goals: [],
    logo: '',
    colors: ['#898F65', '#C8A791', '#E47E3D', '#F8E6C4'],
    voice: 'Bold',
    customVoice: '',
    description: '',
    postingPlatforms: ['Instagram', 'Facebook'],
    postingFrequency: '4 posts per week',
    timezone: 'Europe/Amsterdam',
    metaBudget: '45',
    metaDuration: '21',
    reviewMode: true,
    connected: [],
    workspaceName: '',
    invites: [],
  })
  const [step, setStep] = useState(1)

  const startOnboarding = () => {
    setData((current) => ({ ...current, name: account.name || 'Alex Morgan', email: account.email, password: account.password }))
    onNavigate('onboarding')
  }

  if (initialView === 'signin' || initialView === 'signup') {
    return <><ThemeButton theme={theme} onToggle={onToggleTheme} className="global-theme-button" /><AuthScreen mode={initialView} account={account} setAccount={setAccount} onNavigate={onNavigate} onContinue={startOnboarding} /></>
  }

  if (initialView === 'dashboard') {
    return <Dashboard data={data} onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />
  }

  const next = () => {
    setStep((current) => current === 6 && data.role !== 'Agency' && data.role !== 'Freelancer' ? 8 : Math.min(current + 1, 8))
  }
  const back = () => {
    if (step === 1) {
      onNavigate('signup')
      return
    }
    setStep((current) => current === 8 && data.role !== 'Agency' && data.role !== 'Freelancer' ? 6 : Math.max(current - 1, 1))
  }

  return (
    <main className="ob-onboarding-page">
      <ThemeButton theme={theme} onToggle={onToggleTheme} className="global-theme-button" />
      <AmbientBackground />
      <nav className="ob-onboarding-nav">
        <Wordmark onHome={() => onNavigate('home')} />
        <ProgressRail step={step} role={data.role} />
        <button className="ob-save-exit" type="button" onClick={() => onNavigate('home')}>Save & exit <span>↗</span></button>
      </nav>
      <div className="ob-onboarding-wrap">
        <aside className="ob-side-note">
          <span>MARKETEER / SETUP</span>
          <p>{step === 8 ? 'Ready when you are.' : 'A better campaign starts with a little context.'}</p>
          <div><i>✦</i><small>{step === 4 ? 'Your brand settings guide every AI-generated ad and post.' : step === 5 ? 'These defaults power both automatic pipelines.' : step === 6 ? 'Connect once, then publish everywhere from one place.' : 'About 2 minutes to your first AI-powered workspace.'}</small></div>
        </aside>
        <div className="ob-glass ob-flow-card" key={step}>
          <div className="ob-card-glint" />
          {step === 1 && <BasicsStep data={data} setData={setData} onBack={back} onContinue={next} />}
          {step === 2 && <BusinessStep data={data} setData={setData} onBack={back} onContinue={next} />}
          {step === 3 && <GoalsStep data={data} setData={setData} onBack={back} onContinue={next} />}
          {step === 4 && <BrandStep data={data} setData={setData} onBack={back} onContinue={next} />}
          {step === 5 && <AutomationStep data={data} setData={setData} onBack={back} onContinue={next} />}
          {step === 6 && <ConnectStep data={data} setData={setData} onBack={back} onContinue={next} />}
          {step === 7 && <WorkspaceStep data={data} setData={setData} onBack={back} onContinue={next} />}
          {step === 8 && <CompleteStep data={data} onBack={back} onDashboard={() => onNavigate('dashboard')} />}
        </div>
      </div>
    </main>
  )
}

export default OnboardingFlow
