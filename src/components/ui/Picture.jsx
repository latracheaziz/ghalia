import media from '../../content/media.json'

const FALLBACK_WIDTH = 800

/** Responsive image from the media manifest, painted with its dominant colour while loading. */
export function Picture({ id, alt, sizes = '100vw', priority = false, className, ...rest }) {
  const entry = media[id]
  if (!entry) throw new Error(`Unknown media id: ${id}`)
  const { widths, ratio, color } = entry
  const src = widths.find((w) => w >= FALLBACK_WIDTH) ?? widths[widths.length - 1]

  return (
    <img
      className={className}
      src={`/media/${id}-${src}.webp`}
      srcSet={widths.map((w) => `/media/${id}-${w}.webp ${w}w`).join(', ')}
      sizes={sizes}
      alt={alt}
      width={1000}
      height={Math.round(1000 * ratio)}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      style={{ backgroundColor: color }}
      {...rest}
    />
  )
}
