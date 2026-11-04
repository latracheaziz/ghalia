import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { getQuality } from '../quality'
import { StudioLight } from '../StudioLight'
import { HaloTray } from '../models/HaloTray'
import { arrangeBouquet, Flowers } from '../models/Flowers'
import { archRing, seeded } from '../models/geometry'
import { studio } from '../../content/events'

const GOLD = '#D6A85E'

const MOODS = {
  golden: { top: '#D9A679', horizon: '#FFE3BE', sun: '#FFD6A3', sunIntensity: 2.3, env: 0.85, glow: 6, floor: '#EADBC6' },
  evening: { top: '#1D1626', horizon: '#A9604A', sun: '#FFB877', sunIntensity: 0.45, env: 0.28, glow: 22, floor: '#8E7767' },
  day: { top: '#DCE6EA', horizon: '#FFF8EE', sun: '#FFFFFF', sunIntensity: 2.1, env: 1.05, glow: 2, floor: '#F2E8DA' },
}

const CAMERAS = {
  halo: { position: [0, 3.4, 15.5], target: [0, 1.9, -1] },
  pergola: { position: [7, 3, 12.5], target: [0, 1.8, 0] },
  reception: { position: [5.8, 3.3, 8.5], target: [0, 1.2, 0] },
}

const SKY_VERTEX = /* glsl */ `
  varying float vH;
  void main() {
    vH = normalize(position).y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const SKY_FRAGMENT = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  varying float vH;
  void main() {
    gl_FragColor = vec4(mix(uHorizon, uTop, smoothstep(0.0, 0.55, vH)), 1.0);
    #include <colorspace_fragment>
  }
`

const dummy = new THREE.Object3D()

function Sky({ mood }) {
  const uniforms = useMemo(() => ({ uTop: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() } }), [])
  useEffect(() => {
    uniforms.uTop.value.set(mood.top)
    uniforms.uHorizon.value.set(mood.horizon)
  }, [mood, uniforms])
  return (
    <mesh>
      <sphereGeometry args={[60, 24, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={SKY_VERTEX}
        fragmentShader={SKY_FRAGMENT}
      />
    </mesh>
  )
}

function Arch({ w, h, thickness, depth, color, metal, position }) {
  const geometry = useMemo(() => new THREE.ExtrudeGeometry(archRing(w, h, thickness), {
    depth, bevelEnabled: false, curveSegments: 40,
  }), [w, h, thickness, depth])
  return (
    <mesh geometry={geometry} position={position} castShadow>
      {metal
        ? <meshStandardMaterial color={GOLD} metalness={1} roughness={0.26} />
        : <meshPhysicalMaterial color={color} roughness={0.42} clearcoat={0.3} />}
    </mesh>
  )
}

function Drape({ position, height = 3.6, width = 1.2, rotationY = 0 }) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, 36, 10)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const gather = 0.55 + 0.45 * ((y + height / 2) / height)
      pos.setXYZ(i, x * gather, y, Math.sin((x / width) * 22) * 0.07)
    }
    g.computeVertexNormals()
    return g
  }, [width, height])
  return (
    <mesh geometry={geometry} position={position} rotation={[0, rotationY, 0]}>
      <meshStandardMaterial color="#FBF1E4" side={THREE.DoubleSide} roughness={0.75} transparent opacity={0.9} />
    </mesh>
  )
}

function Lantern({ position, glow }) {
  return (
    <group position={position}>
      <mesh><cylinderGeometry args={[0.012, 0.012, 0.6, 6]} /><meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} /></mesh>
      <mesh position={[0, -0.46, 0]}>
        <cylinderGeometry args={[0.11, 0.15, 0.34, 8]} />
        <meshStandardMaterial color="#FFD08A" emissive="#FFB65C" emissiveIntensity={Math.min(glow, 3.5)} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, -0.27, 0]}><cylinderGeometry args={[0.04, 0.13, 0.08, 8]} /><meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} /></mesh>
    </group>
  )
}

