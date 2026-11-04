import * as THREE from 'three'
import { BOXES, extentOf, ringOf, SEGMENTS } from './boxes.js'

// The box is lofted from rings of the footprint at given insets and heights.
export const WALL = 0.07
export const GAP = 0.035
export const BEVEL = 0.028
export const FLOOR_DROP = 0.5

const PLAIN_ART = { x: 0, z: 0, scale: 1 }

const mix = (a, b, k) => a + (b - a) * k

/** Outlines and sizes part-way between two formats. k = 1 is fully `to`. */
export function blendSpec(from, to, k) {
  const a = BOXES[from]
  const b = BOXES[to]
  const ring = (inset) => {
    const p = ringOf(from, inset)
    const q = ringOf(to, inset)
    if (k >= 1) return q
    const out = new Float32Array(p.length)
    for (let i = 0; i < p.length; i += 1) out[i] = mix(p[i], q[i], k)
    return out
  }
  return { ring, height: mix(a.height, b.height, k), lid: mix(a.lid, b.lid, k), art: b.art ?? PLAIN_ART }
}

function wall(profile, ring) {
  const columns = SEGMENTS + 1
  const position = new Float32Array(profile.length * columns * 3)
  const uv = new Float32Array(profile.length * columns * 2)
  const first = ring(profile[0][0])
  const along = new Float32Array(columns)
  for (let i = 1; i < columns; i += 1) {
    const a = (i - 1) * 2
    const b = (i % SEGMENTS) * 2
    along[i] = along[i - 1] + Math.hypot(first[b] - first[a], first[b + 1] - first[a + 1])
  }
  // A whole number of tiles around the box, so the artwork has no visible seam.
  const tiles = Math.max(1, Math.round(along[SEGMENTS] / 2.4))
  let climbed = 0
  profile.forEach(([inset, y], row) => {
    const points = ring(inset)
    if (row) climbed += Math.hypot(inset - profile[row - 1][0], y - profile[row - 1][1])
    for (let i = 0; i < columns; i += 1) {
      const c = (i % SEGMENTS) * 2
      const at = (row * columns + i) * 3
      position[at] = points[c]
      position[at + 1] = y
      position[at + 2] = points[c + 1]
      const t = (row * columns + i) * 2
      uv[t] = (along[i] / along[SEGMENTS]) * tiles
      uv[t + 1] = climbed / 2.4
    }
  })
  const index = new Uint16Array((profile.length - 1) * SEGMENTS * 6)
  let w = 0
  for (let row = 0; row < profile.length - 1; row += 1) {
    for (let i = 0; i < SEGMENTS; i += 1) {
      const a = row * columns + i
      const b = a + columns
      index[w++] = a
      index[w++] = b
      index[w++] = a + 1
      index[w++] = a + 1
      index[w++] = b
      index[w++] = b + 1
    }
  }
  return { position, uv, index }
}

function cap(points, y, half, facing, art = PLAIN_ART) {
  const position = new Float32Array(SEGMENTS * 3)
  const uv = new Float32Array(SEGMENTS * 2)
  const contour = []
  for (let i = 0; i < SEGMENTS; i += 1) {
    const x = points[i * 2]
    const z = points[i * 2 + 1]
    position.set([x, y, z], i * 3)
    uv.set([0.5 + (x - art.x) / (2 * half * art.scale), 0.5 - (z - art.z) / (2 * half * art.scale)], i * 2)
    contour.push(new THREE.Vector2(x, z))
  }
  const triangles = THREE.ShapeUtils.triangulateShape(contour, [])
  const index = new Uint16Array((SEGMENTS - 2) * 3)
  triangles.forEach(([a, b, c], i) => {
    // The ring runs counter-clockwise seen from below, so the face direction is chosen here.
    index.set(facing === 'up' ? [a, c, b] : [a, b, c], i * 3)
  })
  return { position, uv, index }
}

/** Every surface of the box for a blended spec, as raw arrays. */
export function buildParts(spec) {
  const { ring, height: H, lid: L, art } = spec
  const bag = L < 0.02
  const outer = bag ? 0 : GAP
  const inner = outer + WALL
  const floorY = bag ? H - 1.1 : Math.max(H - FLOOR_DROP - L * 0.12, 0.25)
  const edge = extentOf(ring(0))
  const half = Math.max(edge.x, edge.z, 0.5)

  const parts = {
    baseWall: wall([[outer, 0], [outer, H - 0.02]], ring),
    baseRim: wall([[outer, H - 0.02], [outer + 0.015, H], [inner - 0.015, H], [inner, H - 0.02], [inner, floorY]], ring),
    baseFloor: cap(ring(inner), floorY, half, 'up'),
    baseBottom: cap(ring(outer), 0.001, half, 'down'),
    floorY,
    half,
  }
  if (bag) return parts

  return {
    ...parts,
    lidWall: wall([[0, 0], [0, L - BEVEL], [BEVEL * 0.3, L - BEVEL * 0.3], [BEVEL, L]], ring),
    lidTop: cap(ring(BEVEL), L, half, 'up', art),
    lidInner: wall([[0, 0], [WALL * 0.5, 0], [WALL * 0.5, L - WALL * 0.5]], ring),
    lidCeiling: cap(ring(WALL * 0.5), L - WALL * 0.5, half, 'down'),
    trim: wall([[-0.012, -0.002], [-0.012, 0.05], [0, 0.056]], ring),
  }
}

/** Writes arrays into a geometry, reusing its buffers so a morph allocates nothing on the GPU. */
export function applyPart(geometry, part) {
  const position = geometry.getAttribute('position')
  if (position && position.count * 3 === part.position.length) {
    position.array.set(part.position)
    position.needsUpdate = true
    geometry.getAttribute('uv').array.set(part.uv)
    geometry.getAttribute('uv').needsUpdate = true
    geometry.index.array.set(part.index)
    geometry.index.needsUpdate = true
  } else {
    geometry.setAttribute('position', new THREE.BufferAttribute(part.position, 3))
    geometry.setAttribute('uv', new THREE.BufferAttribute(part.uv, 2))
    geometry.setIndex(new THREE.BufferAttribute(part.index, 1))
  }
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
}
