import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

const SIZE = 256

function drawShadow(ring, span, tone) {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  const scale = SIZE / span
  // The shape is drawn off-canvas so that only its blurred shadow lands on it.
  const away = SIZE * 2
  ctx.shadowColor = tone
  ctx.shadowBlur = SIZE * 0.09
  ctx.shadowOffsetX = away
  ctx.beginPath()
  for (let i = 0; i < ring.length; i += 2) {
    const x = SIZE / 2 + ring[i] * scale - away
    const y = SIZE / 2 + ring[i + 1] * scale
    ctx[i ? 'lineTo' : 'moveTo'](x, y)
  }
  ctx.closePath()
  ctx.fill()
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * The soft dark pool where an object meets the floor, in its true footprint.
 * One textured plane, so it costs next to nothing, and it needs no extra render pass.
 */
export function SoftShadow({ ring, opacity = 0.5, tone = '#3A2115', y = 0.003, position = [0, 0, 0] }) {
  const span = useMemo(() => {
    let reach = 0
    for (let i = 0; i < ring.length; i += 1) reach = Math.max(reach, Math.abs(ring[i]))
    return reach * 3
  }, [ring])
  const texture = useMemo(() => drawShadow(ring, span, tone), [ring, span, tone])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position[0], y, position[2]]}>
      <planeGeometry args={[span, span]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

/** A circular footprint for scenes that have no outline data. */
export function circleRing(radius, steps = 64) {
  const ring = new Float32Array(steps * 2)
  for (let i = 0; i < steps; i += 1) {
    const a = (i / steps) * Math.PI * 2
    ring[i * 2] = Math.cos(a) * radius
    ring[i * 2 + 1] = Math.sin(a) * radius
  }
  return ring
}
