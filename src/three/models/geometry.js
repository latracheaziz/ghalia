import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/** Small seeded generator, so every visitor sees the same arrangement. */
export function seeded(seed = 1) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function traceArch(target, w, h) {
  const r = w / 2
  target.moveTo(-r, 0)
  target.lineTo(-r, h - r)
  target.absarc(0, h - r, r, Math.PI, 0, true)
  target.lineTo(r, 0)
  target.closePath()
  return target
}

export const archShape = (w, h) => traceArch(new THREE.Shape(), w, h)

/** An arch-shaped band: the outline of the Halo Tray's nested arches. */
export function archRing(w, h, thickness) {
  const shape = new THREE.Shape()
  const r = w / 2
  const ri = r - thickness
  const spring = h - r
  shape.moveTo(-r, 0)
  shape.lineTo(-r, spring)
  shape.absarc(0, spring, r, Math.PI, 0, true)
  shape.lineTo(r, 0)
  shape.lineTo(ri, 0)
  shape.lineTo(ri, spring)
  shape.absarc(0, spring, ri, 0, Math.PI, false)
  shape.lineTo(-ri, 0)
  shape.closePath()
  return shape
}

/** The fluted bonbon from the brand book cover, turned on a lathe. */
export function bonbonGeometry() {
  const profile = [
    [0.0, 0.0], [0.42, 0.0], [0.5, 0.05], [0.5, 0.2], [0.47, 0.4], [0.38, 0.55], [0.22, 0.65], [0.0, 0.69],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  const curve = new THREE.SplineCurve(profile)
  const geometry = new THREE.LatheGeometry(curve.getPoints(18), 48)
  const pos = geometry.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i)
    const a = Math.atan2(v.z, v.x)
    const flute = 1 + 0.055 * Math.cos(a * 10) * Math.min(1, v.y * 3)
    pos.setXYZ(i, v.x * flute, v.y, v.z * flute)
  }
  geometry.computeVertexNormals()
  return geometry
}

function petal(width, height, curl, cup) {
  const geometry = new THREE.PlaneGeometry(width, height, 8, 8)
  geometry.translate(0, height / 2, 0)
  const pos = geometry.attributes.position
  for (let i = 0; i < pos.count; i += 1) {
    const u = pos.getX(i) / width
    const y = pos.getY(i) / height
    // Narrow at the base, full and rounded at the tip.
    const outline = Math.sin(Math.PI * y ** 0.72) ** 0.55 + 0.04
    const x = u * width * outline
    pos.setXYZ(i, x, pos.getY(i), curl * height * y * y - cup * (u * 2) ** 2 * width * outline)
  }
  return geometry
}

// Each ring of petals lies on its own sphere, so rings can never cut through
// one another: radius, opening angle, petal count, half-width, outward flare.
const ROSE_RINGS = [
  [0.15, 0.3, 3, 2.0, 0.02],
  [0.22, 0.55, 4, 1.25, 0.1],
  [0.31, 0.8, 5, 0.98, 0.2],
  [0.42, 1.05, 5, 0.92, 0.36],
  [0.54, 1.32, 6, 0.76, 0.58],
]

function shellPetal(radius, opening, azimuth, halfWidth, flare, tone, shade) {
  const SEG_U = 8
  const SEG_V = 6
  const positions = []
  const indices = []
  for (let v = 0; v <= SEG_V; v += 1) {
    const s = v / SEG_V
    // Polar angle runs from the rose's base up to this ring's open lip.
    const polar = Math.PI * 0.94 + (opening - Math.PI * 0.94) * s
    const reach = halfWidth * Math.sin(Math.PI * (0.16 + s * 0.74)) ** 0.7
    const r = radius * (1 + flare * s * s)
    for (let u = 0; u <= SEG_U; u += 1) {
      const across = u / SEG_U - 0.5
      const a = azimuth + across * 2 * reach
      // The lip dips at the petal's edges, which rounds its tip.
      const lip = polar + (across * 2) ** 2 * s * 0.26
      positions.push(r * Math.sin(lip) * Math.cos(a), r * Math.cos(lip), r * Math.sin(lip) * Math.sin(a))
      const light = tone * (0.62 + 0.38 * s)
      shade.push(light, light, light)
    }
  }
  for (let v = 0; v < SEG_V; v += 1) {
    for (let u = 0; u < SEG_U; u += 1) {
      const i = v * (SEG_U + 1) + u
      indices.push(i, i + SEG_U + 1, i + 1, i + 1, i + SEG_U + 1, i + SEG_U + 2)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  return geometry
}

/** A rose built as nested shells of petals, darker towards its heart. */
export function roseGeometry() {
  const parts = []
  const shade = []
  ROSE_RINGS.forEach(([radius, opening, count, halfWidth, flare], ring) => {
    const tone = 0.56 + (ring / (ROSE_RINGS.length - 1)) * 0.44
    for (let i = 0; i < count; i += 1) {
      const azimuth = (i / count) * Math.PI * 2 + ring * 0.7
      // A sliver of extra radius per petal stops neighbours flickering where they overlap.
      parts.push(shellPetal(radius + i * 0.007, opening, azimuth, halfWidth, flare, tone, shade))
    }
  })
  const geometry = mergeGeometries(parts)
  parts.forEach((p) => p.dispose())
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(shade, 3))
  geometry.computeVertexNormals()
  geometry.scale(1.5, 1.5, 1.5)
  return geometry
}

export function leafGeometry() {
  const geometry = petal(0.2, 1.05, 0.3, 0.12)
  geometry.computeVertexNormals()
  return geometry
}

/** A flat strip swept along a curve, with a gentle twist: the Maison's satin ribbon. */
export function ribbonGeometry(curve, width, segments, repeat) {
  const frames = curve.computeFrenetFrames(segments, false)
  const positions = []
  const uvs = []
  const indices = []
  const point = new THREE.Vector3()
  const side = new THREE.Vector3()
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments
    curve.getPointAt(t, point)
    const angle = Math.sin(t * Math.PI * 7) * 0.7
    side.copy(frames.normals[i]).multiplyScalar(Math.cos(angle))
      .addScaledVector(frames.binormals[i], Math.sin(angle))
      .multiplyScalar(width / 2)
    positions.push(point.x - side.x, point.y - side.y, point.z - side.z, point.x + side.x, point.y + side.y, point.z + side.z)
    uvs.push(-t * repeat, 0, -t * repeat, 1)
    if (i < segments) {
      const a = i * 2
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}
