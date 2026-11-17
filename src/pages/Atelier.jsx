import { Page } from '../components/layout/Page'
import { AtelierHero } from '../components/atelier/AtelierHero'
import { AtelierProcess } from '../components/atelier/AtelierProcess'
import { Picture } from '../components/ui/Picture'
import { Words } from '../components/ui/Words'
import { useLang } from '../state/LangContext'
import { patisserie } from '../content/pages'

const THEMES = ['paper', 'blush', 'ivory']

/** Chocolate & Patisserie: the atelier, how it is made, then each product category beside its photograph. */
export default function Atelier() {
  const { t } = useLang()
  return (
    <Page title={t(patisserie.title)} description={t(patisserie.intro)}>
      <AtelierHero />
      <AtelierProcess />

      <section className="section wrap categories-head" data-theme="paper">
        <p className="eyebrow" data-reveal="fade">{t(patisserie.categoriesTitle)}</p>
      </section>

      {patisserie.categories.map((category, i) => (
        <section
          key={category.id}
          id={category.id}
          className={`section wrap split category ${i % 2 ? 'split--reverse' : ''}`}
          data-theme={THEMES[i % THEMES.length]}
        >
          <div className="split__media">
            <div className={`arch split__arch grain ${i === 1 ? 'arch--ogee' : ''}`} data-reveal="arch">
              <Picture id={category.image} alt={t(category.alt)} sizes="(max-width: 56rem) 90vw, 40vw" />
            </div>
          </div>
          <div className="split__copy">
            <p className="eyebrow" data-reveal="fade">{String(i + 1).padStart(2, '0')}</p>
            <Words as="h2" className="display t-title" text={t(category.title)} />
            <p className="t-lead" data-reveal="fade">{t(category.text)}</p>
          </div>
        </section>
      ))}
    </Page>
  )
}
