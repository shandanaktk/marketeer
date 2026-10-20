import { useCallback, useEffect, useState } from 'react'
import OnboardingFlow from './OnboardingFlow.jsx'
import LandingPage from './LandingPage.jsx'
import LegalPage from './LegalPage.jsx'
import { getMe, session } from './api.js'
import { useTheme } from './theme.jsx'
import { t, useLanguage } from './i18n.js'

const VIEWS = ['signin', 'signup', 'onboarding', 'dashboard', 'auth-callback', 'privacy', 'terms']
const PRIVATE = ['onboarding', 'dashboard']
const LEGAL = ['privacy', 'terms']

function pathOf() {
  return window.location.pathname.replace(/\/+$/, '') || '/'
}

function getView() {
  const path = pathOf()
  if (path === '/privacy') return 'privacy'
  if (path === '/terms') return 'terms'
  const view = new URLSearchParams(window.location.search).get('view')
  if (LEGAL.includes(view)) return view
  return VIEWS.includes(view) ? view : 'home'
}

function urlFor(next) {
  if (next === 'home') return '/'
  if (LEGAL.includes(next)) return `/${next}`
  return `/?view=${next}`
}

// Private screens need a session; without one the browser lands on sign-in.
function resolveView() {
  const view = getView()
  if (PRIVATE.includes(view) && !session.active()) {
    window.history.replaceState({}, '', urlFor('signin'))
    return 'signin'
  }
  return view
}

export default function App() {
  const [view, setView] = useState(resolveView)
  const [account, setAccount] = useState(null)
  // The private view the signed-in account was last verified for.
  const [verified, setVerified] = useState(null)
  const [theme, onToggleTheme] = useTheme()
  const { language } = useLanguage()

  useEffect(() => {
    document.title = language === 'de'
      ? 'Marketeer — Content und Kampagnen für Personal Sigma Schwyz'
      : 'Marketeer — Content and campaigns for Personal Sigma Schwyz'
  }, [language])

  useEffect(() => {
    // Old ?view=privacy|terms links redirect to clean paths.
    const params = new URLSearchParams(window.location.search)
    const legacy = params.get('view')
    if (LEGAL.includes(legacy) && !LEGAL.includes(pathOf().slice(1))) {
      window.history.replaceState({}, '', `/${legacy}`)
      setView(legacy)
    }
    const onPopState = () => setView(resolveView())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((next, { replace = false } = {}) => {
    const target = PRIVATE.includes(next) && !session.active() ? 'signin' : next
    window.history[replace ? 'replaceState' : 'pushState']({}, '', urlFor(target))
    window.scrollTo({ top: 0, behavior: 'instant' })
    setView(target)
  }, [])

  // Google / Apple sign-in lands here with the tokens in the URL fragment.
  useEffect(() => {
    if (view !== 'auth-callback') return
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    if (params.get('access_token')) session.store({ access_token: params.get('access_token'), refresh_token: params.get('refresh_token') })
    window.history.replaceState({}, '', '/')
    getMe()
      .then((me) => { setAccount(me); navigate(me.onboarding_completed ? 'dashboard' : 'onboarding', { replace: true }) })
      .catch(() => { session.clear(); navigate('signin', { replace: true }) })
  }, [view, navigate])

  // Confirm the session for private screens; the dashboard needs a finished onboarding.
  useEffect(() => {
    if (!PRIVATE.includes(view)) return undefined
    let cancelled = false
    getMe()
      .then((me) => {
        if (cancelled) return
        setAccount(me)
        if (view === 'dashboard' && !me.onboarding_completed) navigate('onboarding', { replace: true })
        else setVerified(view)
      })
      .catch(() => { if (!cancelled) { session.clear(); navigate('signin', { replace: true }) } })
    return () => { cancelled = true }
  }, [view, navigate])

  const checking = view === 'auth-callback' || (PRIVATE.includes(view) && verified !== view)
  if (checking) {
    return <main className="app-boot" aria-busy="true"><img className="db-mascot db-loader-mark" src="/brand/mark.svg" alt="" /><p>{t('Opening your workspace…')}</p></main>
  }
  const go = (next) => navigate(next === 'signin' && session.active() ? 'dashboard' : next)
  if (LEGAL.includes(view)) {
    return <LegalPage page={view} navigate={go} theme={theme} onToggleTheme={onToggleTheme} />
  }
  if (view !== 'home') {
    return <OnboardingFlow initialView={view} account={account} setAccount={setAccount} onNavigate={navigate} theme={theme} onToggleTheme={onToggleTheme} />
  }
  return <LandingPage navigate={go} theme={theme} onToggleTheme={onToggleTheme} />
}
