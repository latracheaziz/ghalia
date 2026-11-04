import { useEffect, useMemo, useRef } from 'react'
import { AnimatePresence } from 'motion/react'
import { Page } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { BagLine } from '../components/layout/BagDrawer'
import { Consent, Field, Honeypot } from '../components/forms/Field'
import { Sent } from '../components/forms/Sent'
import { useSubmission } from '../components/forms/useSubmission'
import { Configurator } from '../components/configurator/Configurator'
import { useBag } from '../state/BagContext'
import { useLang } from '../state/LangContext'
import { ui } from '../content/ui'

function Checkout() {
  const { t } = useLang()
  const { items, clear } = useBag()
  const { status, reference, errorFor, failureMessage, send } = useSubmission()
  const formRef = useRef(null)
  const lines = useMemo(() => items.map(({ collection, format, filling, quantity, note }) => ({ collection, format, filling, quantity, note })), [items])

  const onSubmit = async (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const result = await send({ ...data, kind: 'order', items: lines, consent: data.consent === 'on' })
    if (result.reference) clear()
    if (result.errors) requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus())
  }

  if (status === 'sent') return <Sent reference={reference} />

  if (!items.length) return <p className="display t-sub">{t(ui.bagEmpty)}</p>

  return (
    <div className="checkout">
      <ul className="checkout__lines">
        <AnimatePresence initial={false}>
          {items.map((item) => <BagLine key={item.id} item={item} />)}
        </AnimatePresence>
      </ul>
      <form ref={formRef} className="form" onSubmit={onSubmit} noValidate>
        <Honeypot />
        <Field label={t(ui.name)} name="name" autoComplete="name" required error={errorFor('name')} />
        <div className="form__row">
          <Field label={t(ui.email)} name="email" type="email" autoComplete="email" dir="ltr" error={errorFor('email') ?? errorFor('contact')} />
          <Field label={t(ui.phone)} name="phone" type="tel" autoComplete="tel" dir="ltr" error={errorFor('phone')} />
        </div>
        <div className="form__row">
          <Field label={t(ui.city)} name="city" autoComplete="address-level2" />
          <Field label={t(ui.date)} name="date" type="date" />
        </div>
        <Field label={t(ui.occasion)} name="occasion" />
        <Consent label={t(ui.consent)} error={errorFor('consent')} />
        <p className="notice">{t(ui.pricesNote)}</p>
        {failureMessage ? <p className="notice notice--error" role="alert">{failureMessage}</p> : null}
        <div>
          <Button type="submit" disabled={status === 'sending'}>{t(status === 'sending' ? ui.sending : ui.checkout)}</Button>
        </div>
      </form>
    </div>
  )
}

export default function Order() {
  const { t } = useLang()
  const { setOpen } = useBag()

  useEffect(() => { setOpen(false) }, [setOpen])

  return (
    <Page title={t(ui.orderTitle)} description={t(ui.orderIntro)}>
      <Configurator />
      <section id="details" className="section wrap" data-theme="ivory">
        <p className="eyebrow">{t(ui.yourDetails)}</p>
        <Checkout />
      </section>
    </Page>
  )
}
