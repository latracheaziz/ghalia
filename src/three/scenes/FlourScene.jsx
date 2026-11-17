import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { prefersReducedMotion } from '../../utils/env'
import { getQuality } from '../quality'
import { seeded } from '../models/geometry'

const vertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixel;
  uniform vec2 uMouse;
  uniform vec2 uShift;
  varying float vSeed;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    // Flour falls slowly and sways; each grain has its own speed.
    p.y = mod(p.y - uTime * (0.10 + aSeed * 0.2) + 4.5, 9.0) - 4.5;
    p.x += sin(uTime * 0.22 + aSeed * 20.0) * 0.4 + uShift.x * (p.z + 4.0) * 0.06;
    p.y += uShift.y * (p.z + 4.0) * 0.04;
    // The cursor parts the dust, like a hand passing through flour.
    vec2 d = p.xy - uMouse;
    p.xy += normalize(d + 1e-3) * exp(-dot(d, d) * 0.3) * 1.1;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    vSeed = aSeed;
    vTwinkle = 0.55 + 0.45 * sin(uTime * (0.5 + aSeed * 1.3) + aSeed * 50.0);
    gl_PointSize = uPixel * (1.4 + aSeed * aSeed * 7.0) * (16.0 / max(-view.z, 0.5));
    gl_Position = projectionMatrix * view;
  }
`

const fragment = /* glsl */ `
  varying float vSeed;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float soft = smoothstep(0.5, 0.0, d);
    // Most grains are pale flour; the warmer ones are sugar turning to gold.
    vec3 flour = vec3(1.0, 0.95, 0.86);
    vec3 gold = vec3(0.92, 0.68, 0.34);
    vec3 col = mix(flour, gold, smoothstep(0.45, 0.8, vSeed));
    float big = smoothstep(0.7, 1.0, vSeed);
    float a = soft * soft * mix(0.7, 0.22, big) * (0.45 + 0.55 * vTwinkle);
    gl_FragColor = vec4(col, a);
  }
`

function Dust({ count, pointer, still }) {
  const material = useRef()
  const { viewport, invalidate } = useThree()
  const geometry = useMemo(() => {
    const rand = seeded(17)
    const position = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i += 1) {
      position.set([(rand() - 0.5) * 16, (rand() - 0.5) * 9, (rand() - 0.5) * 8], i * 3)
      seed[i] = rand()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(position, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [count])
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => { invalidate() }, [invalidate])

  const uniforms = useMemo(() => ({
    uTime: { value: still ? 30 : 0 },
    uPixel: { value: Math.min(window.devicePixelRatio, 2) },
    uMouse: { value: new THREE.Vector2(99, 99) },
    uShift: { value: new THREE.Vector2() },
  }), [still])

  useFrame((state, delta) => {
    // Written through the material: R3F copies the uniforms object it is given.
    const u = material.current.uniforms
    if (!still) u.uTime.value = state.clock.elapsedTime + 30
    const target = pointer.current
    u.uMouse.value.x = THREE.MathUtils.damp(u.uMouse.value.x, target.active ? target.x * viewport.width * 0.5 : 99, 4, delta)
    u.uMouse.value.y = THREE.MathUtils.damp(u.uMouse.value.y, target.active ? target.y * viewport.height * 0.5 : 99, 4, delta)
    u.uShift.value.x = THREE.MathUtils.damp(u.uShift.value.x, target.x, 2, delta)
    u.uShift.value.y = THREE.MathUtils.damp(u.uShift.value.y, target.y, 2, delta)
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/** Flour and gold dust drifting through a dark room, parted by the cursor. */
export default function FlourScene({ active = true }) {
  const quality = useMemo(getQuality, [])
  const still = useMemo(prefersReducedMotion, [])
  const pointer = useRef({ x: 0, y: 0, active: false })

  useEffect(() => {
    if (still) return undefined
    const move = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = 1 - (e.clientY / window.innerHeight) * 2
      pointer.current.active = true
    }
    const leave = () => { pointer.current.active = false }
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [still])

  return (
    <Canvas
      frameloop={!active ? 'never' : still ? 'demand' : 'always'}
      dpr={quality.dpr}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      camera={{ fov: 40, near: 0.1, far: 40, position: [0, 0, 10] }}
      aria-hidden="true"
    >
      <Dust count={quality.low ? 120 : 340} pointer={pointer} still={still} />
    </Canvas>
  )
}
