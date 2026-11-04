import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { getQuality } from '../quality'
import { StudioLight } from '../StudioLight'
import { HaloTray } from '../models/HaloTray'
import { circleRing, SoftShadow } from '../models/SoftShadow'

const VIEWS = {
  front: new THREE.Vector3(0, 3.6, 15),
  side: new THREE.Vector3(14.5, 3.6, 4),
  back: new THREE.Vector3(0, 3.6, -15),
}
const FOCUS = new THREE.Vector3(0, 2.5, -0.4)
const TRAY_FOOTPRINT = circleRing(3.1)

/** Glides to the chosen view, then hands the camera back to the visitor. */
function ViewRig({ view, controls }) {
  const { camera, size, invalidate } = useThree()
  const moving = useRef(false)
  const destination = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    destination.copy(VIEWS[view]).multiplyScalar(size.width < size.height ? 1.45 : 1)
    moving.current = true
    invalidate()
  }, [view, destination, size.width, size.height, invalidate])

  useFrame((_, delta) => {
    if (!moving.current) return
    camera.position.x = THREE.MathUtils.damp(camera.position.x, destination.x, 3.4, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, destination.y, 3.4, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, destination.z, 3.4, delta)
    controls.current?.update()
    if (camera.position.distanceTo(destination) < 0.05) moving.current = false
    else invalidate()
  })
  return null
}

export default function HaloViewer({ view, active }) {
  const quality = useMemo(getQuality, [])
  const controls = useRef()
  return (
    <Canvas
      frameloop={active ? 'demand' : 'never'}
      dpr={quality.dpr}
      shadows={quality.low ? false : 'percentage'}
      gl={{ alpha: true, antialias: quality.antialias }}
      camera={{ fov: 30, near: 0.5, far: 80, position: [0, 3.6, 15] }}
    >
      <StudioLight />
      <directionalLight position={[5, 9, 7]} intensity={1.6} color="#FFE3C2" castShadow={!quality.low} shadow-mapSize={[1024, 1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={8} shadow-camera-bottom={-4} shadow-bias={-0.0004} />
      <HaloTray backPanel floralDensity={quality.roses} />
      <SoftShadow ring={TRAY_FOOTPRINT} opacity={0.42} />
      <OrbitControls
        ref={controls}
        target={FOCUS.toArray()}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.9}
        maxPolarAngle={Math.PI / 2 - 0.02}
        enableDamping
        dampingFactor={0.08}
      />
      <ViewRig view={view} controls={controls} />
    </Canvas>
  )
}
