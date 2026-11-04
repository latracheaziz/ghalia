import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from '../../animations/gsap'
import { pauseScroll, resumeScroll } from '../../animations/lenis'
import { finishIntro, waitForFirstFrame } from '../../state/intro'
import { useLang } from '../../state/LangContext'
import { ui } from '../../content/ui'
import { prefersReducedMotion, supportsWebGL } from '../../utils/env'
import { Lockup } from '../brand/Logo'

const MAX_WAIT_MS = 7000

function ready(pathname) {
  const waits = [document.fonts.ready]
  if (pathname === '/' && supportsWebGL() && !prefersReducedMotion()) waits.push(waitForFirstFrame())
  const timeout = new Promise((resolve) => { setTimeout(resolve, MAX_WAIT_MS) })
  return Promise.race([Promise.all(waits), timeout])
}

/** The first arch of the visit: drawn while the Maison gets ready, then lifted. */
export function Preloader() {
  const root = useRef(null)
  const [gone, setGone] = useState(false)
  const { t } = useLang()
  const { pathname } = useLocation()
  const entry = useRef(pathname)

  useEffect(() => {
    const el = root.current
    let cancelled = false
    pauseScroll()

    const finish = () => {
      resumeScroll()
      setGone(true)
    }

    if (prefersReducedMotion()) {
      ready(entry.current).then(() => {
        if (cancelled) return
        finishIntro()
        finish()
      })
      return () => { cancelled = true }
    }

    let draw
    // A context restores the logo's styles on cleanup, which StrictMode's second run relies on.
    const context = gsap.context(() => {
      const path = el.querySelector('path')
      const length = path.getTotalLength()
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
      draw = gsap.timeline()
        .to(path, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' })
        .from(el.querySelector('.preloader__logo'), { autoAlpha: 0, y: 14, duration: 1 }, 0.5)
        .from(el.querySelector('.preloader__count'), { autoAlpha: 0, duration: 0.8 }, 0.7)
    })

    Promise.all([ready(entry.current), draw.then()]).then(() => {
      if (cancelled) return
      finishIntro()
      gsap.timeline({ onComplete: finish })
        .to(el.querySelector('.preloader__stage'), { scale: 1.06, autoAlpha: 0, duration: 0.7, ease: 'power2.in' })
        .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut' }, 0.3)
    })

    return () => {
      cancelled = true
      context.revert()
    }
  }, [])

  if (gone) return null

  return (
    <div ref={root} className="preloader" role="status" aria-label={t(ui.loading)}>
      <div className="preloader__stage">
        <svg className="preloader__arch" viewBox="0 0 300 400" fill="none" aria-hidden="true">
          <path d="M1 400V150a149 149 0 0 1 298 0v250" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        </svg>
        <Lockup className="preloader__logo" />
      </div>
      <p className="preloader__count">{t(ui.loading)}</p>
    </div>
  )
}
