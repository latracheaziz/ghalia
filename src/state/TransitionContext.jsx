import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap, ScrollTrigger } from '../animations/gsap'
import { jumpToTop, scrollToTarget } from '../animations/lenis'
import { prefersReducedMotion } from '../utils/env'
import { Rosette } from '../components/brand/Logo'
import { useLang } from './LangContext'

const TransitionContext = createContext(null)
const SAFETY_MS = 3500

// The curtain rises as an arch, then leaves through the top of the screen.
const HIDDEN = 'inset(100% -30% 0% -30% round 50vw 50vw 0 0)'
const COVERED = 'inset(-20% -30% 0% -30% round 50vw 50vw 0 0)'
const LIFTED = 'inset(-20% -30% 120% -30% round 0 0 50vw 50vw)'

export function TransitionProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang, setLang } = useLang()
  const curtain = useRef(null)
  const covered = useRef(false)
  const pendingHash = useRef(null)

  const cover = useCallback(() => new Promise((resolve) => {
    const el = curtain.current
    covered.current = true
    el.classList.add('is-active')
    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, clipPath: COVERED })
      return resolve()
    }
    gsap.set(el, { autoAlpha: 1, clipPath: HIDDEN })
    gsap.to(el, { clipPath: COVERED, duration: 0.75, ease: 'power3.inOut', onComplete: resolve })
    gsap.fromTo(el.querySelector('svg'), { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.6, delay: 0.25 })
  }), [])

  const uncover = useCallback(() => {
    const el = curtain.current
    if (!covered.current) return
    covered.current = false
    const done = () => {
      gsap.set(el, { autoAlpha: 0 })
      el.classList.remove('is-active')
    }
    if (prefersReducedMotion()) return done()
    gsap.to(el, { clipPath: LIFTED, duration: 0.85, ease: 'power3.inOut', delay: 0.08, onComplete: done })
  }, [])

  /** Every page calls this once it has rendered, which lifts the curtain. */
  const pageReady = useCallback(() => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      uncover()
      document.getElementById('main')?.focus({ preventScroll: true })
      const hash = pendingHash.current
      pendingHash.current = null
      const el = hash && document.getElementById(hash)
      if (el) setTimeout(() => scrollToTarget(el), 500)
    })
  }, [uncover])

  const go = useCallback(async (to) => {
    const [path, hash] = to.split('#')
    if (path === location.pathname) {
      const el = hash && document.getElementById(hash)
      scrollToTarget(el || 0, el ? {} : { offset: 0 })
      return
    }
    pendingHash.current = hash ?? null
    await cover()
    jumpToTop()
    navigate(path)
    // A failed chunk or a same-page query change must never strand the visitor behind the curtain.
    setTimeout(uncover, SAFETY_MS)
  }, [cover, location.pathname, navigate, uncover])

  const switchLanguage = useCallback(async () => {
    await cover()
    setLang(lang === 'ar' ? 'en' : 'ar')
    jumpToTop()
  }, [cover, lang, setLang])

  // Back and forward skip the curtain, so the scroll position is reset here.
  useEffect(() => {
    if (!covered.current) jumpToTop()
  }, [location.pathname])

  const value = useMemo(() => ({ go, pageReady, switchLanguage }), [go, pageReady, switchLanguage])

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <div ref={curtain} className="curtain" aria-hidden="true">
        <Rosette />
      </div>
    </TransitionContext.Provider>
  )
}

export const useTransition = () => useContext(TransitionContext)
