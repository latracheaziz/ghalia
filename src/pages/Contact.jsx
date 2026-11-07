import { Page } from '../components/layout/Page'
import { Socials } from '../components/contact/Socials'
import { useLang } from '../state/LangContext'

const COPY = {
  page: { en: 'Visit and Contact', ar: 'زورونا وتواصلوا معنا' },
  description: { en: 'Ghalia Chocolate and Patisserie', ar: 'غالية للشوكولاتة والحلا والحلويات' },
}

/** Contact is the Maison's accounts, poured one at a time. Enquiry forms live on Weddings, Corporate and the Studio. */
export default function Contact() {
  const { t } = useLang()
  return (
    <Page title={t(COPY.page)} description={t(COPY.description)}>
      <Socials />
    </Page>
  )
}
