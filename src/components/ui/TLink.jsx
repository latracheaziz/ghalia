import { forwardRef } from 'react'
import { useTransition } from '../../state/TransitionContext'

/** A real link that plays the arch curtain, and leaves modified clicks to the browser. */
export const TLink = forwardRef(function TLink({ to, onClick, children, ...rest }, ref) {
  const { go } = useTransition()
  const handle = (e) => {
    onClick?.(e)
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    go(to)
  }
  return <a ref={ref} href={to} onClick={handle} {...rest}>{children}</a>
})
