import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../../animations/gsap'
import { scrollToTarget } from '../../animations/lenis'
import { useLang } from '../../state/LangContext'
import { useIntroDone } from '../../state/intro'
import { journey, pergola } from '../../content/events'
import { ui } from '../../content/ui'
import { hasFinePointer, prefersReducedMotion } from '../../utils/env'
import { Button } from '../ui/Button'
import { Picture } from '../ui/Picture'
import '../../styles/weddings-hero.css'

const COPY = {
  headline: { en: 'See your celebration before it begins.', ar: 'شوفوا فرحتكم قبل لا تبدأ.' },
  intro: {
    en: 'A wedding is not a date on a calendar. It is a story you tell once, in front of everyone you love. At Ghalia, we help you tell it beautifully.',
    ar: 'العرس مو تاريخ في التقويم. العرس قصة تنحكى مرة وحدة، قدّام كل اللي تحبونهم. وفي غالية نساعدكم تحكونها بأجمل صورة.',
  },
  page: { en: 'Weddings and Events', ar: 'الأعراس والمناسبات' },
  hint: { en: 'Explore the space', ar: 'استكشفوا المكان' },
}

// Where each of the pergola's own spaces sits in the photograph, as a share of its width and height.
const SPOTS = [
  { zone: 1, x: 52, y: 27 },
  { zone: 3, x: 84, y: 46 },
  { zone: 4, x: 58, y: 58 },
  { zone: 2, x: 48, y: 68 },
]

