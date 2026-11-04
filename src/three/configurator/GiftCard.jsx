import { useEffect, useMemo, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

const WIDTH = 1.7
const HEIGHT = 1.05

function wrap(ctx, text, maxWidth) {
  const lines = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

async function drawCard(note) {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 632
  const ctx = c.getContext('2d')
  const arabic = /[؀-ۿ]/.test(note)
  const font = arabic ? '74px Amiri' : 'italic 82px Cormorant'
  await document.fonts.load(font, note)

  ctx.fillStyle = '#FBF4EA'
  ctx.fillRect(0, 0, 1024, 632)
  ctx.strokeStyle = '#C99A4E'
  ctx.lineWidth = 5
  ctx.strokeRect(34, 34, 956, 564)
  ctx.lineWidth = 2
  ctx.strokeRect(50, 50, 924, 532)

  ctx.font = font
  ctx.fillStyle = '#44291A'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.direction = arabic ? 'rtl' : 'ltr'
  const lines = wrap(ctx, note, 800).slice(0, 5)
  const step = 104
  lines.forEach((line, i) => ctx.fillText(line, 512, 316 + (i - (lines.length - 1) / 2) * step))

  const texture = new THREE.CanvasTexture(c)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

/** The visitor's own note, on a card resting against the front of the box. */
export function GiftCard({ note, z }) {
  const { invalidate } = useThree()
  const [texture, setTexture] = useState(null)
  const text = note.trim()
  const body = useMemo(() => new RoundedBoxGeometry(WIDTH, HEIGHT, 0.02, 2, 0.008), [])

  useEffect(() => () => body.dispose(), [body])

  useEffect(() => {
    if (!text) {
      setTexture(null)
      invalidate()
      return undefined
    }
    let live = true
    let made
    // Waits for a pause in typing, so each keystroke does not redraw the card.
    const timer = setTimeout(() => {
      drawCard(text).then((t) => {
        made = t
        if (!live) {
          t.dispose()
          return
        }
        setTexture(t)
        invalidate()
      }).catch((err) => console.error(err))
    }, 220)
    return () => {
      live = false
      clearTimeout(timer)
      made?.dispose()
    }
  }, [text, invalidate])

  if (!texture) return null
  return (
    <group position={[0, HEIGHT / 2 * 0.86, z]} rotation={[-0.5, 0, 0]}>
      <mesh geometry={body} castShadow>
        <meshStandardMaterial color="#FBF4EA" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.0115]}>
        <planeGeometry args={[WIDTH * 0.985, HEIGHT * 0.975]} />
        <meshStandardMaterial map={texture} roughness={0.72} />
      </mesh>
    </group>
  )
}
