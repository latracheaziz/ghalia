const clamp01 = (v) => Math.min(1, Math.max(0, v))

/**
 * Where the chocolate pour stands for a scroll position. `raw` runs from 0 (the
 * first account) to `last` (the final one). Each account holds for the middle of
 * its stretch; between two of them the chocolate rises over the screen (wave 0 to
 * 0.5) and lifts away (0.5 to 1). The account swaps while the screen is covered.
 */
export function pourPhase(raw, last) {
  if (last < 1) return { from: 0, wave: 0, shown: 0 }
  const from = Math.min(Math.max(Math.floor(raw), 0), last - 1)
  const wave = clamp01((raw - from - 0.22) / 0.56)
  return { from, wave, shown: wave < 0.5 ? from : from + 1 }
}
