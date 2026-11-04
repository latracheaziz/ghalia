import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { leafGeometry, roseGeometry, seeded } from './geometry'

const dummy = new THREE.Object3D()

function useInstances(ref, items) {
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const color = new THREE.Color()
    items.forEach((item, i) => {
      dummy.position.set(...item.position)
      dummy.rotation.set(...item.rotation)
      dummy.scale.setScalar(item.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, color.set(item.color))
    })
    mesh.count = items.length
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [items, ref])
}

/** All roses and leaves of a scene in two draw calls. */
export function Flowers({ roses, leaves = [] }) {
  const roseRef = useRef()
  const leafRef = useRef()
  const rose = useMemo(() => roseGeometry(), [])
  const leaf = useMemo(() => leafGeometry(), [])
  useInstances(roseRef, roses)
  useInstances(leafRef, leaves)

  return (
    <>
      <instancedMesh key={`r${roses.length}`} ref={roseRef} args={[rose, undefined, Math.max(roses.length, 1)]} castShadow>
        <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.62} />
      </instancedMesh>
      {leaves.length ? (
        <instancedMesh key={`l${leaves.length}`} ref={leafRef} args={[leaf, undefined, leaves.length]}>
          <meshStandardMaterial side={THREE.DoubleSide} roughness={0.7} />
        </instancedMesh>
      ) : null}
    </>
  )
}

/** Scatters roses around a path of anchor points, with leaves tucked in behind. */
export function arrangeBouquet(anchors, { colors, leafColors = ['#B8A27C', '#A89878', '#C7B08A'], density = 1, seed = 7, spread = 0.42, size = 0.42 }) {
  const rand = seeded(seed)
  const roses = []
  const leaves = []
  const gap = size * 1.55
  const clear = (p) => roses.every(({ position: q }) => Math.hypot(p[0] - q[0], p[1] - q[1], (p[2] - q[2]) * 0.5) > gap)

  anchors.forEach(([x, y, z]) => {
    const n = Math.round((2 + rand() * 2) * density)
    for (let i = 0; i < n; i += 1) {
      // Roses must not cut through each other, so a crowded spot is simply skipped.
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const position = [x + (rand() - 0.5) * spread * 2, y + (rand() - 0.5) * spread * 2, z + (rand() - 0.2) * spread]
        if (!clear(position)) continue
        roses.push({
          position,
          rotation: [Math.PI / 2 - 0.5 + rand() * 0.8, rand() * 0.8 - 0.4, rand() * 6.28],
          scale: size * (0.8 + rand() * 0.4),
          color: colors[Math.floor(rand() * colors.length)],
        })
        break
      }
    }
    const m = Math.round(2 * density)
    for (let i = 0; i < m; i += 1) {
      leaves.push({
        position: [x + (rand() - 0.5) * spread * 2.6, y + (rand() - 0.5) * spread * 2.2, z - 0.2],
        rotation: [rand() * 0.8 - 0.4, rand() * 1.2, rand() * 6.28],
        scale: 0.42 + rand() * 0.4,
        color: leafColors[Math.floor(rand() * leafColors.length)],
      })
    }
  })
  return { roses, leaves }
}
