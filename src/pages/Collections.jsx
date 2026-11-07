import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Page } from '../components/layout/Page'
import { PageHero } from '../components/ui/PageHero'
import { Picture } from '../components/ui/Picture'
import { TLink } from '../components/ui/TLink'
import { useLang } from '../state/LangContext'
import { collections } from '../content/collections'
import { story } from '../content/maison'
import { ui } from '../content/ui'

const COPY = {
  page: { en: 'Handcrafted Chocolates, Pastries and Gifting', ar: 'شوكولاتة وحلويات فاخرة وهدايا مفصّلة' },
  description: { en: 'Ghalia', ar: 'غالية' },
  eyebrow: { en: 'The Collections', ar: 'المجموعات' },
  intro: {
    en: 'From the first cocoa bean to the final ribbon, every Ghalia creation is made by hand, with care, and designed in-house. Nothing here is ordinary, and nothing is rushed.',
    ar: 'من أول حبّة كاكاو لين آخر شريطة، كل إبداع من غالية يُصنع باليد وبكل عناية، ويُصمَّم عندنا. ما فيه شي عادي، وما فيه شي مستعجل.',
  },
}
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
    <Page title={t(COPY.page)} description={t(COPY.description)}>
      <PageHero eyebrow={t(COPY.eyebrow)} title={t(story.lines[0])} intro={t(COPY.intro)} silk={['#F4E2D6', '#C9A07F']} />

      <section className="section wrap index" data-theme="paper">
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
                  <div className={`arch index__image grain ${i % 4 === 2 ? 'arch--ogee' : ''}`}>
                    <Picture id={c.images[0]} alt={t(c.title)} sizes="(max-width: 56rem) 90vw, 46vw" />
                  </div>
                  <h2 className="display t-sub">{t(c.name)}</h2>
                  <p className="muted">{t(c.short)}</p>
                </TLink>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </section>
    </Page>
  )
}
