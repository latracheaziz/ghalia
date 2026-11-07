import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useLang } from '../../state/LangContext'
import { useTransition } from '../../state/TransitionContext'
import { ui } from '../../content/ui'
import { Wordmark } from '../brand/Logo'
import { TLink } from '../ui/TLink'
import { Menu } from './Menu'

/** Reads the section under the header so the bar stays legible on any background. */
function toneAtTop() {
  const stack = document.elementsFromPoint(window.innerWidth / 2, 36)
  for (const el of stack) {
    if (el.closest('.header')) continue
    const host = el.closest('[data-tone], [data-theme]')
    if (!host) continue
    if (host.dataset.tone) return host.dataset.tone
    return ['mocha', 'deep'].includes(host.dataset.theme) ? 'light' : 'dark'
  }
  return 'dark'
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const { t } = useLang()
  const { switchLanguage } = useTransition()
  const { pathname } = useLocation()
  const lastY = useRef(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      setHidden(y > 240 && y > lastY.current + 2 ? true : y < lastY.current - 2 ? false : (v) => v)
      lastY.current = y
      setAtTop(y < 120)
      document.documentElement.dataset.nav = toneAtTop()
    }
    const onScroll = () => { frame ||= requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    const settle = setTimeout(update, 1600)
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
      clearTimeout(settle)
    }
  }, [pathname])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      <header className={`header ${hidden && !menuOpen ? 'header--hidden' : ''} ${pathname === '/' && atTop ? 'header--bare' : ''} ${pathname === '/studio' || (pathname === '/order' && atTop) ? 'header--split' : ''}`}>
        <div className="header__start">
          <button type="button" className="header__btn" aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen(true)}>
            <span className="burger" aria-hidden="true"><i /><i /></span>
            <span className="header__label">{t(ui.menu)}</span>
            <span className="sr-only">{t(ui.menu)}</span>
          </button>
        </div>
        <TLink to="/" aria-label="GHALIA" className="header__logo"><Wordmark /></TLink>
        <div className="header__end">
          <button type="button" className="header__btn header__lang" aria-label={t(ui.languageLabel)} onClick={switchLanguage}>{t(ui.language)}</button>
        </div>
      </header>
      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