function Candles({ spots, glow }) {
  return spots.map(([x, y, z, h = 0.3], i) => (
    <group key={i} position={[x, y, z]}>
      <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[0.04, 0.04, h, 10]} /><meshStandardMaterial color="#F7EBDA" roughness={0.6} /></mesh>
      <mesh position={[0, h + 0.05, 0]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshStandardMaterial color="#FFC066" emissive="#FF9E3D" emissiveIntensity={Math.min(glow * 1.2, 12)} />
      </mesh>
    </group>
  ))
}

const LEG_OFFSETS = [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]

function Chairs({ spots, color }) {
  const seat = useRef()
  const back = useRef()
  const legs = useRef()
  const legGeometry = useMemo(() => new THREE.CylinderGeometry(0.014, 0.014, 0.44, 6), [])
  const seatGeometry = useMemo(() => new RoundedBoxGeometry(0.42, 0.1, 0.42, 2, 0.04), [])
  const backGeometry = useMemo(() => new RoundedBoxGeometry(0.4, 0.5, 0.035, 2, 0.015), [])

  useLayoutEffect(() => {
    spots.forEach(({ position, rotation }, i) => {
      dummy.position.set(position[0], 0.46, position[2])
      dummy.rotation.set(0, rotation, 0)
      dummy.updateMatrix()
      seat.current.setMatrixAt(i, dummy.matrix)
      dummy.translateZ(-0.2)
      dummy.position.y = 0.74
      dummy.updateMatrix()
      back.current.setMatrixAt(i, dummy.matrix)
      LEG_OFFSETS.forEach(([x, z], k) => {
        dummy.position.set(position[0] + x, 0.22, position[2] + z)
        dummy.updateMatrix()
        legs.current.setMatrixAt(i * 4 + k, dummy.matrix)
      })
    })
    seat.current.instanceMatrix.needsUpdate = true
    back.current.instanceMatrix.needsUpdate = true
    legs.current.instanceMatrix.needsUpdate = true
  }, [spots])

  return (
    <>
      <instancedMesh key={`s${spots.length}`} ref={seat} args={[seatGeometry, undefined, spots.length]} castShadow>
        <meshStandardMaterial color={color} roughness={0.7} />
      </instancedMesh>
      <instancedMesh key={`b${spots.length}`} ref={back} args={[backGeometry, undefined, spots.length]} castShadow>
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.32} />
      </instancedMesh>
      <instancedMesh key={`l${spots.length}`} ref={legs} args={[legGeometry, undefined, spots.length * 4]} castShadow>
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.32} />
      </instancedMesh>
    </>
  )
}

function Sofa({ position, rotationY = 0, color }) {
  const seat = useMemo(() => new RoundedBoxGeometry(2, 0.42, 0.9, 3, 0.1), [])
  const back = useMemo(() => new RoundedBoxGeometry(2, 0.7, 0.26, 3, 0.1), [])
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={seat} position={[0, 0.26, 0]} castShadow><meshStandardMaterial color={color} roughness={0.8} /></mesh>
      <mesh geometry={back} position={[0, 0.65, -0.34]} castShadow><meshStandardMaterial color={color} roughness={0.8} /></mesh>
    </group>
  )
}

