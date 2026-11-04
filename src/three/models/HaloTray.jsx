import { forwardRef, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { archRing, archShape, bonbonGeometry } from './geometry'
import { arrangeBouquet, Flowers } from './Flowers'
import { useWordmarkTexture } from './textures'

// Scale: 1 unit = 10 cm. The brand book gives 60 cm across and 55 cm tall.
const RADIUS = 3
const BASE_H = 0.85
const TOTAL_H = 5.5
const ARCH_Z = -1.7

const BLUSH = '#D9AFA0'
const MOCHA = '#3A2115'
const IVORY = '#EFDFC8'
const GOLD = '#D6A85E'

const dummy = new THREE.Object3D()

function Ring({ w, h, thickness, depth, z, material }) {
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(archRing(w, h, thickness), {
      depth, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 48,
    })
    g.translate(0, BASE_H, z)
    return g
  }, [w, h, thickness, depth, z])
  return <mesh geometry={geometry} material={material} castShadow />
}

/** Rings of chocolates laid out like the concept sheet: about 96 pieces, within its 80 to 120. */
function layoutPieces() {
  const squares = []
  const domes = []
  const place = (list, radius, count, y, scale, color) => {
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI * 2 + 0.06
      const x = Math.cos(a) * radius
      const z = Math.sin(a) * radius + 0.25
      if (z < -1.05) continue
      list.push({ position: [x, y, z], angle: -a, scale, color })
    }
  }
  place(squares, 2.62, 44, BASE_H + 0.17, 0.27, '#3A2013')
  place(squares, 2.2, 36, BASE_H + 0.17, 0.25, '#EBD7BE')
  place(domes, 1.78, 26, BASE_H + 0.05, 0.42, '#4A2A1A')
  place(domes, 1.3, 18, BASE_H + 0.05, 0.4, '#D9A79A')
  place(domes, 0.82, 11, BASE_H + 0.05, 0.4, '#3A2013')
  return { squares, domes }
}

function Pieces() {
  const squaresRef = useRef()
  const domesRef = useRef()
  const { squares, domes } = useMemo(layoutPieces, [])
  const squareGeometry = useMemo(() => new RoundedBoxGeometry(1, 0.9, 1, 3, 0.1), [])
  const domeGeometry = useMemo(() => bonbonGeometry(), [])

  useLayoutEffect(() => {
    const color = new THREE.Color()
    const fill = (mesh, list) => {
      list.forEach((item, i) => {
        dummy.position.set(...item.position)
        dummy.rotation.set(0, item.angle, 0)
        dummy.scale.setScalar(item.scale)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        mesh.setColorAt(i, color.set(item.color))
      })
      mesh.instanceMatrix.needsUpdate = true
      mesh.instanceColor.needsUpdate = true
    }
    fill(squaresRef.current, squares)
    fill(domesRef.current, domes)
  }, [squares, domes])

  return (
    <>
      <instancedMesh ref={squaresRef} args={[squareGeometry, undefined, squares.length]} castShadow>
        <meshPhysicalMaterial roughness={0.36} clearcoat={0.55} clearcoatRoughness={0.3} />
      </instancedMesh>
      <instancedMesh ref={domesRef} args={[domeGeometry, undefined, domes.length]} castShadow>
        <meshPhysicalMaterial roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.22} />
      </instancedMesh>
    </>
  )
}

/**
 * The Halo Tray from the brand book's Concept 01 sheet.
 * `doorRef` exposes the centre panel so the film can open it;
 * `backPanel` closes the rear for the product viewer.
 */
