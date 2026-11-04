import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { getQuality } from '../quality'
import { StudioLight } from '../StudioLight'
import { HaloTray } from '../models/HaloTray'
import { GoldDust } from '../models/GoldDust'
import { Ribbon } from '../models/Ribbon'
import { circleRing, SoftShadow } from '../models/SoftShadow'
import { bonbonGeometry, seeded } from '../models/geometry'
import { sceneFirstFrame } from '../../state/intro'

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const range = (v, a, b) => clamp01((v - a) / (b - a))
const smooth = (v) => v * v * (3 - 2 * v)

// The camera's journey: in front of the tray, through its arches, into the Maison.
const PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 3.2, 19.5),
  new THREE.Vector3(0, 3.0, 11),
  new THREE.Vector3(0, 2.75, 3.4),
  new THREE.Vector3(0, 2.6, -1.8),
  new THREE.Vector3(0.5, 2.5, -9),
  new THREE.Vector3(-1.4, 2.8, -20),
  new THREE.Vector3(1.2, 2.4, -32),
  new THREE.Vector3(0, 2.8, -46),
], false, 'centripetal')

// The ribbon spirals around the route at a distance, so the camera never meets it.
const RIBBON = new THREE.CatmullRomCurve3(
  Array.from({ length: 34 }, (_, i) => {
    const a = i * 0.78
    const r = 4.4 + Math.sin(i * 0.5) * 0.7
    return new THREE.Vector3(Math.cos(a) * r, 2.7 + Math.sin(a) * r * 0.8, -4.5 - i * 1.65)
  }),
)

const TRAY_FOOTPRINT = circleRing(3.1)
const IVORY = new THREE.Color('#F4E8D8')
const CAMEL = new THREE.Color('#C8975F')
const DEEP = new THREE.Color('#21120A')

const dummy = new THREE.Object3D()

/** Bonbons and squares adrift beyond the arches, turning slowly in the dark. */
function PralineField({ count, groupRef, children }) {
  const domeRef = useRef()
  const squareRef = useRef()
  const dome = useMemo(() => bonbonGeometry(), [])
  const square = useMemo(() => new RoundedBoxGeometry(1, 0.62, 1, 3, 0.09), [])

  const pieces = useMemo(() => {
    const rand = seeded(23)
    const tones = ['#2E170D', '#4A2A1A', '#6B3F26', '#C99684', '#EBD7BE']
    return Array.from({ length: count }, (_, i) => {
      const z = -5 - rand() * 46
      const a = rand() * Math.PI * 2
      const r = 2.4 + rand() * 7.5
      return {
        kind: i % 3 === 2 ? 'square' : 'dome',
        position: new THREE.Vector3(Math.cos(a) * r, 2.6 + Math.sin(a) * r * 0.72, z),
        spin: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.5),
        phase: rand() * 6.28,
        scale: 0.5 + rand() * 0.8,
        color: tones[Math.floor(rand() ** 1.7 * tones.length)],
      }
    })
  }, [count])

  const domes = useMemo(() => pieces.filter((p) => p.kind === 'dome'), [pieces])
  const squares = useMemo(() => pieces.filter((p) => p.kind === 'square'), [pieces])

  useLayoutEffect(() => {
    const color = new THREE.Color()
    domes.forEach((p, i) => domeRef.current.setColorAt(i, color.set(p.color)))
    squares.forEach((p, i) => squareRef.current.setColorAt(i, color.set(p.color)))
    domeRef.current.instanceColor.needsUpdate = true
    squareRef.current.instanceColor.needsUpdate = true
  }, [domes, squares])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const write = (mesh, list) => {
      list.forEach((p, i) => {
        dummy.position.copy(p.position)
        dummy.position.y += Math.sin(t * 0.35 + p.phase) * 0.22
        dummy.rotation.set(p.spin.x * t + p.phase, p.spin.y * t, p.spin.z * t)
        dummy.scale.setScalar(p.scale)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
    }
    write(domeRef.current, domes)
    write(squareRef.current, squares)
  })

  return (
    <group ref={groupRef} visible={false}>
      <instancedMesh ref={domeRef} args={[dome, undefined, domes.length]} frustumCulled={false}>
        <meshPhysicalMaterial roughness={0.28} clearcoat={0.9} clearcoatRoughness={0.18} />
      </instancedMesh>
      <instancedMesh ref={squareRef} args={[square, undefined, squares.length]} frustumCulled={false}>
        <meshPhysicalMaterial roughness={0.32} clearcoat={0.7} clearcoatRoughness={0.25} />
      </instancedMesh>
      {children}
    </group>
  )
}

