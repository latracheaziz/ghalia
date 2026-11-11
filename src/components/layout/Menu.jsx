import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { gsap } from '../../animations/gsap'
import { pauseScroll, resumeScroll } from '../../animations/lenis'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useLang } from '../../state/LangContext'
import { brand, navigation } from '../../content/site'
import { ui } from '../../content/ui'
import { prefersReducedMotion } from '../../utils/env'
import { Picture } from '../ui/Picture'
import { TLink } from '../ui/TLink'

export function Menu({ open, onClose }) {
  const root = useRef(null)
  const [active, setActive] = useState(0)
  const [mounted, setMounted] = useState(false)
  const { t } = useLang()
  const { pathname } = useLocation()

  const close = useCallback(() => onClose(), [onClose])
  useEffect(() => {
    const el = root.current
    if (open) {
      setMounted(true)
      pauseScroll()
      el.hidden = false
      if (!prefersReducedMotion()) {
        gsap.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease: 'expo.inOut' })
        gsap.from(el.querySelectorAll('.menu__link'), { y: 44, autoAlpha: 0, stagger: 0.05, duration: 1, delay: 0.3 })
      }
      return
    }
    resumeScroll()
    if (el.hidden) return
    if (prefersReducedMotion()) {
      el.hidden = true
      return
    }
    gsap.to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'expo.inOut', onComplete: () => { el.hidden = true } })
  }, [open])

  // After the effect above, so the dialog is visible when focus moves into it.
  useFocusTrap(root, open, close)

  return (
    <div ref={root} id="site-menu" className="menu" data-theme="deep" role="dialog" aria-modal="true" aria-label={t(ui.menu)} hidden data-lenis-prevent>
      <button type="button" className="header__btn menu__close" onClick={close}>
        <X size={18} aria-hidden="true" />
        <span>{t(ui.close)}</span>
      </button>
      <nav aria-label={t(ui.menu)} className="menu__list">
        {navigation.map((item, i) => (
          <TLink
            key={item.to}
            to={item.to}
            className="menu__link"
            aria-current={pathname === item.to ? 'page' : undefined}
            onClick={() => { if (pathname === item.to) close() }}
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
          >
            {t(item.label)}
          </TLink>
        ))}
      </nav>
      <div className="menu__aside">
        <div className="arch menu__preview grain">
          {mounted ? navigation.map((item, i) => (
            <Picture key={item.to} id={item.image} alt="" sizes="25rem" className={i === active ? 'is-on' : ''} />
          )) : null}
        </div>
        <p className="menu__meta">{t(brand.location)}</p>
      </div>
    </div>
  )
}
