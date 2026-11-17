import { Page } from '../components/layout/Page'
import { Socials } from '../components/contact/Socials'
import { useLang } from '../state/LangContext'
import { contactPage } from '../content/pages'

/** Contact is the Maison's accounts, poured one at a time. Enquiry forms live on Weddings, Corporate and the Studio. */
export default function Contact() {
  const { t } = useLang()
  return (
    <Page title={t(contactPage.title)} description={t(contactPage.intro)}>
      <Socials />
    </Page>
  )
}
