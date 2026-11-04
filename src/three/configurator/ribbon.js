import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { BOXES, extentOf, ringOf, spans } from './boxes.js'

const WIDTH = 0.3
const LIFT = 0.012

/** A flat strip following `points`, with its width along `across`. */
function strip(points, across, width = WIDTH, pinch = () => 1) {
  const positions = []
  const uvs = []
  const indices = []
  let length = 0
  points.forEach((p, i) => {
    if (i) length += p.distanceTo(points[i - 1])
    const half = (width / 2) * pinch(i / (points.length - 1))
    const side = typeof across === 'function' ? across(i / (points.length - 1)) : across
    positions.push(p.x - side.x * half, p.y - side.y * half, p.z - side.z * half, p.x + side.x * half, p.y + side.y * half, p.z + side.z * half)
    uvs.push(length / 2.4, 0, length / 2.4, 1)
    if (i < points.length - 1) {
      const a = i * 2
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  })
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  return geometry
}

/** One band over the lid: up the skirt, across the top and down the far side. */
function band(axis, offset, from, to, top) {
  const at = (s, y) => (axis === 'x' ? new THREE.Vector3(s, y, offset) : new THREE.Vector3(offset, y, s))
  const points = []
  const STEPS = 10
  const lift = top + LIFT
  points.push(at(from - LIFT, 0.01), at(from - LIFT, top - 0.02), at(from + 0.02, lift))
  for (let i = 1; i < STEPS; i += 1) points.push(at(from + ((to - from) * i) / STEPS, lift))
  points.push(at(to - 0.02, lift), at(to + LIFT, top - 0.02), at(to + LIFT, 0.01))
  return strip(points, axis === 'x' ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0))
}

/** A bow: two loops, two tails and a knot, centred on the origin. */
function bow(scale) {
  const parts = []
  const across = new THREE.Vector3(0, 0, 1)
  for (const side of [-1, 1]) {
    const loop = []
    for (let i = 0; i <= 28; i += 1) {
      const t = i / 28
      const a = t * Math.PI * 2
      // A teardrop in the x-y plane, leaving and returning to the knot.
      const reach = Math.sin(a / 2) ** 1.5
      loop.push(new THREE.Vector3(side * reach * 0.95 * scale, (0.03 + Math.sin(a) * 0.2 * reach + reach * 0.12) * scale, 0))
    }
    parts.push(strip(loop, across, WIDTH * 1.15 * scale, (t) => 0.5 + 0.5 * Math.sin(t * Math.PI)))

    const tail = []
    for (let i = 0; i <= 12; i += 1) {
      const t = i / 12
      tail.push(new THREE.Vector3(side * t * 0.8 * scale, (0.02 + Math.sin(t * 7) * 0.012) * scale, (0.2 + t * 0.62) * scale))
    }
    const direction = new THREE.Vector3(0.62, 0, -0.8 * side)
    parts.push(strip(tail, direction.normalize(), WIDTH * 1.05 * scale, (t) => (t > 0.94 ? 0.5 : 1)))
  }
  return mergeGeometries(parts.map((g) => g.toNonIndexed()))
}

/** All the ribbon for a format and tie style, positioned on the lid. */
export function ribbonGeometry(format, tie, lidHeight) {
  const box = BOXES[format]
  if (box.ribbon === 'none') return null
  const ring = ringOf(format, -0.014)
  const { x: ex, z: ez } = extentOf(ring)

  // The band runs the short way across, and also the long way for a cross tie. Both sit
  // off-centre, as on a real gift, so the bow never covers the wordmark.
  const shortAxis = ex > ez ? 'z' : 'x'
  const longAxis = shortAxis === 'z' ? 'x' : 'z'
  const cross = tie === 'cross' && box.ribbon !== 'short'
  const longest = (list) => list.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]))[0]

  const offset = box.ribbon === 'short' ? 0 : (shortAxis === 'z' ? ex : ez) * 0.62
  const main = longest(spans(ring, shortAxis, offset))
  if (!main) return null

  const parts = [band(shortAxis, offset, main[0], main[1], lidHeight)]
  let anchor = (main[0] + main[1]) / 2
  if (cross) {
    const crossing = (shortAxis === 'z' ? -ez : -ex) * 0.58
    const along = longest(spans(ring, longAxis, crossing))
    if (along) {
      parts.push(band(longAxis, crossing, along[0], along[1], lidHeight))
      anchor = crossing
    }
  }

  const size = Math.min(0.85, Math.max(0.5, Math.min(ex, ez) / 1.9))
  const bowX = shortAxis === 'z' ? offset : anchor
  const bowZ = shortAxis === 'z' ? anchor : offset
  const tied = bow(size)
  tied.translate(bowX, lidHeight + LIFT * 2, bowZ)
  parts.push(tied)

  const knot = new THREE.CapsuleGeometry(0.1 * size, 0.1 * size, 6, 12)
  knot.rotateX(Math.PI / 2)
  knot.scale(1.25, 0.8, 1.25)
  knot.translate(bowX, lidHeight + 0.075 * size, bowZ)
  const knotFlat = knot.toNonIndexed()
  knotFlat.deleteAttribute('normal')

  const flat = parts.map((g) => {
    const f = g.index ? g.toNonIndexed() : g
    f.deleteAttribute('normal')
    return f
  })
  const merged = mergeGeometries([...flat, knotFlat])
  merged.computeVertexNormals()
  ;[...parts, knot, knotFlat].forEach((g) => g.dispose())
  return merged
}
