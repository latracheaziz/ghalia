import { useRef, useState } from 'react'
import { useLang } from '../../state/LangContext'
import { ui } from '../../content/ui'
import { Button } from '../ui/Button'
import { Consent, Field, Honeypot } from './Field'
import { Sent } from './Sent'
import { useSubmission } from './useSubmission'

const SHOW = {
  wedding: { date: true, guests: true, city: true },
  corporate: { company: true, date: true, guests: false },
  partnership: { company: true },
  general: {},
}

/**
 * One form for every enquiry type. Pass `kind` to fix the subject, or leave it
 * out to let the visitor pick. `concept` carries a 3D Event Studio design along.
 */
export function EnquiryForm({ kind, concept }) {
  const { t } = useLang()
  const [subject, setSubject] = useState(kind ?? 'general')
  const { status, reference, errorFor, failureMessage, send, reset } = useSubmission()
  const formRef = useRef(null)
  const show = SHOW[subject]

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    const result = await send({ ...data, kind: subject, consent: data.consent === 'on', concept: concept ?? undefined })
    if (result.errors) requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus())
  }

  if (status === 'sent') return <Sent reference={reference} onAgain={reset} />

  return (
    <form ref={formRef} className="form" onSubmit={onSubmit} noValidate>
      <Honeypot />
      {concept ? <p className="notice">{t(ui.studioAttached)}</p> : null}
      {kind ? null : (
        <Field label={t(ui.subject)} name="subject" as="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
          {Object.entries(ui.subjects).map(([id, label]) => <option key={id} value={id}>{t(label)}</option>)}
        </Field>
      )}
      <div className="form__row">
        <Field label={t(ui.name)} name="name" autoComplete="name" required error={errorFor('name')} />
        {show.company ? <Field label={t(ui.company)} name="company" autoComplete="organization" /> : null}
      </div>
      <div className="form__row">
        <Field label={t(ui.email)} name="email" type="email" autoComplete="email" dir="ltr" error={errorFor('email') ?? errorFor('contact')} />
        <Field label={t(ui.phone)} name="phone" type="tel" autoComplete="tel" dir="ltr" error={errorFor('phone')} />
      </div>
      {show.date || show.guests || show.city ? (
        <div className="form__row">
          {show.date ? <Field label={t(ui.date)} name="date" type="date" /> : null}
          {show.guests ? <Field label={t(ui.guests)} name="guests" inputMode="numeric" /> : null}
          {show.city ? <Field label={t(ui.city)} name="city" autoComplete="address-level2" /> : null}
        </div>
      ) : null}
      <Field label={t(ui.message)} name="message" as="textarea" rows={4} required={!concept} error={errorFor('message')} />
      <Consent label={t(ui.consent)} error={errorFor('consent')} />
      {failureMessage ? <p className="notice notice--error" role="alert">{failureMessage}</p> : null}
      <div>
        <Button type="submit" disabled={status === 'sending'}>{t(status === 'sending' ? ui.sending : ui.send)}</Button>
      </div>
    </form>
  )
}
