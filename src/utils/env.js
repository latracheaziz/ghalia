const query = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches

export const prefersReducedMotion = () => query('(prefers-reduced-motion: reduce)')
export const hasFinePointer = () => query('(hover: hover) and (pointer: fine)')
export const isSmallScreen = () => query('(max-width: 56rem)')

let webgl
export function supportsWebGL() {
  if (webgl === undefined) {
    try {
      const canvas = document.createElement('canvas')
      webgl = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
    } catch {
      webgl = false
    }
  }
  return webgl
}
