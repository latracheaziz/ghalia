import { social } from '../content/site'

const chat = social.find((account) => account.id === 'whatsapp')?.url

/** A WhatsApp chat with the Maison, opened with `text` already written. Null if no number is set. */
export const whatsappLink = (text) => (chat ? `${chat}?text=${encodeURIComponent(text)}` : null)
