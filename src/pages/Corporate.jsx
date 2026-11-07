import { Page } from '../components/layout/Page'
import { PageHero } from '../components/ui/PageHero'
import { Picture } from '../components/ui/Picture'
import { Words } from '../components/ui/Words'
import { TLink } from '../components/ui/TLink'
import { EnquiryForm } from '../components/forms/EnquiryForm'
import { useLang } from '../state/LangContext'
import { corporate } from '../content/events'
import { ui } from '../content/ui'

export default function Corporate() {
  const { t } = useLang()
  return (
    <Page title={t(corporate.title)} description={t(corporate.intro)}>
      <PageHero eyebrow={t(corporate.title)} title={t(corporate.headline)} intro={t(corporate.intro)} silk={['#16694F', '#0A3327']} tone="light" />

      <section className="section wrap moments" data-theme="paper">
        <ul className="moments__list">
          {corporate.moments.map((moment, i) => (
            <li key={moment.to} className={`moments__item moments__item--${i}`}>
              <TLink to={moment.to} data-cursor={t(ui.view)}>
                <div className={`grain ${i % 2 ? 'frame' : 'arch'} moments__image`} data-reveal="arch">
                  <Picture id={moment.image} alt={t(moment.title)} sizes="(max-width: 56rem) 90vw, 44vw" />
                </div>
                <h2 className="display t-sub">{t(moment.title)}</h2>
                <p className="muted">{t(moment.text)}</p>
              </TLink>
            </li>
          ))}
        </ul>
      </section>

      <section className="section wrap form-band" data-theme="mocha">
        <div>
          <p className="eyebrow" data-reveal="fade">{t(ui.enquire)}</p>
          <Words as="h2" className="display t-title" text={t(corporate.closing)} />
        </div>
        <div data-reveal="fade"><EnquiryForm kind="corporate" /></div>
      </section>
    </Page>
  )
}
