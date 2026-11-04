import { useSearchParams } from 'react-router-dom'
import { Page } from '../components/layout/Page'
import { Picture } from '../components/ui/Picture'
import { Words } from '../components/ui/Words'
import { EnquiryForm } from '../components/forms/EnquiryForm'
import { useLang } from '../state/LangContext'
import { brand, contact } from '../content/site'
import { future } from '../content/maison'
import { ui } from '../content/ui'

const COPY = {
  page: { en: 'Contact', ar: 'تواصل معنا' },
  title: { en: 'From the first consultation.', ar: 'من الاستشارة الأولى.' },
}

export default function Contact() {
  const { t } = useLang()
  const [params] = useSearchParams()
  const subject = params.get('subject')
  const fixed = ['wedding', 'corporate', 'partnership'].includes(subject) ? subject : undefined

  return (
    <Page title={t(COPY.page)} description={t(brand.signature)}>
      <section className="section wrap contact" data-theme="paper">
        <div className="contact__intro">
          <p className="eyebrow" data-reveal="fade">{t(COPY.page)}</p>
          <Words as="h1" className="display t-hero" text={t(COPY.title)} />
          <div className="arch contact__image grain" data-reveal="arch">
            <Picture id="atelier" alt={t({ en: 'The GHALIA atelier: a chocolatier at work beside a client consultation', ar: 'مشغل غالية: صانع شوكولاتة يعمل بجوار جلسة استشارة' })} sizes="(max-width: 56rem) 90vw, 36vw" priority />
          </div>
          <div className="contact__details" data-reveal="fade">
            <h2 className="eyebrow eyebrow--plain">{t(ui.contactLocation)}</h2>
            <p>{t(brand.location)}</p>
            {contact.phone ? <p><a href={`tel:${contact.phone}`} dir="ltr">{contact.phone}</a></p> : null}
            {contact.email ? <p><a href={`mailto:${contact.email}`}>{contact.email}</a></p> : null}
          </div>
        </div>
        <div className="contact__form" data-reveal="fade">
          {fixed === 'partnership' ? <p className="t-lead">{t(future.priorities[5])}</p> : null}
          <EnquiryForm kind={fixed} />
        </div>
      </section>
    </Page>
  )
}
