// The packaging formats as data. Each footprint is analytic in `inset`, so walls,
// liners and lids are true offsets of one another, and every outline resamples to
// SEGMENTS points, which is what lets one shape morph into another.
//
// To replace a procedural format with a real model later, give it a `model` URL
// here and branch on it in Product.jsx. Everything around the box stays the same.

export const SEGMENTS = 192

const arc = (cx, cz, r, from, to, steps) => Array.from({ length: steps + 1 }, (_, i) => {
  const a = from + ((to - from) * i) / steps
  return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]
})

const circle = (radius) => (t) => arc(0, 0, radius - t, 0, Math.PI * 2, 96).slice(0, -1)

const rect = (w, d, corner = 0.08) => (t) => {
  const x = w / 2 - t
  const z = d / 2 - t
  const r = Math.max(corner - t, 0.012)
  return [
    ...arc(x - r, z - r, r, 0, Math.PI / 2, 6),
    ...arc(-x + r, z - r, r, Math.PI / 2, Math.PI, 6),
    ...arc(-x + r, -z + r, r, Math.PI, Math.PI * 1.5, 6),
    ...arc(x - r, -z + r, r, Math.PI * 1.5, Math.PI * 2, 6),
  ]
}

const octagon = (radius) => (t) => {
  const r = radius - t / Math.cos(Math.PI / 8)
  return Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI / 8 + (i * Math.PI) / 4
    return [Math.cos(a) * r, Math.sin(a) * r]
  })
}

const heart = (size) => (t) => {
  const s = (size - t) / 16.5
  return Array.from({ length: 128 }, (_, i) => {
    const a = (i / 128) * Math.PI * 2
    const x = 16 * Math.sin(a) ** 3
    const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)
    return [x * s, -(y + 2.5) * s]
  })
}

/** Footprint with a flat front and a semicircular back, like the Eid arch boxes. */
const arch = (w, d) => (t) => {
  const r = w / 2 - t
  const front = d / 2 - t
  const spring = -d / 2 + w / 2
  return [[r, front], [-r, front], ...arc(0, spring, r, Math.PI, Math.PI * 2, 48)]
}

/** A crescent: one circle minus another, opening towards the back of the set. */
const crescent = (outer, inner, gap) => (t) => {
  const R = outer - t
  const r = inner + t
  // Where the circles cross, as angles seen from each circle's centre.
  const a = Math.acos((gap * gap + R * R - r * r) / (2 * gap * R))
  const g = Math.acos((gap * gap + r * r - R * R) / (2 * gap * r))
  const opening = -Math.PI / 2 + 0.55
  const cx = Math.cos(opening) * gap
  const cz = Math.sin(opening) * gap
  // Moved so the crescent's mass, not its circle, sits on the origin.
  return [
    ...arc(0, 0, R, opening + a, opening + Math.PI * 2 - a, 96),
    ...arc(cx, cz, r, opening + Math.PI + g, opening + Math.PI - g, 64),
  ].map(([x, z]) => [x - cx * 0.42, z - cz * 0.42])
}

export const BOXES = {
  'round-box': { outline: circle(2.1), height: 1.7, lid: 0.72, open: 'lift' },
  'square-box': { outline: rect(3.7, 3.7), height: 1.6, lid: 0.68, open: 'hinge' },
  'drawer-box': { outline: rect(4, 3.1, 0.06), height: 1.5, lid: 1.5, open: 'drawer' },
  'heart-box': { outline: heart(2.5), height: 1.5, lid: 0.66, open: 'lift' },
  'octagon-box': { outline: octagon(2.3), height: 1.7, lid: 0.72, open: 'lift' },
  'long-box': { outline: rect(5.4, 1.75, 0.06), height: 1.15, lid: 0.55, open: 'hinge', ribbon: 'short' },
  'crescent-box': { outline: crescent(2.6, 2, 1.15), height: 1.5, lid: 0.66, open: 'lift', ribbon: 'short', art: { x: -0.35, z: 1.5, scale: 1.75 } },
  'arch-box': { outline: arch(3.3, 4.3), height: 1.4, lid: 0.62, open: 'lift' },
  'tower-box': { outline: rect(2, 2, 0.05), height: 4.2, lid: 1.15, open: 'lift' },
  'cube-box': { outline: rect(2.9, 2.9, 0.05), height: 2.9, lid: 1, open: 'hinge' },
  'gift-box': { outline: rect(4.5, 3.4), height: 1.35, lid: 0.6, open: 'hinge' },
  'compartment-box': { outline: rect(4.7, 3.6), height: 1.15, lid: 0.55, open: 'hinge', grid: [4, 3] },
  hamper: { outline: rect(5.5, 4.1), height: 2.1, lid: 0.9, open: 'hinge' },
  'handle-box': { outline: rect(2.7, 2.7, 0.05), height: 2.1, lid: 0.8, open: 'lift', handle: true, ribbon: 'none' },
  'shopping-bag': { outline: rect(3.4, 1.4, 0.03), height: 4.3, lid: 0, open: 'none', bag: true, ribbon: 'none' },
}

