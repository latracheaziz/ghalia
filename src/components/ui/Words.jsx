import { createElement } from 'react'

/** Splits by word only: splitting letters would break Arabic's joined script. */
export function Words({ as = 'span', text, reveal = true, ...rest }) {
  const words = text.split(/\s+/).filter(Boolean)
  return createElement(
    as,
    { 'data-reveal': reveal ? 'words' : undefined, ...rest },
    words.map((word, i) => (
      <span key={i}>
        <span className="w"><span className="wi">{word}</span></span>
        {i < words.length - 1 ? ' ' : null}
      </span>
    )),
  )
}
