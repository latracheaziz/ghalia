import { useState } from 'react'
import { Page } from '../components/layout/Page'
import { WeddingsHero } from '../components/weddings/WeddingsHero'
import { Picture } from '../components/ui/Picture'
import { Words } from '../components/ui/Words'
import { Button } from '../components/ui/Button'
import { EnquiryForm } from '../components/forms/EnquiryForm'
import { Scene } from '../three/Scene'
import { useLang } from '../state/LangContext'
import { eventsPage } from '../content/pages'
import { ui } from '../content/ui'

/** The Halo Tray in 3D: turn it, or pick front, side and back. */
function HaloStudio() {
  const { t } = useLang()
  const [view, setView] = useState('front')
  const name = t(eventsPage.concepts.halo.title)
  return (
    <div className="halo__stage" data-cursor={t(ui.drag)}>
      <Scene name="halo" view={view} fallback="halo-tray" fallbackAlt={name} note />
      <div className="choices halo__views" role="group" aria-label={name}>
        {Object.entries(ui.haloViews).map(([id, label]) => (
          <button key={id} type="button" className="choice" aria-pressed={view === id} onClick={() => setView(id)}>{t(label)}</button>
        ))}
      </div>
    </div>
  )
}

/** Weddings & Events: the opening, the services, the three signature concepts, then the enquiry. */
export default function Weddings() {
  const { t } = useLang()
  const { services, concepts } = eventsPage
  return (
    <Page title={t(eventsPage.title)} description={t(eventsPage.headline)}>
      <WeddingsHero />

      <section id="services" className="section wrap services" data-theme="paper">
        <header className="section-head">
          <p className="eyebrow" data-reveal="fade">{t(services.title)}</p>
        </header>
        <ul className="services__list">
          {services.items.map((item, i) => (
            <li key={item.id} className={`services__item services__item--${i}`}>
              <div className="arch services__image grain" data-reveal="arch">
                <Picture id={item.image} alt={t(item.alt)} sizes="(max-width: 56rem) 90vw, 30vw" />
              </div>
              <h2 className="display t-sub">{t(item.title)}</h2>
              <p className="muted">{t(item.text)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="concepts" className="section wrap concepts" data-theme="deep">
        <header className="section-head">
          <Words as="h2" className="display t-title" text={t(concepts.title)} />
        </header>

        <article id="halo" className="concept split">
          <div className="split__copy">
            <p className="eyebrow" data-reveal="fade">01</p>
            <h3 className="display t-sub" data-reveal="fade">{t(concepts.halo.title)}</h3>
            <p className="t-lead" data-reveal="fade">{t(concepts.halo.text)}</p>
          </div>
          <div className="split__media" data-reveal="fade"><HaloStudio /></div>
        </article>

        <article id="pergola" className="concept split split--reverse">
          <div className="split__media">
            <div className="frame concept__image grain" data-reveal="fade">
              <Picture id={concepts.pergola.image} alt={t(concepts.pergola.alt)} sizes="(max-width: 56rem) 90vw, 46vw" />
            </div>
          </div>
          <div className="split__copy">
            <p className="eyebrow" data-reveal="fade">02</p>
            <h3 className="display t-sub" data-reveal="fade">{t(concepts.pergola.title)}</h3>
            <p className="t-lead" data-reveal="fade">{t(concepts.pergola.text)}</p>
          </div>
        </article>

        <article id="studio" className="concept concept--studio">
          <p className="eyebrow" data-reveal="fade">03</p>
          <h3 className="display t-sub" data-reveal="fade">{t(concepts.studio.title)}</h3>
          <p className="t-lead measure" data-reveal="fade">{t(concepts.studio.text)}</p>
          <div className="actions" data-reveal="fade">
            <Button to="/studio">{t(ui.openStudio)}</Button>
          </div>
        </article>
      </section>

      <section id="enquire" className="section wrap form-band" data-theme="paper">
        <div>
          <p className="eyebrow" data-reveal="fade">{t(eventsPage.title)}</p>
          <Words as="h2" className="display t-title" text={t(eventsPage.button)} />
        </div>
        <div data-reveal="fade"><EnquiryForm kind="wedding" /></div>
      </section>
    </Page>
  )
}
