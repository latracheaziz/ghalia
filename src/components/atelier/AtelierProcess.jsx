import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../animations/gsap'
import { useLang } from '../../state/LangContext'
import { patisserie } from '../../content/pages'
import { isSmallScreen, prefersReducedMotion } from '../../utils/env'
import { Picture } from '../ui/Picture'
import '../../styles/atelier.css'

/**
 * How it is made, in the three stages the copy names. On a desktop the section holds still while you scroll:
 * the list on one side lights each stage in turn, and the photograph of the atelier beside it changes with it.
 * On phones, or with reduced motion, each stage simply sits above its photograph.
 */
export function AtelierProcess() {
  const root = useRef(null)
  const { t, lang } = useLang()
  const { atelier } = patisserie
  const [moving] = useState(() => !isSmallScreen() && !prefersReducedMotion())
  const [active, setActive] = useState(0)
  const last = atelier.steps.length - 1
  const numbers = new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en')

  useGSAP(() => {
    if (!moving) return undefined
    const trigger = ScrollTrigger.create({
      trigger: root.current,
      start: 'top top',
      end: () => `+=${window.innerHeight * (atelier.steps.length * 0.9)}`,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        root.current.style.setProperty('--ap-progress', String(self.progress))
        setActive(Math.min(last, Math.floor(self.progress * atelier.steps.length)))
      },
    })
    return () => trigger.kill()
  }, { scope: root, dependencies: [moving, lang] })

  const jump = (i) => {
    const st = ScrollTrigger.getAll().find((s) => s.trigger === root.current)
    if (!st) return
    const span = st.end - st.start
    window.scrollTo({ top: st.start + (span * (i + 0.5)) / atelier.steps.length, behavior: 'smooth' })
  }

  return (
    <section ref={root} className={`ap ${moving ? 'ap--pinned' : ''}`} data-theme="deep" aria-label={t(atelier.label)}>
      <div className="ap__inner wrap">
        <div className="ap__list">
          <p className="ap__label">{t(atelier.label)}</p>
          <ol>
            {atelier.steps.map((step, i) => (
              <li key={step.title.en} className={`ap__step ${!moving || i === active ? 'is-on' : ''}`}>
                <button type="button" onClick={() => (moving ? jump(i) : undefined)} aria-current={moving && i === active ? 'step' : undefined}>
                  <span className="ap__num" aria-hidden="true">{numbers.format(0)}{numbers.format(i + 1)}</span>
                  <span className="ap__name display">{t(step.title)}</span>
                </button>
                {moving ? null : (
                  <div className="ap__still frame grain">
                    <Picture id={step.image} alt={t(step.alt)} sizes="(max-width: 56rem) 90vw, 46vw" />
                  </div>
                )}
              </li>
            ))}
          </ol>
          {moving ? <span className="ap__bar" aria-hidden="true"><i /></span> : null}
        </div>

        {moving ? (
          <div className="ap__stage" aria-live="polite">
            {atelier.steps.map((step, i) => (
              <div key={step.image} className={`ap__shot arch grain ${i === active ? 'is-on' : ''}`}>
                <Picture id={step.image} alt={t(step.alt)} sizes="(max-width: 56rem) 90vw, 44vw" />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
