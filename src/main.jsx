import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { LanguageProvider } from './i18n.js'
import '@fontsource-variable/sora'
import './styles.css'
import './enhancements.css'
import './landing.css'
import './appTheme.css'
import './brand.css'
import './macher.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