function PetalAisle({ palette, density }) {
  const ref = useRef()
  const count = Math.round(260 * density)
  const geometry = useMemo(() => new THREE.CircleGeometry(0.06, 6), [])
  useLayoutEffect(() => {
    const rand = seeded(3)
    const color = new THREE.Color()
    for (let i = 0; i < count; i += 1) {
      dummy.position.set((rand() - 0.5) * 1.9, 0.012 + rand() * 0.01, 4.8 - rand() * 8.6)
      dummy.rotation.set(-Math.PI / 2, 0, rand() * 6.28)
      dummy.scale.setScalar(0.7 + rand() * 0.9)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
      ref.current.setColorAt(i, color.set(palette.floral[i % palette.floral.length]))
    }
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor.needsUpdate = true
  }, [count, palette])
  return (
    <instancedMesh key={count} ref={ref} args={[geometry, undefined, count]}>
      <meshStandardMaterial roughness={0.7} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

function HaloCeremony({ palette, density, glow }) {
  const bouquet = useMemo(() => {
    const anchors = []
    for (let i = 0; i <= 14; i += 1) {
      const a = Math.PI - (i / 14) * Math.PI
      anchors.push([Math.cos(a) * 2.2, 3.05 + Math.sin(a) * 2.2, -3.75])
    }
    for (const side of [-1, 1]) for (let i = 0; i < 6; i += 1) anchors.push([side * 2.2, 0.3 + i * 0.5, -3.75])
    return arrangeBouquet(anchors, { colors: palette.floral, density, seed: 19, spread: 0.34, size: 0.17 })
  }, [palette, density])

  const chairs = useMemo(() => {
    const spots = []
    for (const side of [-1, 1]) {
      for (let row = 0; row < 5; row += 1) {
        for (let seat = 0; seat < 3; seat += 1) {
          spots.push({ position: [side * (1.45 + seat * 0.72), 0, 3.8 - row * 1.3], rotation: Math.PI })
        }
      }
    }
    return spots
  }, [])

  return (
    <>
      <Arch w={4.4} h={5.3} thickness={0.2} depth={0.2} color={palette.primary} position={[0, 0, -4]} />
      <Arch w={3.5} h={4.6} thickness={0.1} depth={0.12} color={palette.secondary} position={[0, 0, -4.6]} />
      <Arch w={4.5} h={5.35} thickness={0.04} depth={0.28} metal position={[0, 0, -4.04]} />
      <Flowers roses={bouquet.roses} leaves={bouquet.leaves} />
      <mesh position={[0, 0.006, 0.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2, 9]} />
        <meshStandardMaterial color="#F7EDE0" roughness={0.9} />
      </mesh>
      <PetalAisle palette={palette} density={density} />
      <Chairs spots={chairs} color={palette.primary} />
      <Candles glow={glow} spots={[[-1.2, 0, -3.3, 0.5], [-1.05, 0, -3.05, 0.3], [1.2, 0, -3.3, 0.5], [1.05, 0, -3.05, 0.3], [-1.15, 0, 1, 0.35], [1.15, 0, 1, 0.35], [-1.15, 0, 3.4, 0.35], [1.15, 0, 3.4, 0.35]]} />
    </>
  )
}

function Pergola({ palette, density, glow }) {
  const wood = palette.id === 'emerald' || palette.id === 'royal' ? palette.primary : '#44291A'
  const posts = [[-4, -3], [4, -3], [-4, 3], [4, 3]]
  const slats = useMemo(() => Array.from({ length: 13 }, (_, i) => -3 + i * 0.5), [])
  const bouquet = useMemo(() => {
    const anchors = []
    for (let i = 0; i <= 12; i += 1) anchors.push([-3.8 + (i / 12) * 7.6, 3.75 + Math.sin(i) * 0.08, 3 - (i % 3) * 0.1])
    for (let i = 0; i <= 12; i += 1) anchors.push([-3.8 + (i / 12) * 7.6, 3.75, -3])
    for (const x of [-3.7, 3.7]) for (let i = 0; i < 4; i += 1) anchors.push([x, 0.35 + i * 0.5, -2.7])
    return arrangeBouquet(anchors, { colors: palette.floral, density, seed: 29, spread: 0.34, size: 0.15 })
  }, [palette, density])

  return (
    <>
      {posts.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 2, z]} castShadow><boxGeometry args={[0.3, 4, 0.3]} /><meshStandardMaterial color={wood} roughness={0.6} /></mesh>
      ))}
      {[-3, 3].map((z) => <mesh key={z} position={[0, 4, z]} castShadow><boxGeometry args={[8.6, 0.28, 0.24]} /><meshStandardMaterial color={wood} roughness={0.6} /></mesh>)}
      {[-4, 4].map((x) => <mesh key={x} position={[x, 4, 0]} castShadow><boxGeometry args={[0.24, 0.28, 6.4]} /><meshStandardMaterial color={wood} roughness={0.6} /></mesh>)}
      {slats.map((z) => <mesh key={z} position={[0, 4.14, z]} castShadow><boxGeometry args={[8.4, 0.08, 0.14]} /><meshStandardMaterial color={wood} roughness={0.6} /></mesh>)}
      {[[-3.55, -3], [-2.7, -3], [2.7, -3], [3.55, -3], [-3.6, 3], [3.6, 3]].map(([x, z]) => <Drape key={`${x}${z}`} position={[x, 2, z]} width={0.9} />)}
      {[[-2.4, 3.92, -1.2], [0, 3.92, -1.8], [2.4, 3.92, -1.2], [-1.4, 3.92, 1.2], [1.4, 3.92, 1.2]].map((p) => <Lantern key={p.join()} position={p} glow={glow} />)}
      <Arch w={2.6} h={3.3} thickness={0.14} depth={0.16} color={palette.primary} position={[0, 0, -2.9]} />
      <Arch w={2.68} h={3.34} thickness={0.03} depth={0.22} metal position={[0, 0, -2.92]} />
      <Sofa position={[-2.3, 0, -0.1]} rotationY={0.6} color="#F3E7D7" />
      <Sofa position={[2.3, 0, -0.1]} rotationY={-0.6} color="#F3E7D7" />
      <Sofa position={[0, 0, -2]} color={palette.primary} />
      {[[-1, 0.8], [1, 0.8], [0, 0.2]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.22, z]} castShadow><cylinderGeometry args={[0.36, 0.38, 0.44, 24]} /><meshStandardMaterial color={palette.secondary === GOLD ? '#5A3522' : palette.secondary} roughness={0.72} /></mesh>
      ))}
      <Flowers roses={bouquet.roses} leaves={bouquet.leaves} />
      <Candles glow={glow} spots={[[-3.2, 0, -2.2, 0.55], [-3, 0, -1.95, 0.32], [3.2, 0, -2.2, 0.55], [3, 0, -1.95, 0.32]]} />
    </>
  )
}

