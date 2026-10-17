import { useEffect } from 'react'
import { ThemeButton } from './theme.jsx'
import { Arrow } from './landingIcons.jsx'

function Wordmark() {
  return <span className="mk-wordmark">marketeer<span>↗</span></span>
}

const privacySections = [
  {
    title: 'Who we are',
    body: [
      'Marketeer (“we”, “us”, or “our”) provides an AI-powered platform for creating social content, planning campaigns, and launching Meta ads. This Privacy Policy explains how we collect, use, store, and share information when you visit our website or use our product.',
      'If you have questions about this policy, contact us at privacy@marketeer.app.',
    ],
  },
  {
    title: 'Information we collect',
    body: [
      'Account information: name, email address, password (stored in hashed form), and profile details you provide during signup or onboarding.',
      'Business and brand data: business name, industry, website, brand voice, colors, logos, goals, and other workspace settings you enter so we can generate on-brand content and campaigns.',
      'Connected accounts: when you connect Meta, Facebook, Instagram, or other platforms, we receive tokens and account identifiers needed to publish content, manage ads, and pull performance data you request. We only request the permissions required for those features.',
      'Usage and device data: product interactions, feature usage, approximate location derived from IP, browser type, device identifiers, and diagnostic logs that help us keep the service reliable and secure.',
      'Payment and billing data: if you subscribe to a paid plan, our payment processor collects billing details. We do not store full card numbers on our servers.',
    ],
  },
  {
    title: 'How we use your information',
    body: [
      'Provide, personalize, and improve Marketeer — including AI content generation, scheduling, collaboration, and Meta campaign tools.',
      'Authenticate your account, secure the service, prevent abuse, and troubleshoot issues.',
      'Communicate with you about product updates, security notices, and (with your consent where required) marketing messages you can opt out of at any time.',
      'Comply with legal obligations and enforce our Terms of Service.',
    ],
  },
  {
    title: 'AI processing',
    body: [
      'Marketeer uses AI models to generate captions, creatives, campaign suggestions, and related outputs from the brand and campaign inputs you provide. We process that content to deliver the features you request.',
      'We do not sell your content. Where we use third-party model providers, we do so under contracts that restrict use of your data to providing the service to us and you.',
    ],
  },
  {
    title: 'How we share information',
    body: [
      'Service providers that help us host, authenticate, process payments, send email, store media, or run AI features — only as needed to operate Marketeer.',
      'Connected platforms (such as Meta) when you choose to publish content or run ads through those integrations.',
      'Professional advisors or authorities when required by law, or to protect the rights, safety, and security of Marketeer, our users, or the public.',
      'A successor entity if we are involved in a merger, acquisition, or asset sale, subject to appropriate confidentiality and notice where required.',
      'We do not sell your personal information.',
    ],
  },
  {
    title: 'Cookies and similar technologies',
    body: [
      'We use cookies and similar technologies for authentication, preferences (such as theme), analytics, and security. You can control cookies through your browser settings. Disabling some cookies may limit how Marketeer works.',
    ],
  },
  {
    title: 'Data retention',
    body: [
      'We keep account and workspace data for as long as your account is active, and for a reasonable period afterward if needed for backups, legal compliance, dispute resolution, or security. You can request deletion of your account and associated personal data as described below.',
    ],
  },
  {
    title: 'Security',
    body: [
      'We use industry-standard measures such as encryption in transit, access controls, and monitoring to protect your information. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.',
    ],
  },
  {
    title: 'Your rights and choices',
    body: [
      'Depending on where you live, you may have rights to access, correct, delete, or export your personal data, object to or restrict certain processing, and withdraw consent where processing is based on consent.',
      'You can update many account details in the product. To exercise other rights, email privacy@marketeer.app. You may also disconnect social accounts at any time from your workspace settings.',
      'If you are in the EEA, UK, or a similar jurisdiction, you may have the right to lodge a complaint with your local supervisory authority.',
    ],
  },
  {
    title: 'International transfers',
    body: [
      'We may process and store information in countries other than where you live. When we transfer personal data internationally, we use appropriate safeguards required by applicable law.',
    ],
  },
  {
    title: 'Children',
    body: [
      'Marketeer is not directed to children under 16, and we do not knowingly collect personal information from them. If you believe a child has provided us data, contact us and we will take appropriate steps to delete it.',
    ],
  },
  {
    title: 'Changes to this policy',
    body: [
      'We may update this Privacy Policy from time to time. We will post the revised version on this page and update the “Last updated” date. Material changes may also be communicated by email or in-product notice.',
    ],
  },
]

