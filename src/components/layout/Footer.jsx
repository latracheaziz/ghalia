import { useLang } from '../../state/LangContext'
import { brand, contact, navigation, social } from '../../content/site'
import { Wordmark } from '../brand/Logo'
import { SocialIcon } from '../brand/SocialIcon'
import { TLink } from '../ui/TLink'

export function Footer() {
  const { t, lang } = useLang()
  const heading = {
    explore: { en: 'Explore', ar: 'استكشف' },
    reach: { en: 'Visit the Patisserie', ar: 'زورونا في دار الحلا والحلويات' },
  }

  return (
    <footer className="footer wrap" data-theme="deep">
      <div className="footer__top">
        <div className="footer__intro">
          <p className="footer__line">{t(brand.footerTagline)}</p>
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
          </ul>
          <ul className="footer__social">
            {social.map((account) => (
              <li key={account.id}>
                <a href={account.url} target="_blank" rel="noopener noreferrer" aria-label={`${t(account.name)} ${account.handle}`} title={t(account.name)}>
                  <SocialIcon id={account.id} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Wordmark className="footer__mark" />
      <div className="footer__base">
        <span>{t(brand.footerDescription)}</span>
        <span dir={lang === 'ar' ? 'rtl' : 'ltr'}>© {new Date().getFullYear()} {t(brand.name)}</span>
      </div>
    </footer>
  )
}
