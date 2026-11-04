import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from '../../animations/gsap'
import { prefersReducedMotion } from '../../utils/env'
import { getQuality } from '../quality'
import { StudioLight } from '../StudioLight'
import { BOXES, extentOf, ringOf } from '../configurator/boxes.js'
import { Product } from '../configurator/Product'

// Where the camera rests for each step. Azimuth and polar angle in radians.
const VIEWS = {
  collection: { azimuth: 0.55, polar: 1.08, zoom: 1 },
  format: { azimuth: -0.55, polar: 0.92, zoom: 1 },
  filling: { azimuth: 0.12, polar: 0.62, zoom: 0.9 },
  finish: { azimuth: 0.28, polar: 1.16, zoom: 1.02 },
  review: { azimuth: 0.62, polar: 1.04, zoom: 1.04 },
}

const FOV = 28

/** Fits the camera to everything on the table, including an open lid or a gift card. */
function frame(format, open, hasNote, aspect) {
  const box = BOXES[format]
  const edge = extentOf(ringOf(format, 0))
  let right = edge.x
  let back = -edge.z
  let front = edge.z
  let top = box.height + (box.bag ? 0.85 : 0.4)
  if (open && box.open === 'hinge') {
    top += edge.z * 1.9
    back -= 0.5
  }
  if (open && box.open === 'lift') right = edge.x * 3 + 0.5
  if (open && box.open === 'drawer') front += edge.z * 1.5
  if (hasNote) front += 1

  const radius = Math.hypot(right + edge.x, top, front - back) / 2
  return {
    distance: ((radius / Math.sin(THREE.MathUtils.degToRad(FOV / 2))) * 1.06) / Math.min(1, aspect * 0.92),
    target: new THREE.Vector3((right - edge.x) / 2, top * 0.44, (front + back) / 2),
  }
}

/** Moves the camera between step views, and yields the moment the visitor takes over. */
function CameraRig({ step, format, open, hasNote, viewKey, controls }) {
  const { camera, size, invalidate } = useThree()
  const tween = useRef(null)

  useEffect(() => {
    const orbit = controls.current
    if (!orbit) return undefined
    const view = VIEWS[step]
    const { distance, target } = frame(format, open, hasNote, size.width / size.height)
    const final = distance * view.zoom

    orbit.minDistance = distance * 0.42
    orbit.maxDistance = distance * 1.5

    const offset = camera.position.clone().sub(orbit.target)
    const now = new THREE.Spherical().setFromVector3(offset)
    const state = { azimuth: now.theta, polar: now.phi, radius: now.radius, x: orbit.target.x, y: orbit.target.y, z: orbit.target.z }
    const turn = ((view.azimuth - now.theta + Math.PI * 3) % (Math.PI * 2)) - Math.PI

    const place = () => {
      orbit.target.set(state.x, state.y, state.z)
      camera.position.setFromSpherical(new THREE.Spherical(state.radius, state.polar, state.azimuth)).add(orbit.target)
      orbit.update()
      invalidate()
    }

    tween.current?.kill()
    tween.current = gsap.to(state, {
      azimuth: now.theta + turn,
      polar: view.polar,
      radius: final,
      x: target.x,
      y: target.y,
      z: target.z,
      duration: prefersReducedMotion() ? 0 : 1.25,
      ease: 'power3.inOut',
      onUpdate: place,
      onComplete: place,
    })
    return () => tween.current?.kill()
  }, [camera, controls, format, hasNote, invalidate, open, size.height, size.width, step, viewKey])

  useEffect(() => {
    const orbit = controls.current
    if (!orbit) return undefined
    const yield_ = () => tween.current?.kill()
    orbit.addEventListener('start', yield_)
    return () => orbit.removeEventListener('start', yield_)
  }, [controls])

  return null
}

function Studio({ quality, config, step, open, viewKey, onToggle, onStatus }) {
  const controls = useRef()
  return (
    <>
      <StudioLight intensity={0.8} fill="#B99F85" />
      <directionalLight
        position={[-5.5, 9, -3.5]}
        intensity={1.15}
        color="#FFE6C8"
        castShadow={!quality.low}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.0002}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[26, 48]} />
        <shadowMaterial opacity={0.2} color="#4A2A1A" />
      </mesh>
      <Product config={config} open={open} onToggle={onToggle} quality={quality} onStatus={onStatus} />
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        rotateSpeed={0.7}
        zoomSpeed={0.7}
        minPolarAngle={0.12}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
      <CameraRig step={step} format={config.format} open={open} hasNote={Boolean(config.note.trim())} viewKey={viewKey} controls={controls} />
    </>
  )
}

/** The configurator's set. Rendered on demand: an untouched box draws nothing. */
export default function BoxScene({ active, config, step, open, viewKey, onToggle, onStatus }) {
  const quality = useMemo(getQuality, [])
  const created = useCallback(({ gl }) => {
    gl.localClippingEnabled = true
    if (new URLSearchParams(window.location.search).has('debug3d')) window.__ghaliaGl = gl
  }, [])

  return (
    <Canvas
      frameloop={active ? 'demand' : 'never'}
      dpr={quality.dpr}
      shadows={quality.low ? false : 'percentage'}
      gl={{ alpha: true, antialias: quality.antialias }}
      camera={{ fov: FOV, near: 0.5, far: 120, position: [8, 6, 16] }}
      onCreated={created}
    >
      <Studio quality={quality} config={config} step={step} open={open} viewKey={viewKey} onToggle={onToggle} onStatus={onStatus} />
    </Canvas>
  )
}
