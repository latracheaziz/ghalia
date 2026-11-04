import { useRef } from 'react'
import { gsap, useGSAP } from '../../animations/gsap'
import { useLang } from '../../state/LangContext'
import { promise } from '../../content/maison'
import { ui } from '../../content/ui'
import { prefersReducedMotion } from '../../utils/env'
import { Words } from '../ui/Words'

/** "We don't simply..." lit word by word as you read down the page. */
export function PromiseStatement() {
  const root = useRef(null)
  const { t } = useLang()

  useGSAP(() => {
    if (prefersReducedMotion()) return
    gsap.fromTo(gsap.utils.toArray('.wi', root.current), { opacity: 0.16 }, {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top 72%', end: 'bottom 62%', scrub: 0.4 },
    })
  }, { scope: root })

  return (
    <section ref={root} id="promise" className="section wrap promise" data-theme="mocha" data-chapter={t(ui.chapters.promise)}>
      <p className="eyebrow">{t(ui.chapters.promise)}</p>
      {promise.map((line, i) => (
        <Words key={line.en} as="p" reveal={false} className={`display t-title promise__line ${i % 2 ? 'promise__line--answer' : ''}`} text={t(line)} />
      ))}
    </section>
  )
}
