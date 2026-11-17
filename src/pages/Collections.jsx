import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/ui/PageHero'
import { Picture } from '../components/ui/Picture'
import { TLink } from '../components/ui/TLink'
import { useLang } from '../state/LangContext'
import { collections } from '../content/collections'
import { collectionsPage } from '../content/pages'
import { ui } from '../content/ui'
import { Button } from '../components/ui/Button'
import { scrollToTarget } from '../animations/lenis'

import { ScrollTrigger } from '../animations/gsap'

const FILTERS = [
  { id: 'all', label: ui.filterAll },
  { id: 'core', label: ui.groupCore },
  { id: 'seasonal', label: ui.groupSeasonal },
]

export default function Collections() {
  const { t } = useLang()
  const [filter, setFilter] = useState('all')
  const shown = collections.filter((c) => filter === 'all' || c.group === filter)

  return (
    <Page title={t(collectionsPage.title)} description={t(collectionsPage.intro)}>
      <PageHero eyebrow={t(collectionsPage.title)} title={t(collectionsPage.headline)} intro={t(collectionsPage.intro)} scene="chocolate" tone="light">
        <div className="actions" data-reveal="fade">
          <Button onClick={() => scrollToTarget(document.getElementById('collections-list'), { offset: 0 })}>{t(collectionsPage.button)}</Button>
        </div>
      </PageHero>

      <section id="collections-list" className="section wrap index" data-theme="paper">
        <div className="choices index__filters" role="group" aria-label={t(ui.chapters.collections)}>
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className="choice" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{t(f.label)}</button>
          ))}
        </div>
        <motion.ul layout className="index__list" onLayoutAnimationComplete={() => ScrollTrigger.refresh()}>
          <AnimatePresence mode="popLayout">
            {shown.map((c, i) => (
              <motion.li
                key={c.slug}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`index__item index__item--${i % 4}`}
              >
                <TLink to={`/collections/${c.slug}`} data-cursor={t(ui.view)}>
                  <div className="arch index__image grain">
                    <Picture id={c.images[0]} alt={t(c.title)} sizes="(max-width: 56rem) 90vw, 46vw" />
                  </div>
                  <h2 className="display t-sub">{t(c.name)}</h2>
                  <p className="muted">{t(c.description)}</p>
                </TLink>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </section>
    </Page>
  )
}