const termsSections = [
  {
    title: 'Agreement to these terms',
    body: [
      'These Terms of Service (“Terms”) govern your access to and use of Marketeer’s website, product, and related services (the “Service”). By creating an account or using Marketeer, you agree to these Terms and our Privacy Policy.',
      'If you use Marketeer on behalf of a company or other entity, you represent that you have authority to bind that entity, and “you” refers to that entity.',
    ],
  },
  {
    title: 'The service',
    body: [
      'Marketeer helps you create social content, manage brand workspaces, collaborate with teammates, and launch and monitor Meta advertising campaigns. Features may change as we improve the product.',
      'Some capabilities depend on third-party platforms (for example Meta, Facebook, and Instagram). Their availability, policies, and APIs are outside our control.',
    ],
  },
  {
    title: 'Accounts and eligibility',
    body: [
      'You must provide accurate account information and keep it up to date. You are responsible for safeguarding your credentials and for activity under your account.',
      'You must be at least 16 years old (or the minimum age of digital consent in your country) to use Marketeer. The Service is intended for business and professional use.',
    ],
  },
  {
    title: 'Acceptable use',
    body: [
      'You agree not to misuse the Service. That includes not: violating laws or platform policies; uploading unlawful, harmful, or infringing content; attempting to access systems or data without authorization; interfering with the Service; reverse engineering except where allowed by law; or using Marketeer to send spam or deceptive advertising.',
      'You are solely responsible for the content, ads, targeting, and claims you publish through Marketeer, including compliance with advertising, consumer protection, and platform rules.',
    ],
  },
  {
    title: 'Your content and licenses',
    body: [
      'You retain ownership of the content, brand assets, and materials you submit to Marketeer (“Customer Content”).',
      'You grant us a worldwide, non-exclusive license to host, process, transmit, and display Customer Content solely to provide and improve the Service, including generating AI outputs you request.',
      'You represent that you have the rights needed to submit Customer Content and to grant the license above.',
    ],
  },
  {
    title: 'AI-generated outputs',
    body: [
      'AI features produce suggestions that may be inaccurate, incomplete, or unsuitable for your use case. You are responsible for reviewing and approving all content and campaigns before publishing.',
      'Subject to these Terms and third-party rights, you may use AI-generated outputs created for your workspace in connection with your business. We do not guarantee uniqueness or uninterrupted availability of any particular output.',
    ],
  },
  {
    title: 'Third-party services',
    body: [
      'Connecting social or advertising accounts is optional and subject to those providers’ terms. You authorize us to act on your behalf within the permissions you grant.',
      'We are not responsible for third-party outages, policy changes, account suspensions, or data once it has been published to an external platform.',
    ],
  },
  {
    title: 'Subscriptions, trials, and billing',
    body: [
      'Paid plans, trials, and pricing are described at signup or in your workspace. Fees are billed in advance according to the plan you select, unless stated otherwise.',
      'Unless cancelled before the renewal date, subscriptions renew automatically. Taxes may apply. Except where required by law, fees are non-refundable.',
      'We may change pricing with reasonable notice. Continued use after the change takes effect constitutes acceptance.',
    ],
  },
  {
    title: 'Intellectual property',
    body: [
      'Marketeer, including its software, design, trademarks, and documentation, is owned by us or our licensors. These Terms do not grant you any right to our branding except as needed to use the Service.',
      'Feedback you share may be used by us without obligation to you.',
    ],
  },
  {
    title: 'Suspension and termination',
    body: [
      'You may stop using Marketeer at any time and may request account closure by contacting us.',
      'We may suspend or terminate access if you breach these Terms, create risk or legal exposure, or if we discontinue the Service. We will try to provide notice when reasonable.',
      'Upon termination, your right to use the Service ends. Provisions that by nature should survive (including ownership, disclaimers, and limitations of liability) will survive.',
    ],
  },
  {
    title: 'Disclaimers',
    body: [
      'THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
      'We do not warrant that the Service will be uninterrupted, error-free, or that AI outputs will meet your expectations or produce any particular business result.',
    ],
  },
  {
    title: 'Limitation of liability',
    body: [
      'TO THE MAXIMUM EXTENT PERMITTED BY LAW, MARKETEER AND ITS AFFILIATES WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, REVENUE, DATA, OR GOODWILL.',
      'OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATED TO THE SERVICE WILL NOT EXCEED THE AMOUNTS YOU PAID US FOR THE SERVICE IN THE TWELVE MONTHS BEFORE THE CLAIM, OR ONE HUNDRED US DOLLARS IF YOU HAVE NOT HAD A PAID PLAN.',
    ],
  },
  {
    title: 'Indemnity',
    body: [
      'You will defend and indemnify Marketeer and its affiliates against claims, damages, and expenses arising from your Customer Content, your use of the Service, your ads or publications, or your breach of these Terms or applicable law.',
    ],
  },
  {
    title: 'Changes to the terms',
    body: [
      'We may update these Terms from time to time. We will post the updated Terms on this page and update the “Last updated” date. If changes are material, we may provide additional notice. Continued use after the effective date means you accept the updated Terms.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'Questions about these Terms? Contact us at legal@marketeer.app.',
    ],
  },
]