function Reception({ palette, density, glow }) {
  const chairs = useMemo(() => {
    const spots = []
    for (let i = 0; i < 7; i += 1) {
      const x = -3 + i
      spots.push({ position: [x, 0, 1.05], rotation: Math.PI }, { position: [x, 0, -1.05], rotation: 0 })
    }
    return spots
  }, [])
  const bouquet = useMemo(() => {
    const anchors = []
    for (let i = 0; i < 8; i += 1) {
      if (i === 3 || i === 4) continue
      anchors.push([-3.3 + i * 0.95, 0.98, 0])
    }
    return arrangeBouquet(anchors, { colors: palette.floral, density, seed: 31, spread: 0.24, size: 0.09 })
  }, [palette, density])

  return (
    <>
      <mesh position={[0, 0.76, 0]} castShadow receiveShadow><boxGeometry args={[8, 0.06, 1.5]} /><meshPhysicalMaterial color="#F7EDE0" roughness={0.25} clearcoat={0.7} /></mesh>
      {[-3.6, 3.6].map((x) => <mesh key={x} position={[x, 0.37, 0]}><boxGeometry args={[0.1, 0.74, 1.2]} /><meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} /></mesh>)}
      <mesh position={[0, 0.795, 0]}><boxGeometry args={[8.05, 0.01, 0.5]} /><meshStandardMaterial color={palette.primary} roughness={0.5} /></mesh>
      <Chairs spots={chairs} color={palette.primary} />
      <Flowers roses={bouquet.roses} leaves={bouquet.leaves} />
      <Candles glow={glow} spots={[[-2.6, 0.8, 0.42, 0.28], [-1.6, 0.8, -0.42, 0.38], [1.6, 0.8, 0.42, 0.38], [2.6, 0.8, -0.42, 0.28]]} />
      <Arch w={3.6} h={4.4} thickness={0.2} depth={0.2} color={palette.primary} position={[-4.1, 0, -3]} />
      <Arch w={3.6} h={4.4} thickness={0.2} depth={0.2} color={palette.primary} position={[4.1, 0, -3]} />
      <Arch w={4.6} h={5.4} thickness={0.22} depth={0.2} color={palette.primary} position={[0, 0, -3.2]} />
      <Arch w={4.7} h={5.45} thickness={0.04} depth={0.26} metal position={[0, 0, -3.23]} />
    </>
  )
}