/** Resamples a closed polyline to `count` even steps, starting from its front-most point. */
export function resample(points, count = SEGMENTS) {
  const closed = [...points, points[0]]
  const lengths = [0]
  for (let i = 1; i < closed.length; i += 1) {
    lengths.push(lengths[i - 1] + Math.hypot(closed[i][0] - closed[i - 1][0], closed[i][1] - closed[i - 1][1]))
  }
  const total = lengths[lengths.length - 1]

  let start = 0
  let best = -Infinity
  for (let i = 0; i < points.length; i += 1) {
    const score = points[i][1] - Math.abs(points[i][0]) * 2
    if (score > best) {
      best = score
      start = i
    }
  }

  const out = new Float32Array(count * 2)
  let segment = 0
  for (let i = 0; i < count; i += 1) {
    const at = (lengths[start] + (i / count) * total) % total
    while (!(lengths[segment] <= at && at <= lengths[segment + 1])) segment = (segment + 1) % (closed.length - 1)
    const span = lengths[segment + 1] - lengths[segment] || 1
    const k = (at - lengths[segment]) / span
    out[i * 2] = closed[segment][0] + (closed[segment + 1][0] - closed[segment][0]) * k
    out[i * 2 + 1] = closed[segment][1] + (closed[segment + 1][1] - closed[segment][1]) * k
  }
  return signedArea(out) < 0 ? flip(out) : out
}

export function signedArea(ring) {
  let area = 0
  const n = ring.length / 2
  for (let i = 0; i < n; i += 1) {
    const j = (i + 1) % n
    area += ring[i * 2] * ring[j * 2 + 1] - ring[j * 2] * ring[i * 2 + 1]
  }
  return area / 2
}

// Keeps the first point, so reversed rings still line up for morphing.
function flip(ring) {
  const n = ring.length / 2
  const out = new Float32Array(ring.length)
  for (let i = 0; i < n; i += 1) {
    const j = (n - i) % n
    out[i * 2] = ring[j * 2]
    out[i * 2 + 1] = ring[j * 2 + 1]
  }
  return out
}

const cache = new Map()

/** The format's outline at an inset, as SEGMENTS evenly spaced points. */
export function ringOf(format, inset) {
  const key = `${format}:${inset}`
  if (!cache.has(key)) cache.set(key, resample(BOXES[format].outline(inset)))
  return cache.get(key)
}

export function extentOf(ring) {
  let x = 0
  let z = 0
  for (let i = 0; i < ring.length; i += 2) {
    x = Math.max(x, Math.abs(ring[i]))
    z = Math.max(z, Math.abs(ring[i + 1]))
  }
  return { x, z }
}

export function containsPoint(ring, x, z) {
  let inside = false
  const n = ring.length / 2
  for (let i = 0, j = n - 1; i < n; j = i, i += 1) {
    const xi = ring[i * 2]
    const zi = ring[i * 2 + 1]
    const xj = ring[j * 2]
    const zj = ring[j * 2 + 1]
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside
  }
  return inside
}

export function edgeDistance(ring, x, z) {
  let best = Infinity
  const n = ring.length / 2
  for (let i = 0; i < n; i += 1) {
    const j = (i + 1) % n
    const ax = ring[i * 2]
    const az = ring[i * 2 + 1]
    const dx = ring[j * 2] - ax
    const dz = ring[j * 2 + 1] - az
    const k = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)))
    best = Math.min(best, Math.hypot(x - ax - dx * k, z - az - dz * k))
  }
  return best
}

/** The stretches of a straight line that lie on the footprint, for laying ribbon. */
export function spans(ring, axis, offset = 0) {
  const a = axis === 'x' ? 0 : 1
  const b = 1 - a
  const hits = []
  const n = ring.length / 2
  for (let i = 0; i < n; i += 1) {
    const j = (i + 1) % n
    const p = ring[i * 2 + b] - offset
    const q = ring[j * 2 + b] - offset
    if (p > 0 !== q > 0) hits.push(ring[i * 2 + a] + ((ring[j * 2 + a] - ring[i * 2 + a]) * p) / (p - q))
  }
  hits.sort((m, k) => m - k)
  const pairs = []
  for (let i = 0; i + 1 < hits.length; i += 2) pairs.push([hits[i], hits[i + 1]])
  return pairs
}
