import { isSmallScreen } from '../utils/env'

/** One switch for GPU cost: phones and low-core machines get a lighter scene. */
export function getQuality() {
  const low = isSmallScreen() || (navigator.hardwareConcurrency || 4) <= 4
  return {
    low,
    dpr: low ? [1, 1.4] : [1, 1.75],
    fieldPralines: low ? 70 : 170,
    dust: low ? 260 : 720,
    roses: low ? 0.6 : 1,
    antialias: !low,
  }
}
