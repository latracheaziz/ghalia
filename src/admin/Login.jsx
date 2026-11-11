import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Wordmark } from '../components/brand/Logo'
import { TLink } from '../components/ui/TLink'
import { signIn } from './auth'

export function Login({ onSignedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (await signIn(email, password)) onSignedIn()
      else setError('That email and password don’t match.')
    } catch {
      setError('Sign-in needs a secure connection (https or localhost).')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="adm-login" data-theme="deep">
      <form className="adm-login__card" onSubmit={submit} noValidate>
        <Wordmark className="adm-login__mark" />
        <p className="adm-login__eyebrow"><Lock size={14} aria-hidden="true" /> Patisserie admin</p>
        <div className="field">
          <label className="field__label" htmlFor="adm-email">Email</label>
          <input id="adm-email" className="field__input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="adm-password">Password</label>
          <div className="adm-password">
            <input id="adm-password" className="field__input" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" className="adm-icon-btn" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {error ? <p className="field__error" role="alert">{error}</p> : null}
        <button type="submit" className="adm-btn adm-btn--primary adm-btn--block" disabled={busy || !email || !password}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <TLink to="/" className="adm-login__back">Back to the site</TLink>
      </form>
    </div>
  )
}
