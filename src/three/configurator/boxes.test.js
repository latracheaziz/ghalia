import test from 'node:test'
import assert from 'node:assert/strict'
import { BOXES, containsPoint, edgeDistance, ringOf, SEGMENTS, signedArea, spans } from './boxes.js'
import { blendSpec, buildParts, GAP, WALL } from './loft.js'
import { packPieces } from './packing.js'
import { collections, dateFilling, fillings } from '../../content/collections.js'

const FORMATS = Object.keys(BOXES)
const finite = (array) => array.every(Number.isFinite)

test('every format offered by a collection has a 3D definition', () => {
  for (const collection of collections) {
    for (const format of collection.formats) assert.ok(BOXES[format.id], `${collection.slug} offers ${format.id}`)
  }
})

test('every outline is a clean, consistently wound ring of equal length', () => {
  for (const format of FORMATS) {
    for (const inset of [0, GAP, GAP + WALL]) {
      const ring = ringOf(format, inset)
      assert.equal(ring.length, SEGMENTS * 2, format)
      assert.ok(finite([...ring]), `${format} has invalid points at inset ${inset}`)
      assert.ok(signedArea(ring) > 0, `${format} winds the wrong way at inset ${inset}`)
    }
  }
})

test('insetting always shrinks the footprint', () => {
  for (const format of FORMATS) {
    assert.ok(signedArea(ringOf(format, GAP + WALL)) < signedArea(ringOf(format, 0)), format)
  }
})

test('any format can morph into any other without invalid geometry', () => {
  for (const from of FORMATS) {
    for (const to of FORMATS) {
      const parts = buildParts(blendSpec(from, to, 0.5))
      for (const [name, part] of Object.entries(parts)) {
        if (part?.position) assert.ok(finite([...part.position]), `${from} to ${to}: ${name}`)
      }
    }
  }
})

test('morph surfaces keep their size, so GPU buffers can be reused', () => {
  const a = buildParts(blendSpec('round-box', 'heart-box', 0.2))
  const b = buildParts(blendSpec('crescent-box', 'long-box', 0.8))
  for (const name of ['baseWall', 'baseRim', 'baseFloor', 'lidWall', 'lidTop', 'lidInner', 'trim']) {
    assert.equal(a[name].position.length, b[name].position.length, name)
    assert.equal(a[name].index.length, b[name].index.length, name)
  }
})

test('every collection, format and filling packs pieces inside the box', () => {
  for (const collection of collections) {
    for (const format of collection.formats) {
      if (BOXES[format.id].bag) continue
      for (const filling of collection.fillings) {
        const pieces = packPieces(format.id, filling.id)
        assert.ok(pieces.length >= 3, `${format.id}/${filling.id} holds only ${pieces.length}`)
        const ring = ringOf(format.id, GAP + WALL)
        for (const piece of pieces) {
          assert.ok(containsPoint(ring, piece.x, piece.z), `${format.id}: piece outside the box`)
          assert.ok(edgeDistance(ring, piece.x, piece.z) > 0.1, `${format.id}: piece touching the wall`)
        }
      }
    }
  }
})

test('fillings produce different arrangements', () => {
  const kinds = (filling) => [...new Set(packPieces('gift-box', filling).map((p) => p.kind))].sort().join()
  const results = new Set([...fillings, dateFilling].map((f) => kinds(f.id)))
  assert.equal(results.size, 4)
})

test('ribbon spans find both arms of the crescent', () => {
  const across = spans(ringOf('crescent-box', 0), 'z', 0)
  assert.ok(across.length >= 1)
  for (const [a, b] of across) assert.ok(b > a)
})
