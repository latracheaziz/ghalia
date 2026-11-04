import { useMemo } from 'react'
import * as THREE from 'three'
import { ribbonGeometry } from './geometry'
import { useRibbonTexture } from './textures'

/** The satin ribbon, woven with the wordmark, that guides the film through the Maison. */
export function Ribbon({ curve, width = 0.62, segments = 420, repeat = 26 }) {
  const texture = useRibbonTexture()
  const geometry = useMemo(() => ribbonGeometry(curve, width, segments, repeat), [curve, width, segments, repeat])

  if (!texture) return null
  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        map={texture}
        side={THREE.DoubleSide}
        roughness={0.5}
        metalness={0.05}
        sheen={0.35}
        sheenRoughness={0.4}
        sheenColor="#C9925A"
      />
    </mesh>
  )
}
