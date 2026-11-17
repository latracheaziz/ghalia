import { useLang } from '../../state/LangContext'
import { contactPage } from '../../content/pages'
import { ui } from '../../content/ui'
import { ContactActions } from '../contact/ContactActions'
import { Words } from '../ui/Words'

/** The Contact section, closing the home page. */
export function ContactBand() {
  const { t } = useLang()
  return (
    <section id="contact" className="section wrap contact-band" data-theme="mocha" data-chapter={t(ui.chapters.contact)}>
      <p className="eyebrow" data-reveal="fade">{t(contactPage.title)}</p>
      <Words as="h2" className="display t-title" text={t(contactPage.headline)} />
      <p className="t-lead measure" data-reveal="fade">{t(contactPage.intro)}</p>
      <div data-reveal="fade"><ContactActions /></div>
    </section>
  )
}
