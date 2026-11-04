import { BOXES, containsPoint, edgeDistance, extentOf, ringOf } from './boxes.js'
import { GAP, WALL } from './loft.js'

const TONES = {
  dark: ['#2E170D', '#3A2013', '#4A2A1A'],
  milk: ['#6B3F26', '#7E4A2C'],
  white: ['#EBD7BE', '#E3C9A8'],
  blush: ['#D9A79A', '#C99684'],
}

// The filling chooses the cast of pieces. Spacing is the gap between centres.
const RECIPES = {
  chocolates: { spacing: 0.72, cast: [['bonbon', 'dark'], ['square', 'milk'], ['bonbon', 'blush'], ['square', 'dark'], ['bonbon', 'white']] },
  pralines: { spacing: 0.66, cast: [['bonbon', 'dark'], ['bonbon', 'milk'], ['bonbon', 'dark'], ['bonbon', 'white']] },
  pastries: { spacing: 0.76, cast: [['macaron', 'blush'], ['square', 'dark'], ['macaron', 'white'], ['bonbon', 'milk'], ['macaron', 'milk']] },
  dates: { spacing: 0.74, cast: [['date', 'milk'], ['bonbon', 'dark'], ['date', 'dark'], ['square', 'milk']] },
}

function latticePoints(ring, spacing) {
  const { x: ex, z: ez } = extentOf(ring)
  const rowHeight = spacing * 0.88
  const points = []
  let row = 0
  for (let z = -ez; z <= ez; z += rowHeight) {
    const shift = row % 2 ? spacing / 2 : 0
    for (let x = -ex - spacing; x <= ex + spacing; x += spacing) {
      const px = x + shift
      if (containsPoint(ring, px, z) && edgeDistance(ring, px, z) >= spacing * 0.46) points.push([px, z])
    }
    row += 1
  }
  return points
}

function gridPoints(ring, [columns, rows]) {
  const { x: ex, z: ez } = extentOf(ring)
  const cellX = (ex * 2) / columns
  const cellZ = (ez * 2) / rows
  const points = []
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < columns; c += 1) points.push([-ex + cellX * (c + 0.5), -ez + cellZ * (r + 0.5)])
  }
  return { points, cellX, cellZ, ex, ez }
}

/** Where each piece sits inside a format, for a filling. Pure, so it is unit-tested. */
export function packPieces(format, filling) {
  const box = BOXES[format]
  const recipe = RECIPES[filling] ?? RECIPES.chocolates
  const ring = ringOf(format, GAP + WALL)
  const points = box.grid ? gridPoints(ring, box.grid).points : latticePoints(ring, recipe.spacing)

  return points.map(([x, z], i) => {
    const [kind, tone] = recipe.cast[i % recipe.cast.length]
    const tones = TONES[tone]
    return { kind, x, z, angle: (i * 2.4) % (Math.PI * 2), color: tones[i % tones.length] }
  })
}

/** Divider positions for formats with compartments. */
export function dividers(format) {
  const box = BOXES[format]
  if (!box.grid) return []
  const ring = ringOf(format, GAP + WALL)
  const { cellX, cellZ, ex, ez } = gridPoints(ring, box.grid)
  const [columns, rows] = box.grid
  const lines = []
  for (let c = 1; c < columns; c += 1) lines.push({ x: -ex + cellX * c, z: 0, width: 0.03, depth: ez * 2 })
  for (let r = 1; r < rows; r += 1) lines.push({ x: 0, z: -ez + cellZ * r, width: ex * 2, depth: 0.03 })
  return lines
}