/** Words only: splitting letters would break Arabic's joined script. Each word rises out of its own mask. */
function Title({ text }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <h1 className="wh__title">
      {words.map((word, i) => (
        <span key={i}>
          <span className="wh__w"><span className="wh__wi">{word}</span></span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </h1>
  )
}

/**
 * The Weddings and Events opening: a walk through the celebration. A full-screen golden-hour photograph that a
 * warm light follows the cursor across, with the pergola's spaces as hotspots that open onto their own photos.
 */
export function WeddingsHero() {
  const root = useRef(null)
  const { t, lang } = useLang()
  const introDone = useIntroDone()
  const reduced = prefersReducedMotion()
  const [open, setOpen] = useState(2)
  const numbers = new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en')

  useGSAP(() => {
    if (reduced) return undefined
    const q = gsap.utils.selector(root)
    gsap.set(q('.wh__photo'), { clipPath: 'circle(0% at 66% 46%)' })
    gsap.set(q('.wh__scene'), { scale: 1.3 })
    gsap.set(q('.wh__shade'), { opacity: 0 })
    gsap.set(q('.wh__eyebrow, .wh__intro, .wh__actions, .wh__hint'), { opacity: 0, y: 24 })
    gsap.set(q('.wh__wi'), { yPercent: 115, rotate: 4, opacity: 0 })
    gsap.set(q('.wh__spot'), { scale: 0, opacity: 0 })
    gsap.set(q('.wh__line'), { scaleX: 0 })
    gsap.set(q('.wh__step'), { opacity: 0, y: 22 })
    return undefined
  }, { scope: root, dependencies: [lang] })

  useGSAP(() => {
    if (reduced || !introDone) return undefined
    const q = gsap.utils.selector(root)
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.to(q('.wh__photo'), { clipPath: 'circle(150% at 66% 46%)', duration: 2.4, ease: 'power3.inOut' }, 0)
      .to(q('.wh__scene'), { scale: 1, duration: 3.6, ease: 'power3.out' }, 0)
      .to(q('.wh__shade'), { opacity: 1, duration: 2 }, 0.6)
      .to(q('.wh__eyebrow'), { opacity: 1, y: 0, duration: 1.2 }, 0.9)
      .to(q('.wh__wi'), { yPercent: 0, rotate: 0, opacity: 1, duration: 1.5, stagger: 0.07 }, 1.0)
      .to(q('.wh__intro'), { opacity: 1, y: 0, duration: 1.3 }, 1.7)
      .to(q('.wh__actions'), { opacity: 1, y: 0, duration: 1.2 }, 1.9)
      .to(q('.wh__spot'), { scale: 1, opacity: 1, duration: 0.9, stagger: 0.18, ease: 'back.out(2)' }, 2.1)
      .to(q('.wh__hint'), { opacity: 1, y: 0, duration: 1 }, 2.6)
      .to(q('.wh__line'), { scaleX: 1, duration: 2.2, ease: 'power3.inOut' }, 1.8)
      .to(q('.wh__step'), { opacity: 1, y: 0, duration: 1, stagger: 0.13 }, 2.0)
    return () => tl.kill()
  }, { scope: root, dependencies: [introDone, lang] })

  // A warm light follows the cursor, the photograph shifts a little against it, and scrolling pulls the room back.
  useGSAP(() => {
    if (reduced) return undefined
    const q = gsap.utils.selector(root)
    const el = root.current
    const cleanups = []

    if (hasFinePointer()) {
      const pos = { x: 66, y: 44 }
      const setVars = () => {
        el.style.setProperty('--mx', `${pos.x}%`)
        el.style.setProperty('--my', `${pos.y}%`)
      }
      setVars()
      const lightX = gsap.quickTo(pos, 'x', { duration: 1.1, ease: 'power3.out', onUpdate: setVars })
      const lightY = gsap.quickTo(pos, 'y', { duration: 1.1, ease: 'power3.out', onUpdate: setVars })
      const sceneX = gsap.quickTo(q('.wh__scene')[0], 'x', { duration: 1.6, ease: 'power3.out' })
      const sceneY = gsap.quickTo(q('.wh__scene')[0], 'y', { duration: 1.6, ease: 'power3.out' })
      const move = (e) => {
        const r = el.getBoundingClientRect()
        const nx = (e.clientX - r.left) / r.width
        const ny = (e.clientY - r.top) / r.height
        lightX(nx * 100)
        lightY(ny * 100)
        sceneX((0.5 - nx) * 36)
        sceneY((0.5 - ny) * 22)
      }
      el.addEventListener('pointermove', move, { passive: true })
      cleanups.push(() => el.removeEventListener('pointermove', move))
    }

    const scrub = { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.8 }
    gsap.to(q('.wh__photo'), { yPercent: 8, scale: 1.08, ease: 'none', scrollTrigger: scrub })
    gsap.to(q('.wh__copy'), { yPercent: -12, opacity: 0.2, ease: 'none', scrollTrigger: scrub })
    gsap.to(q('.wh__journey'), { yPercent: 40, opacity: 0, ease: 'none', scrollTrigger: { ...scrub, end: '60% top' } })
    return () => cleanups.forEach((fn) => fn())
  }, { scope: root, dependencies: [lang] })

  const toNext = () => {
    const next = root.current?.nextElementSibling
    if (next) scrollToTarget(next, { offset: 0 })
  }

  return (
    <header ref={root} className="wh" data-tone="light">
      <div className="wh__photo" aria-hidden="true">
        <div className="wh__scene">
          <Picture id="pergola-ceremony" priority alt="" sizes="130vw" />
          {SPOTS.map(({ zone, x, y }, i) => {
            const item = pergola.zones[zone]
            const name = t(item.name)
            const isOpen = open === i
            return (
              <div key={item.name.en} className={`wh__spot ${isOpen ? 'is-open' : ''} ${x > 50 ? 'is-end' : ''} ${y > 50 ? 'is-up' : ''}`} style={{ insetInlineStart: `${x}%`, insetBlockStart: `${y}%` }}>
                <button
                  type="button"
                  className="wh__dot"
                  aria-expanded={isOpen}
                  aria-label={name}
                  onPointerEnter={() => setOpen(i)}
                  onFocus={() => setOpen(i)}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                />
                <div className="wh__card" role="group" aria-label={name}>
                  <div className="wh__card-img arch"><Picture id={item.image} alt="" sizes="12rem" /></div>
                  <p className="wh__card-name">{name}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="wh__shade" aria-hidden="true" />

      <div className="wh__grid wrap">
        <div className="wh__copy">
          <p className="wh__eyebrow">{t(COPY.page)}</p>
          <Title text={t(COPY.headline)} />
          <p className="wh__intro">{t(COPY.intro)}</p>
          <div className="wh__actions">
            <Button to="/studio">{t(ui.openStudio)}</Button>
          </div>
        </div>
      </div>

      <p className="wh__hint"><span aria-hidden="true" className="wh__pulse" />{t(COPY.hint)}</p>

      <nav className="wh__journey wrap" aria-label={t({ en: 'How it works', ar: 'كيف نشتغل' })}>
        <span className="wh__line" aria-hidden="true" />
        <ol>
          {journey.map((step, i) => (
            <li key={step.title.en} className="wh__step">
              <button type="button" onClick={toNext}>
                <span className="wh__num" aria-hidden="true">{numbers.format(0)}{numbers.format(i + 1)}</span>
                <span className="wh__name">{t(step.title)}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </header>
  )
}
