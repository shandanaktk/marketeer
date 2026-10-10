import { useEffect, useRef, useState } from 'react'
import { Icon } from './dashboardUI.jsx'

export default function AccountMenu({ name, email, initials, onSettings, onLogout }) {
  const [open, setOpen] = useState(false)
  const container = useRef(null)
  const trigger = useRef(null)
  const menu = useRef(null)
  const firstFocus = useRef(0)

  useEffect(() => {
    if (!open) return
    const items = menu.current.querySelectorAll('[role="menuitem"]')
    items[firstFocus.current]?.focus()
    const outside = event => {
      if (!container.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('focusin', outside)
    }
  }, [open])

  const close = () => { setOpen(false); trigger.current?.focus() }
  const onKeyDown = event => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close()
      return
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const items = [...menu.current.querySelectorAll('[role="menuitem"]')]
    const current = items.indexOf(document.activeElement)
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
    items[next]?.focus()
  }

  return <div className="db-account" ref={container}>
    <button ref={trigger} type="button" className="db-top-avatar" id="account-menu-trigger" aria-label={`Open account menu for ${name}`} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? 'account-menu' : undefined} onClick={() => { firstFocus.current = 0; setOpen(value => !value) }} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        firstFocus.current = event.key === 'ArrowUp' ? 1 : 0
        setOpen(true)
      } else if (event.key === 'Escape') close()
    }}>{initials}</button>
    {open && <div className="db-account-popover">
      <div className="db-account-identity"><strong>{name}</strong><small>{email}</small></div>
      <div ref={menu} id="account-menu" role="menu" aria-labelledby="account-menu-trigger" onKeyDown={onKeyDown}>
        <a href="?view=dashboard&tab=settings" role="menuitem" onClick={event => {
          if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
          event.preventDefault()
          close()
          onSettings()
        }}><Icon name="settings" size={17} /> Settings <span>↗</span></a>
        <button type="button" role="menuitem" onClick={() => { setOpen(false); onLogout() }}><svg className="db-icon" width="17" height="17" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H4v16h5m6-12 4 4-4 4M9 12h10" /></svg> Log out</button>
      </div>
    </div>}
  </div>
}
