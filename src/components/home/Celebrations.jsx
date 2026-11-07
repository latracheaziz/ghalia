import { useRef } from 'react'
import { gsap, useGSAP } from '../../animations/gsap'
import { useLang } from '../../state/LangContext'
import { ui } from '../../content/ui'
import { about } from '../../content/maison'
import { prefersReducedMotion } from '../../utils/env'
import { Picture } from '../ui/Picture'
import { Button } from '../ui/Button'

/** A small arch opens until it becomes the whole room. */
export function Celebrations() {
  const root = useRef(null)
  const { t } = useLang()

  useGSAP(() => {
    if (prefersReducedMotion()) return
    const photo = root.current.querySelector('.open-arch__mask img')
    const focus = getComputedStyle(photo).objectPosition
    gsap.timeline({
      scrollTrigger: { trigger: root.current, start: 'top top', end: '+=140%', pin: true, scrub: 0.5, anticipatePin: 1 },
      defaults: { ease: 'none' },
    })
      .fromTo('.open-arch__mask', { clipPath: 'inset(16% 33% 0% 33% round 34vw 34vw 0 0)' }, { clipPath: 'inset(0% 0% 0% 0% round 0vw 0vw 0 0)', duration: 0.6 })
      .fromTo(photo, { scale: 1.35, objectPosition: '50% 50%' }, { scale: 1, objectPosition: focus, duration: 0.6 }, 0)
      .fromTo('.open-arch__title', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.18 }, 0.1)
      .fromTo('.open-arch__copy', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.25 }, 0.55)
  }, { scope: root })

  return (
    <section ref={root} id="celebrations" className="open-arch" data-theme="deep" data-chapter={t(ui.chapters.celebrations)}>
      <h2 className="open-arch__title display t-mega">{t({ en: 'Celebrations', ar: 'الاحتفالات' })}</h2>
      <div className="open-arch__mask grain">
        <Picture id="pergola" sizes="max(100vw, 185vh)" alt={t({ en: 'The GHALIA de Chocolat pergola at dusk, dressed with flowers, drapes and lanterns', ar: 'برجولة غالية عند الغروب مزينة بالزهور والستائر والفوانيس' })} />
      </div>
      <div className="open-arch__copy wrap">
        <p className="eyebrow">{t({ en: 'Weddings & Events', ar: 'الزفاف والمناسبات' })}</p>
        <p className="t-lead measure">{t(about[1])}</p>
        <div className="actions">
          <Button to="/studio">{t(ui.openStudio)}</Button>
          <Button to="/weddings" variant="ghost">{t(ui.planEvent)}</Button>
        </div>
      </div>
    </section>
  )
}