function Rig({ film, quality }) {
  const { camera, scene, size } = useThree()
  const door = useRef()
  const halo = useRef()
  const glow = useRef()
  const beyond = useRef()
  const dustOpacity = useRef(0)
  const eased = useRef(0)
  const pointer = useRef(new THREE.Vector2())
  const target = useMemo(() => new THREE.Vector3(), [])
  const ahead = useMemo(() => new THREE.Vector3(), [])
  const fog = useMemo(() => new THREE.Fog('#21120A', 4, 42), [])

  useEffect(() => {
    scene.fog = fog
    return () => { scene.fog = null }
  }, [scene, fog])

  useFrame((state, delta) => {
    eased.current = THREE.MathUtils.damp(eased.current, film.current.progress, 5, delta)
    const p = eased.current

    // Tall phones need the camera further back to keep the whole tray in frame.
    const portrait = size.width / size.height < 0.85 ? 1.55 : 1
    PATH.getPointAt(p, target)
    PATH.getPointAt(Math.min(p + 0.035, 1), ahead)
    const hold = 1 - range(p, 0.1, 0.22)
    target.z += hold * (portrait - 1) * 11
    target.y += hold * (portrait - 1) * 1.1

    pointer.current.x = THREE.MathUtils.damp(pointer.current.x, film.current.mouseX, 3, delta)
    pointer.current.y = THREE.MathUtils.damp(pointer.current.y, film.current.mouseY, 3, delta)
    camera.position.set(target.x + pointer.current.x * 0.55, target.y + pointer.current.y * 0.3, target.z)
    const lookY = THREE.MathUtils.lerp(3.05, ahead.y, range(p, 0.05, 0.25))
    camera.lookAt(ahead.x, lookY, ahead.z - 2)

    // The centre panel sinks as the camera arrives, and light floods through.
    const open = smooth(range(p, 0.1, 0.25))
    if (door.current) door.current.position.y = -open * 3.3
    if (glow.current) glow.current.intensity = open * (1 - range(p, 0.3, 0.42)) * 90

    if (halo.current) halo.current.visible = p < 0.42
    // The world behind the arches stays hidden until the door begins to open.
    if (beyond.current) beyond.current.visible = open > 0.02
    if (halo.current) halo.current.rotation.y = pointer.current.x * 0.06 * (1 - open)

    const dusk = smooth(range(p, 0.14, 0.3))
    if (dusk < 0.5) fog.color.copy(IVORY).lerp(CAMEL, dusk * 2)
    else fog.color.copy(CAMEL).lerp(DEEP, dusk * 2 - 1)
    fog.near = THREE.MathUtils.lerp(30, 3, dusk)
    fog.far = THREE.MathUtils.lerp(90, 38, dusk)
    dustOpacity.current = range(p, 0.14, 0.3)
    state.scene.environmentIntensity = THREE.MathUtils.lerp(1, 0.62, dusk)
  })

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(sceneFirstFrame))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <>
      <StudioLight />
      <directionalLight position={[5, 9, 7]} intensity={1.7} color="#FFE3C2" castShadow={!quality.low} shadow-mapSize={[1024, 1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={8} shadow-camera-bottom={-4} shadow-bias={-0.0004} />
      <pointLight ref={glow} position={[0, 2.6, -3.4]} color="#FFC777" distance={16} decay={1.4} intensity={0} />
      <pointLight position={[0, 4, -24]} color="#E9A85C" distance={34} decay={1.2} intensity={38} />
      <pointLight position={[0, 3, -44]} color="#FFD28F" distance={30} decay={1.2} intensity={30} />
      <HaloTray ref={halo} doorRef={door} />
      <SoftShadow ring={TRAY_FOOTPRINT} opacity={0.42} />
      <PralineField count={quality.fieldPralines} groupRef={beyond}>
        <Ribbon curve={RIBBON} />
      </PralineField>
      <GoldDust count={quality.dust} opacityRef={dustOpacity} />
    </>
  )
}

/** `film` is a ref written by ScrollTrigger, so scrolling never re-renders React. */
export default function FilmScene({ film, active }) {
  const quality = useMemo(getQuality, [])
  return (
    <Canvas
      className="film__canvas"
      frameloop={active ? 'always' : 'never'}
      dpr={quality.dpr}
      shadows={quality.low ? false : 'percentage'}
      gl={{ alpha: true, antialias: quality.antialias, powerPreference: 'high-performance' }}
      camera={{ fov: 32, near: 0.12, far: 110, position: [0, 3.2, 19.5] }}
      aria-hidden="true"
    >
      <Rig film={film} quality={quality} />
    </Canvas>
  )
}
