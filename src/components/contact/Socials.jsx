import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap, ScrollTrigger, useGSAP } from '../../animations/gsap'
import { scrollToTarget } from '../../animations/lenis'
import { useLang } from '../../state/LangContext'
import { social } from '../../content/site'
import { ui } from '../../content/ui'
import { prefersReducedMotion, supportsWebGL } from '../../utils/env'
import { pourPhase } from '../../utils/pour'
import { Scene } from '../../three/Scene'
import { SocialIcon } from '../brand/SocialIcon'
import { Words } from '../ui/Words'

const COPY = {
  eyebrow: { en: 'Follow the Maison', ar: 'تابعوا الدار' },
  title: { en: 'Every celebration, shared.', ar: 'كل احتفال، نشاركه معكم.' },
  lead: { en: 'Keep scrolling: each account is poured fresh.', ar: 'تابعوا التمرير: كل حساب يُسكب من جديد.' },
  open: { en: 'Open', ar: 'افتح' },
  goTo: { en: 'Go to', ar: 'انتقل إلى' },
}

// Each account is its own chocolate: the screen's colour and the praline's.
const THEMES = ['deep', 'ivory', 'mocha', 'blush', 'deep', 'ivory']
const TONES = ['#7A4528', '#2E170D', '#D9A89A', '#3A1C0F', '#EBD7BE', '#6B3F26']

const IDS = social.map((account) => account.id)
const LAST = social.length - 1
const pad = (n) => String(n).padStart(2, '0')

/** Latin names fall in letter by letter; Arabic stays whole, since its letters join. */
function Name({ text, rtl }) {
  if (rtl) return <Words as="span" text={text} reveal={false} />
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {[...text].map((ch, i) => <span key={i} className="w"><span className="wi">{ch}</span></span>)}
      </span>
    </>
  )
}

/**
 * The Maison's accounts, poured one at a time. The stage holds still while the
 * section scrolls: a sheet of molten chocolate rises over each account and lifts
 * away, drips hanging, to reveal the next, while the praline at its centre sinks
 * and comes back up with the next mark. Without WebGL, or with reduced motion,
 * the accounts are simply stacked.
 */
export function Socials() {
  const root = useRef(null)
  const track = useRef(null)
  const pour = useRef({ raw: 0, mouseX: 0, mouseY: 0 })
  const [moving] = useState(() => supportsWebGL() && !prefersReducedMotion())
  const [active, setActive] = useState(0)
  const [entered, setEntered] = useState(false)
  const { t, rtl } = useLang()

  useEffect(() => {
    if (!moving) return undefined
    const move = (e) => {
      pour.current.mouseX = (e.clientX / window.innerWidth) * 2 - 1
      pour.current.mouseY = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [moving])

  useGSAP(() => {
    if (!moving) return
    ScrollTrigger.create({
      trigger: track.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        pour.current.raw = self.progress * LAST
        const { shown } = pourPhase(pour.current.raw, LAST)
        setActive((current) => (current === shown ? current : shown))
      },
    })
    ScrollTrigger.create({ trigger: track.current, start: 'top 65%', once: true, onEnter: () => setEntered(true) })
    gsap.fromTo('.pour__progress i', { scaleX: 0 }, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: track.current, start: 'top top', end: 'bottom bottom', scrub: true },
    })
  }, { scope: root, dependencies: [moving] })

  // Each account sets as the chocolate leaves it: letters drop and stretch, then settle.
  useGSAP(() => {
    if (!moving) return
    const panel = root.current.querySelectorAll('.pour__panel')[active]
    const letters = panel.querySelectorAll('.pour__name .wi')
    const lines = panel.querySelectorAll('[data-in]')
    if (!entered) {
      gsap.set(letters, { yPercent: -120, scaleY: 1.6 })
      gsap.set(lines, { y: 30, opacity: 0 })
      return
    }
    gsap.timeline({ delay: 0.12 })
      .fromTo(letters, { yPercent: -120, scaleY: 1.6, transformOrigin: '50% 0%' }, { yPercent: 0, scaleY: 1, duration: 1.1, ease: 'elastic.out(1, 0.55)', stagger: 0.045 })
      .fromTo(lines, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 0.2)
  }, { scope: root, dependencies: [active, entered, moving, rtl] })

  const jump = (i) => {
    const top = track.current.getBoundingClientRect().top + window.scrollY
    scrollToTarget(top + i * window.innerHeight, { offset: 0 })
  }

  return (
    <section ref={root} className={`pour ${moving ? '' : 'pour--still'}`} data-theme="deep" aria-labelledby="pour-title">
      <header className="pour__intro wrap">
        <p className="eyebrow" data-reveal="fade">{t(COPY.eyebrow)}</p>
        <Words as="h1" id="pour-title" className="display t-hero" text={t(COPY.title)} />
        <p className="t-lead muted measure" data-reveal="fade">{t(COPY.lead)}</p>
      </header>

      <div ref={track} className="pour__track" style={{ '--count': social.length }}>
        <div className="pour__stage" data-theme={moving ? THEMES[active % THEMES.length] : undefined}>
          <ol className="pour__panels">
            {social.map((account, i) => {
              const on = !moving || i === active
              return (
                <li key={account.id} className={`pour__panel wrap ${on ? 'is-on' : ''}`} data-theme={THEMES[i % THEMES.length]} inert={!on}>
                  <p className="pour__top" data-in>
                    <span className="pour__index">{pad(i + 1)} / {pad(social.length)}</span>
                    <span className="pour__action"><SocialIcon id={account.id} />{t(account.action)}</span>
                  </p>
                  <h3 className="pour__name display"><Name text={t(account.name)} rtl={rtl} /></h3>
                  {moving ? null : (
                    <span className="pour__medal" aria-hidden="true" style={{ '--tone': TONES[i % TONES.length] }}><SocialIcon id={account.id} /></span>
                  )}
                  <div className="pour__bottom">
                    <p className="pour__handle" dir="ltr" data-in>{account.handle}</p>
                    <div data-in>
                      <a className="btn pour__cta" href={account.url} target="_blank" rel="noopener noreferrer" data-cursor={t(COPY.open)}>
                        <span>{t(COPY.open)} {t(account.name)}</span>
                        <ArrowUpRight className="flip" aria-hidden="true" />
                        <span className="sr-only">{t(ui.newTab)}</span>
                      </a>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>

          {moving ? (
            <>
              <Scene name="pour" ids={IDS} tones={TONES} state={pour} />
              <div className="pour__ui">
                <span className="pour__progress" aria-hidden="true"><i /></span>
                <nav className="pour__dots" aria-label={t(COPY.eyebrow)}>
                  {social.map((account, i) => (
                    <button key={account.id} type="button" aria-label={`${t(COPY.goTo)} ${t(account.name)}`} aria-current={i === active ? 'true' : undefined} onClick={() => jump(i)}>
                      <SocialIcon id={account.id} />
                    </button>
                  ))}
                </nav>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
