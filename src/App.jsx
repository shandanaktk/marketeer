import { useEffect, useState } from 'react'
import OnboardingFlow from './OnboardingFlow.jsx'
import LandingPage from './LandingPage.jsx'
import { useTheme } from './theme.jsx'

function getView() {
  const view = new URLSearchParams(window.location.search).get('view')
  return ['signin', 'signup', 'onboarding', 'dashboard'].includes(view) ? view : 'home'
}

export default function App() {
  const [view, setView] = useState(getView)
  const [theme, onToggleTheme] = useTheme()
  useEffect(() => {
    const onPopState = () => setView(getView())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  const navigate = (next) => {
    window.history.pushState({}, '', next === 'home' ? window.location.pathname : `${window.location.pathname}?view=${next}`)
    window.scrollTo({ top: 0, behavior: 'instant' })
    setView(next)
  }
  if (view !== 'home') return <OnboardingFlow initialView={view} onNavigate={navigate} theme={theme} onToggleTheme={onToggleTheme} />
  return <LandingPage navigate={navigate} theme={theme} onToggleTheme={onToggleTheme} />
}