function LegalNav({ page, navigate, theme, onToggleTheme }) {
  return (
    <header className="mk-nav mk-legal-nav">
      <button type="button" className="mk-legal-brand" aria-label="Marketeer home" onClick={() => navigate('home')}>
        <Wordmark />
      </button>
      <nav className="mk-legal-nav-links" aria-label="Legal pages">
        <button type="button" className={page === 'privacy' ? 'is-active' : ''} onClick={() => navigate('privacy')}>Privacy</button>
        <button type="button" className={page === 'terms' ? 'is-active' : ''} onClick={() => navigate('terms')}>Terms</button>
      </nav>
      <div className="mk-nav-actions">
        <ThemeButton theme={theme} onToggle={onToggleTheme} />
        <button type="button" className="mk-button mk-nav-signup" onClick={() => navigate('signup')}>Sign up <Arrow /></button>
        <button type="button" className="mk-login" onClick={() => navigate('signin')}>Login</button>
      </div>
    </header>
  )
}

export default function LegalPage({ page, navigate, theme, onToggleTheme }) {
  const isPrivacy = page === 'privacy'
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service'
  const eyebrow = isPrivacy ? 'YOUR DATA, YOUR CONTROL' : 'THE FINE PRINT, MADE CLEAR'
  const intro = isPrivacy
    ? 'How Marketeer collects, uses, and protects information when you use our product and website.'
    : 'The rules for using Marketeer — your account, content, AI features, and what we both agree to.'
  const sections = isPrivacy ? privacySections : termsSections
  const other = isPrivacy
    ? { label: 'Terms of Service', view: 'terms' }
    : { label: 'Privacy Policy', view: 'privacy' }

  useEffect(() => {
    document.title = `${title} · Marketeer`
    return () => { document.title = 'Marketeer' }
  }, [title])

  return (
    <div className="mk-site mk-legal-site mk-loaded mk-scrolled">
      <a className="mk-skip-link" href="#main">Skip to content</a>
      <LegalNav page={page} navigate={navigate} theme={theme} onToggleTheme={onToggleTheme} />
      <main id="main" className="mk-legal">
        <header className="mk-legal-hero">
          <div className="mk-legal-hero-grid" aria-hidden="true" />
          <div className="mk-legal-hero-copy">
            <p className="mk-overline">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="mk-legal-intro">{intro}</p>
            <p className="mk-legal-updated">Last updated · October 15, 2026</p>
          </div>
        </header>
        <div className="mk-legal-body">
          <div className="mk-legal-toolbar">
            <button type="button" className="mk-legal-switch" onClick={() => navigate(other.view)}>
              See {other.label} <Arrow />
            </button>
          </div>
          <article className="mk-legal-content">
            {sections.map((section) => {
              const id = section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
              return (
                <section key={section.title} id={id}>
                  <h2>{section.title}</h2>
                  {section.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                </section>
              )
            })}
            <div className="mk-legal-cta">
              <p>Ready to make your next move?</p>
              <button type="button" className="mk-button mk-button-orange" onClick={() => navigate('signup')}>
                Get started <Arrow />
              </button>
            </div>
          </article>
        </div>
      </main>
      <footer className="mk-footer">
        <button type="button" className="mk-footer-brand" onClick={() => navigate('home')} aria-label="Marketeer home">
          <Wordmark />
        </button>
        <nav className="mk-footer-links" aria-label="Legal">
          <button type="button" className={isPrivacy ? 'is-active' : ''} onClick={() => navigate('privacy')}>Privacy</button>
          <button type="button" className={!isPrivacy ? 'is-active' : ''} onClick={() => navigate('terms')}>Terms</button>
        </nav>
        <span>© 2026 Marketeer. Made for your next move.</span>
        <button type="button" className="mk-footer-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Back to top ↑
        </button>
      </footer>
    </div>
  )
}
