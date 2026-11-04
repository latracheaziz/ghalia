import { useLang } from '../../state/LangContext'
import { brand, contact, navigation } from '../../content/site'
import { Wordmark } from '../brand/Logo'
import { TLink } from '../ui/TLink'

export function Footer() {
  const { t, lang } = useLang()
  const heading = {
    explore: { en: 'Explore', ar: 'استكشف' },
    reach: { en: 'The Maison', ar: 'الدار' },
  }

  return (
    <footer className="footer wrap" data-theme="deep">
      <div className="footer__top">
        <div className="footer__intro">
          <p className="footer__line">{t(brand.signature)}</p>
        </div>
        <nav aria-label={t(heading.explore)}>
          <h2>{t(heading.explore)}</h2>
          <ul>
            {navigation.map((item) => (
              <li key={item.to}><TLink to={item.to}>{t(item.label)}</TLink></li>
            ))}
          </ul>
        </nav>
        <div>
          <h2>{t(heading.reach)}</h2>
          <ul>
            <li>{t(brand.location)}</li>
            {contact.phone ? <li><a href={`tel:${contact.phone}`} dir="ltr">{contact.phone}</a></li> : null}
            {contact.email ? <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li> : null}
            {contact.whatsapp ? <li><a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} rel="noreferrer" target="_blank">WhatsApp</a></li> : null}
            {contact.instagram ? <li><a href={contact.instagram} rel="noreferrer" target="_blank">Instagram</a></li> : null}
          </ul>
        </div>
      </div>
      <Wordmark className="footer__mark" />
      <div className="footer__base">
        <span>{t(brand.descriptor)}</span>
        <span dir={lang === 'ar' ? 'rtl' : 'ltr'}>© {new Date().getFullYear()} {t(brand.name)}</span>
      </div>
    </footer>
  )
}
