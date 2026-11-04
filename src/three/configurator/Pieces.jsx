import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { gsap } from '../../animations/gsap'
import { bonbonGeometry } from '../models/geometry'
import { packPieces } from './packing.js'

const dummy = new THREE.Object3D()
const SIZE = { bonbon: 0.56, square: 0.46, macaron: 0.58, date: 0.56 }
const HEIGHT = { bonbon: 0, square: 0.13, macaron: 0, date: 0.1 }

function macaronGeometry() {
  const profile = [[0, 0], [0.42, 0], [0.5, 0.05], [0.5, 0.11], [0.44, 0.15], [0.47, 0.17], [0.47, 0.23], [0.42, 0.26], [0.47, 0.29], [0.5, 0.34], [0.46, 0.43], [0.3, 0.5], [0, 0.53]]
  return new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), 32)
}

function dateGeometry() {
  const geometry = new THREE.SphereGeometry(0.5, 28, 18)
  geometry.scale(1, 0.56, 0.6)
  const pos = geometry.attributes.position
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const wrinkle = 1 + 0.035 * Math.sin(x * 26 + z * 9) + 0.02 * Math.sin(z * 31)
    pos.setXYZ(i, x, y * wrinkle, z * wrinkle)
  }
  geometry.computeVertexNormals()
  return geometry
}

/** The contents of the box, one draw call per kind of piece. They drop in on a change. */
export function Pieces({ format, filling, floorY, visible, duration, onCount }) {
  const refs = { bonbon: useRef(), square: useRef(), macaron: useRef(), date: useRef() }
  const { invalidate } = useThree()
  const geometries = useMemo(() => ({
    bonbon: bonbonGeometry(),
    square: new RoundedBoxGeometry(1, 0.56, 1, 3, 0.1),
    macaron: macaronGeometry(),
    date: dateGeometry(),
  }), [])

  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries])

  const groups = useMemo(() => {
    const out = { bonbon: [], square: [], macaron: [], date: [] }
    packPieces(format, filling).forEach((piece) => out[piece.kind].push(piece))
    return out
  }, [format, filling])

  useEffect(() => { onCount?.(Object.values(groups).flat().length) }, [groups, onCount])

  useLayoutEffect(() => {
    const color = new THREE.Color()
    const place = (progress) => {
      Object.entries(groups).forEach(([kind, list]) => {
        const mesh = refs[kind].current
        if (!mesh) return
        list.forEach((piece, i) => {
          const own = Math.min(1, Math.max(0, progress * 1.6 - (i / Math.max(list.length, 1)) * 0.6))
          const eased = 1 - (1 - own) ** 3
          dummy.position.set(piece.x, floorY + HEIGHT[kind] + (1 - eased) * 0.5, piece.z)
          dummy.rotation.set(0, piece.angle, 0)
          dummy.scale.setScalar(Math.max(SIZE[kind] * eased, 0.0001))
          dummy.updateMatrix()
          mesh.setMatrixAt(i, dummy.matrix)
        })
        mesh.count = list.length
        mesh.instanceMatrix.needsUpdate = true
      })
      invalidate()
    }

    Object.entries(groups).forEach(([kind, list]) => {
      const mesh = refs[kind].current
      if (!mesh) return
      list.forEach((piece, i) => mesh.setColorAt(i, color.set(piece.color)))
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    })

    if (!duration) {
      place(1)
      return undefined
    }
    const state = { progress: 0 }
    place(0)
    const tween = gsap.to(state, { progress: 1, duration, ease: 'none', onUpdate: () => place(state.progress) })
    return () => tween.kill()
    // refs are stable; the arrangement only depends on what the visitor chose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, floorY, duration, invalidate])

  return (
    <group visible={visible}>
      {Object.keys(refs).map((kind) => (
        <instancedMesh key={`${kind}${groups[kind].length}`} ref={refs[kind]} args={[geometries[kind], undefined, Math.max(groups[kind].length, 1)]} visible={groups[kind].length > 0} frustumCulled={false} castShadow>
          <meshPhysicalMaterial roughness={kind === 'macaron' ? 0.62 : 0.3} clearcoat={kind === 'macaron' ? 0.1 : 0.75} clearcoatRoughness={0.25} />
        </instancedMesh>
      ))}
    </group>
  )
}
