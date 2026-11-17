import { Page } from '../components/layout/Page'
import { PageHero } from '../components/ui/PageHero'
import { Picture } from '../components/ui/Picture'
import { Words } from '../components/ui/Words'
import { Button } from '../components/ui/Button'
import { EnquiryForm } from '../components/forms/EnquiryForm'
import { useLang } from '../state/LangContext'
import { bespoke } from '../content/pages'

/** Bespoke Gifting: the opening, Corporate Gifting beside its photograph, then the enquiry. */
export default function Corporate() {
  const { t } = useLang()
  const { corporate } = bespoke
  return (
    <Page title={t(bespoke.title)} description={t(bespoke.intro)}>
      <PageHero eyebrow={t(bespoke.title)} title={t(bespoke.headline)} intro={t(bespoke.intro)} scene="drip" navTone="light">
        <div className="actions" data-reveal="fade">
          <Button to="/order">{t(bespoke.button)}</Button>
        </div>
      </PageHero>

      <section className="section wrap split split--reverse" data-theme="paper">
        <div className="split__media">
          <div className="arch split__arch grain" data-reveal="arch">
            <Picture id={corporate.image} alt={t(corporate.alt)} sizes="(max-width: 56rem) 90vw, 40vw" />
          </div>
        </div>
        <div className="split__copy">
          <Words as="h2" className="display t-title" text={t(corporate.title)} />
          <p className="t-lead" data-reveal="fade">{t(corporate.text)}</p>
        </div>
      </section>

      <section id="enquire" className="section wrap form-band" data-theme="mocha">
        <div>
          <p className="eyebrow" data-reveal="fade">{t(corporate.title)}</p>
          <Words as="h2" className="display t-title" text={t(bespoke.button)} />
        </div>
        <div data-reveal="fade"><EnquiryForm kind="corporate" /></div>
      </section>
    </Page>
  )
}
