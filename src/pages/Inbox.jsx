import { useCallback, useEffect, useState } from 'react'
import { Page } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { Field } from '../components/forms/Field'
import { useLang } from '../state/LangContext'
import { ui } from '../content/ui'
import { describeItem } from '../utils/bag'

const KEY = 'ghalia.admin'
const STATUSES = ['new', 'in-progress', 'closed']

function readToken() {
  try {
    return sessionStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

function Detail({ submission }) {
  const { t } = useLang()
  const { payload } = submission
  const rows = [
    ['company', payload.company], ['city', payload.city], ['date', payload.date],
    ['guests', payload.guests], ['occasion', payload.occasion],
  ].filter(([, value]) => value)

  return (
    <div className="inbox__detail">
      {payload.message ? <p>{payload.message}</p> : null}
      {rows.length ? <p className="muted">{rows.map(([key, value]) => `${key}: ${value}`).join(' · ')}</p> : null}
      {payload.items?.length ? (
        <ul>
          {payload.items.map((item, i) => {
            const { collection, format, filling } = describeItem(item)
            return (
              <li key={i}>
                {item.quantity} × {t(collection?.name) ?? item.collection}, {t(format?.label) ?? item.format}
                {filling ? `, ${t(filling.label)}` : ''}{item.note ? ` (“${item.note}”)` : ''}
              </li>
            )
          })}
        </ul>
      ) : null}
      {payload.concept ? (
        <p className="muted">
          3D: {payload.concept.setting}, {payload.concept.palette}, {payload.concept.floral}, {payload.concept.mood}
          {payload.concept.link ? <> · <a className="inbox__link" href={payload.concept.link}>open</a></> : null}
        </p>
      ) : null}
    </div>
  )
}

/** Where the Maison reads what the site's forms collect. Guarded by ADMIN_TOKEN. */
export default function Inbox() {
  const { t } = useLang()
  const [token, setToken] = useState(readToken)
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async (value) => {
    const res = await fetch('/api/admin/submissions', { headers: { authorization: `Bearer ${value}` } }).catch(() => null)
    if (!res?.ok) {
      setItems(null)
      setError(res?.status === 503 ? ui.inboxDisabled : ui.inboxDenied)
      return
    }
    const data = await res.json()
    setItems(data.submissions)
    setError(null)
    try {
      sessionStorage.setItem(KEY, value)
    } catch { /* stays for this page view */ }
  }, [])

  useEffect(() => {
    const saved = readToken()
    if (saved) load(saved)
  }, [load])

  const setStatus = async (reference, status) => {
    const res = await fetch(`/api/admin/submissions/${reference}`, {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setItems((list) => list.map((s) => (s.reference === reference ? { ...s, status } : s)))
  }

  return (
    <Page title={t(ui.inboxTitle)}>
      <section className="section wrap inbox" data-theme="paper">
        <h1 className="display t-title">{t(ui.inboxTitle)}</h1>
        {items ? (
          items.length ? (
            <ul className="inbox__list">
              {items.map((s) => (
                <li key={s.reference} className="inbox__row">
                  <div className="inbox__meta">
                    <strong dir="ltr">{s.reference}</strong>
                    <span className="eyebrow eyebrow--plain">{s.kind}</span>
                    <time className="muted" dateTime={s.created_at}>{new Date(s.created_at).toLocaleString()}</time>
                  </div>
                  <div>
                    <p className="display t-sub">{s.name}</p>
                    <p>
                      {s.email ? <a className="inbox__link" href={`mailto:${s.email}`}>{s.email}</a> : null}
                      {s.email && s.phone ? ' · ' : ''}
                      {s.phone ? <a className="inbox__link" href={`tel:${s.phone}`} dir="ltr">{s.phone}</a> : null}
                    </p>
                    <Detail submission={s} />
                  </div>
                  <select className="field__input" aria-label={`Status of ${s.reference}`} value={s.status} onChange={(e) => setStatus(s.reference, e.target.value)}>
                    {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </li>
              ))}
            </ul>
          ) : <p className="t-lead">{t(ui.inboxEmpty)}</p>
        ) : (
          <form className="form inbox__login" onSubmit={(e) => { e.preventDefault(); load(token) }}>
            <Field label={t(ui.inboxToken)} name="token" type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} error={error ? t(error) : null} />
            <div><Button type="submit" icon={false}>{t(ui.inboxOpen)}</Button></div>
          </form>
        )}
      </section>
    </Page>
  )
}