export const HaloTray = forwardRef(function HaloTray({ doorRef, backPanel = false, floralDensity = 1, palette, ...rest }, ref) {
  const logo = useWordmarkTexture()
  const blush = palette?.primary ?? BLUSH
  const mocha = palette?.secondary ?? MOCHA
  const floralColors = palette?.floral ?? ['#E9BFB2', '#F4E2D6', '#DDA093', '#F8EDE0']

  const materials = useMemo(() => ({
    blush: new THREE.MeshPhysicalMaterial({ color: blush, roughness: 0.34, clearcoat: 0.5, clearcoatRoughness: 0.35 }),
    mocha: new THREE.MeshPhysicalMaterial({ color: mocha, roughness: 0.4, clearcoat: 0.45, clearcoatRoughness: 0.3 }),
    gold: new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.24 }),
    acrylic: new THREE.MeshPhysicalMaterial({ color: '#FBF1E6', roughness: 0.12, clearcoat: 1, transparent: true, opacity: 0.32 }),
  }), [blush, mocha])

  useLayoutEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials])

  const baseGeometry = useMemo(() => {
    const profile = [[0, 0], [RADIUS, 0], [RADIUS + 0.06, 0.05], [RADIUS + 0.06, BASE_H - 0.05], [RADIUS, BASE_H], [0, BASE_H]]
    return new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), 96)
  }, [])

  const panelGeometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(archShape(1.64, 3.52), { depth: 0.08, bevelEnabled: false, curveSegments: 48 })
    g.translate(0, BASE_H, 0)
    return g
  }, [])

  const backGeometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(archShape(3.9, TOTAL_H - BASE_H), { depth: 0.08, bevelEnabled: false, curveSegments: 48 })
    g.translate(0, BASE_H, ARCH_Z - 0.62)
    return g
  }, [])

  const bouquet = useMemo(() => {
    const anchors = []
    for (const side of [-1, 1]) {
      for (let i = 0; i < 7; i += 1) {
        anchors.push([side * (2.3 + Math.sin(i * 0.9) * 0.22 - i * 0.03), BASE_H + 0.15 + i * 0.4, ARCH_Z + 0.5])
      }
    }
    return arrangeBouquet(anchors, { colors: floralColors, density: floralDensity, seed: 11, spread: 0.5, size: 0.25 })
  }, [floralColors, floralDensity])

  return (
    <group ref={ref} {...rest}>
      <mesh geometry={baseGeometry} material={materials.blush} castShadow receiveShadow />
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.gold}><torusGeometry args={[RADIUS + 0.07, 0.05, 12, 120]} /></mesh>
      <mesh position={[0, BASE_H, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.gold}><torusGeometry args={[RADIUS + 0.02, 0.045, 12, 120]} /></mesh>
      <mesh position={[0, BASE_H + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.acrylic}><circleGeometry args={[RADIUS, 96]} /></mesh>

      {logo ? (
        <mesh position={[0, BASE_H / 2, 0]}>
          <cylinderGeometry args={[RADIUS + 0.075, RADIUS + 0.075, 0.42, 48, 1, true, -0.28, 0.56]} />
          <meshStandardMaterial map={logo} transparent metalness={0.8} roughness={0.3} />
        </mesh>
      ) : null}

      <Pieces />

      <Ring w={3.9} h={TOTAL_H - BASE_H} thickness={0.5} depth={0.22} z={ARCH_Z - 0.5} material={materials.blush} />
      <Ring w={3.96} h={TOTAL_H - BASE_H + 0.03} thickness={0.05} depth={0.3} z={ARCH_Z - 0.54} material={materials.gold} />
      <Ring w={2.96} h={4.17} thickness={0.42} depth={0.2} z={ARCH_Z - 0.3} material={materials.mocha} />
      <Ring w={3.0} h={4.19} thickness={0.04} depth={0.26} z={ARCH_Z - 0.33} material={materials.gold} />
      <Ring w={2.14} h={3.76} thickness={0.26} depth={0.18} z={ARCH_Z - 0.1} material={materials.blush} />
      <Ring w={2.18} h={3.78} thickness={0.035} depth={0.24} z={ARCH_Z - 0.13} material={materials.gold} />

      <group ref={doorRef} position={[0, 0, ARCH_Z + 0.02]}>
        <mesh geometry={panelGeometry} material={materials.blush} castShadow />
        {logo ? (
          <mesh position={[0, BASE_H + 1.7, 0.09]}>
            <planeGeometry args={[1.3, 0.325]} />
            <meshStandardMaterial map={logo} transparent metalness={0.85} roughness={0.28} />
          </mesh>
        ) : null}
      </group>

      {backPanel ? <mesh geometry={backGeometry} material={materials.blush} /> : null}
      <Flowers roses={bouquet.roses} leaves={bouquet.leaves} />
    </group>
  )
})
