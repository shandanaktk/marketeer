import { useRef, useState } from 'react'
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

const platforms = [
  { id: 'facebook', name: 'Facebook', detail: 'Pages and feed via the Meta Graph API', icon: 'f', color: '#1877f2' },
  { id: 'instagram', name: 'Instagram', detail: 'Posts, stories and reels via the Meta Graph API', icon: '◎', color: '#c13584' },
]

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
            <button type="button" onClick={onContinue}><b className="google-mark">G</b> Google</button>
            <button type="button" onClick={onContinue}><b className="apple-mark">●</b> Apple</button>
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
        <button type="button" onClick={() => setData({ ...data, provider: 'Google' })} className={data.provider === 'Google' ? 'selected' : ''}><b className="google-mark">G</b> Google {data.provider === 'Google' && <CheckIcon />}</button>
        <button type="button" onClick={() => setData({ ...data, provider: 'Apple' })} className={data.provider === 'Apple' ? 'selected' : ''}><b className="apple-mark">●</b> Apple {data.provider === 'Apple' && <CheckIcon />}</button>
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
        <Field label="Industry">
          <span className="ob-select-wrap">
            <select value={data.industry} onChange={(event) => setData({ ...data, industry: event.target.value })}>
              <option value="" disabled>Select your industry</option>
              {industries.map((industry) => <option key={industry}>{industry}</option>)}
            </select>
          </span>
        </Field>
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
  const [logoName, setLogoName] = useState('')
  const updateColor = (index, value) => {
    const colors = [...data.colors]
    colors[index] = value
    setData({ ...data, colors })
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
            <div className="ob-field-label">Brand colors <small>Click a swatch to edit</small></div>
            <div className="ob-swatches">
              {data.colors.map((color, index) => (
                <label key={`${color}-${index}`} style={{ '--swatch': color }}><input type="color" value={color} onChange={(event) => updateColor(index, event.target.value)} /><span><CheckIcon /></span><small>{color.toUpperCase()}</small></label>
              ))}
            </div>
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
          <div className="ob-field-label">Publishing channels <small>Select all that apply</small></div>
          <div className="ob-rule-platforms">
            {['Instagram', 'Facebook'].map((platform) => <button type="button" className={data.postingPlatforms.includes(platform) ? 'selected' : ''} onClick={() => togglePlatform(platform)} key={platform}><span>{platform.slice(0, 1)}</span><b>{platform}</b><i><CheckIcon /></i></button>)}
          </div>
          <div className="ob-two-fields">
            <Field label="Publishing frequency"><span className="ob-select-wrap"><select value={data.postingFrequency} onChange={(event) => setData({ ...data, postingFrequency: event.target.value })}><option>3 posts per week</option><option>4 posts per week</option><option>5 posts per week</option><option>Daily</option></select></span></Field>
            <Field label="Timezone"><span className="ob-select-wrap"><select value={data.timezone} onChange={(event) => setData({ ...data, timezone: event.target.value })}><option>Europe/Amsterdam</option><option>Europe/London</option><option>America/New_York</option><option>Asia/Karachi</option></select></span></Field>
          </div>
        </section>
        <section className="ob-meta-rules">
          <div className="ob-field-label">Meta recruitment defaults <small>Employment category applied</small></div>
          <div className="ob-two-fields">
            <Field label="Daily budget"><span className="ob-budget-input"><i>$</i><input type="number" min="5" value={data.metaBudget} onChange={(event) => setData({ ...data, metaBudget: event.target.value })} /></span></Field>
            <Field label="Campaign duration"><span className="ob-select-wrap"><select value={data.metaDuration} onChange={(event) => setData({ ...data, metaDuration: event.target.value })}><option value="14">14 days</option><option value="21">21 days</option><option value="30">30 days</option></select></span></Field>
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
              <span className="ob-platform-icon" style={{ '--platform-color': platform.color }}>{platform.icon}</span>
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
  const connectedNames = platforms.filter((platform) => data.connected.includes(platform.id)).map((platform) => platform.name)
  const displayName = data.name.trim().split(' ')[0] || 'there'
  return (
    <section className="ob-step ob-complete-step">
      <div className="ob-confetti" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="ob-success-mark"><CheckIcon /></div>
      <ScreenHeading index={8} eyebrow="Setup complete" title={<>You’re all set,<br /><em>{displayName}!</em> 🎉</>} subtitle="Your creative command center is ready to go." />
      <div className="ob-summary-card">
        <div className="ob-summary-title"><span>✦</span><p><small>YOUR MARKETEER</small><b>Launch summary</b></p><em>Ready</em></div>
        <ul>
          <li><i><CheckIcon /></i><p><span>Business profile</span><b>{data.businessName || 'Ready to complete anytime'}</b></p></li>
          <li><i><CheckIcon /></i><p><span>Brand identity</span><b>Logo, colors & {data.voice || data.customVoice || 'brand voice'} saved</b></p><div className="ob-summary-swatches">{data.colors.slice(0, 3).map((color) => <span key={color} style={{ background: color }} />)}</div></li>
          <li><i><CheckIcon /></i><p><span>Connected accounts</span><b>{connectedNames.length ? connectedNames.join(', ') : 'None yet—connect anytime from Settings'}</b></p></li>
          {(data.role === 'Agency' || data.role === 'Freelancer') && <li><i><CheckIcon /></i><p><span>Workspace</span><b>{data.workspaceName || 'Personal workspace'} · {data.invites.length + 1} member{data.invites.length ? 's' : ''}</b></p></li>}
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