const SETTINGS = { halo: HaloCeremony, pergola: Pergola, reception: Reception }
const TRAY_SPOT = {
  halo: { position: [3.4, 0.9, -2.6], scale: 0.17 },
  pergola: { position: [0, 0.9, -2.72], scale: 0 },
  reception: { position: [0, 0.8, 0], scale: 0.13 },
}

function CameraRig({ setting, controls }) {
  const { camera, size, invalidate } = useThree()
  const moving = useRef(false)
  const position = useMemo(() => new THREE.Vector3(), [])
  const target = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    const preset = CAMERAS[setting]
    const pull = size.width / size.height < 0.9 ? 1.12 : 1
    position.set(...preset.position).multiplyScalar(pull)
    target.set(...preset.target)
    moving.current = true
    invalidate()
  }, [setting, position, target, size.width, size.height, invalidate])

  useFrame((_, delta) => {
    if (!moving.current || !controls.current) return
    camera.position.lerp(position, 1 - Math.exp(-3 * delta))
    controls.current.target.lerp(target, 1 - Math.exp(-3 * delta))
    controls.current.update()
    if (camera.position.distanceTo(position) < 0.04) moving.current = false
    else invalidate()
  })
  return null
}

function World({ concept, quality }) {
  const controls = useRef()
  const mood = MOODS[concept.mood]
  const palette = studio.palettes.find((p) => p.id === concept.palette)
  const floral = studio.florals.find((f) => f.id === concept.floral)
  const density = floral.density * quality.roses
  const Setting = SETTINGS[concept.setting]
  const spot = TRAY_SPOT[concept.setting]
  const showTray = concept.tray && spot.scale > 0
  const trayPalette = useMemo(() => ({ primary: palette.primary, secondary: '#3A2115', floral: palette.floral }), [palette])

  return (
    <>
      <Sky mood={mood} />
      <StudioLight intensity={mood.env} warmth={mood.sun} />
      <directionalLight position={[7, 9, 6]} intensity={mood.sunIntensity} color={mood.sun} castShadow={!quality.low} shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-0.0004} />
      {concept.mood === 'evening' ? <pointLight position={[0, 3.2, 0]} intensity={26} distance={16} color="#FFB36B" decay={1.5} /> : null}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[40, 48]} />
        <meshStandardMaterial color={mood.floor} roughness={0.42} metalness={0.05} />
      </mesh>
      <Setting palette={palette} density={density} glow={mood.glow} />
      {showTray ? (
        <>
          {concept.setting === 'halo' ? (
            <mesh position={[3.4, 0.45, -2.6]} castShadow><cylinderGeometry args={[0.6, 0.66, 0.9, 32]} /><meshPhysicalMaterial color="#F7EDE0" roughness={0.3} clearcoat={0.5} /></mesh>
          ) : null}
          <HaloTray position={spot.position} scale={spot.scale} palette={trayPalette} backPanel floralDensity={0.5} />
        </>
      ) : null}
      <OrbitControls
        ref={controls}
        enablePan={false}
        minDistance={4}
        maxDistance={24}
        minPolarAngle={0.55}
        maxPolarAngle={Math.PI / 2 - 0.04}
        enableDamping
        dampingFactor={0.08}
      />
      <CameraRig setting={concept.setting} controls={controls} />
    </>
  )
}

/**
 * The 3D Event Studio's set. It renders on demand: the set is still until someone
 * changes a choice or moves the camera, so idle frames would only burn battery.
 * `onCanvas` hands the canvas up for image export.
 */
export default function EventScene({ concept, active, onCanvas }) {
  const quality = useMemo(getQuality, [])
  return (
    <Canvas
      frameloop={active ? 'demand' : 'never'}
      dpr={quality.dpr}
      shadows={quality.low ? false : 'percentage'}
      gl={{ antialias: quality.antialias, preserveDrawingBuffer: true }}
      camera={{ fov: 36, near: 0.1, far: 130, position: CAMERAS.halo.position }}
      onCreated={({ gl }) => onCanvas?.(gl.domElement)}
    >
      <World concept={concept} quality={quality} />
    </Canvas>
  )
}
