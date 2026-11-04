import { ArrowRight } from 'lucide-react'
import { useMagnetic } from '../../hooks/useMagnetic'
import { TLink } from './TLink'

export function Button({ to, variant, icon = true, children, className = '', type = 'button', ...rest }) {
  const ref = useMagnetic()
  const classes = `btn ${variant === 'ghost' ? 'btn--ghost' : ''} ${className}`
  const inner = (
    <>
      <span>{children}</span>
      {icon ? <ArrowRight className="flip" aria-hidden="true" /> : null}
    </>
  )
  if (to) return <TLink ref={ref} to={to} className={classes} {...rest}>{inner}</TLink>
  return <button ref={ref} type={type} className={classes} {...rest}>{inner}</button>
}

export function TextLink({ to, children, ...rest }) {
  return (
    <TLink to={to} className="link" {...rest}>
      <span>{children}</span>
      <ArrowRight className="flip" aria-hidden="true" />
    </TLink>
  )
}
