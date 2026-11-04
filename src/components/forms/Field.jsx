import { useId } from 'react'

export function Field({ label, name, error, as = 'input', children, ...rest }) {
  const id = useId()
  const Control = as
  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <label className="field__label" htmlFor={id}>{label}</label>
      <Control
        id={id}
        name={name}
        className="field__input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      >
        {children}
      </Control>
      {error ? <p className="field__error" id={`${id}-error`}>{error}</p> : null}
    </div>
  )
}

export function Consent({ label, error }) {
  return (
    <div className={error ? 'field--invalid' : undefined}>
      <label className="check">
        <input type="checkbox" name="consent" aria-invalid={error ? 'true' : undefined} />
        <span>{label}</span>
      </label>
      {error ? <p className="field__error">{error}</p> : null}
    </div>
  )
}

/** Hidden from people, tempting to bots. */
export function Honeypot() {
  return (
    <div className="honeypot" aria-hidden="true">
      <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
  )
}
