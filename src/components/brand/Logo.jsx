import wordmark from '../../assets/brand/wordmark.svg?raw'
import lockup from '../../assets/brand/lockup.svg?raw'
import ornament from '../../assets/brand/ornament.svg?raw'

// Traced from the supplied logo artwork, so they inherit currentColor.
const Raw = ({ svg, label, className }) => (
  <span
    className={className}
    style={{ display: 'block', lineHeight: 0 }}
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    dangerouslySetInnerHTML={{ __html: svg }}
  />
)

export const Wordmark = (props) => <Raw svg={wordmark} {...props} />
export const Lockup = (props) => <Raw svg={lockup} {...props} />
export const Ornament = (props) => <Raw svg={ornament} {...props} />

const PETAL = 'M50 50C42 40 40 28 50 6c10 22 8 34 0 44Z'
const SHOULDER = 'M50 50C38 44 28 30 27 19c11 0 21 9 23 31Z'
const INNER = 'M50 50c-4-7-5-15 0-25 5 10 4 18 0 25Z'

/** The eight-fold rosette from the brand book, redrawn as clean geometry. */
export function Rosette({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      {[0, 90, 180, 270].map((a) => (
        <g key={a} transform={`rotate(${a} 50 50)`}>
          <path d={PETAL} />
          <path d={SHOULDER} />
          <path d={SHOULDER} transform="matrix(-1 0 0 1 100 0)" />
          <path d={INNER} transform="rotate(45 50 50)" strokeWidth="1.4" />
        </g>
      ))}
      <circle cx="50" cy="50" r="5" fill="var(--bg, transparent)" />
    </svg>
  )
}
