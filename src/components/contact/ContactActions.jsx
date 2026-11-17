import { ArrowUpRight } from 'lucide-react'
import { useLang } from '../../state/LangContext'
import { contactPage } from '../../content/pages'
import { ui } from '../../content/ui'
import { whatsappLink } from '../../utils/whatsapp'
import { Button } from '../ui/Button'

/** The three ways in from the Contact section: write to us, ask about an event, request a bespoke gift. */
export function ContactActions() {
  const { t } = useLang()
  const { buttons } = contactPage
  const chat = whatsappLink(t(ui.contactGreeting))
  return (
    <div className="actions">
      {chat ? (
        <a className="btn" href={chat} target="_blank" rel="noopener noreferrer">
          <span>{t(buttons.contact)}</span>
          <ArrowUpRight className="flip" aria-hidden="true" />
          <span className="sr-only">{t(ui.newTab)}</span>
        </a>
      ) : null}
      <Button to="/weddings#enquire" variant="ghost">{t(buttons.events)}</Button>
      <Button to="/corporate#enquire" variant="ghost">{t(buttons.gift)}</Button>
    </div>
  )
}
