import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

// Domain-warped folds, lit from their own slope, read as draped satin.
const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uMouse;
  uniform vec3 uLight;
  uniform vec3 uDark;
  uniform vec3 uSheen;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.0; a *= 0.5; }
    return v;
  }
  float folds(vec2 p) {
    float t = uTime * 0.05;
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p + 2.6 * q + vec2(1.7, 9.2) + t), fbm(p + 2.6 * q + vec2(8.3, 2.8)));
    return fbm(p + 2.2 * r);
  }
  void main() {
    vec2 p = vec2(vUv.x * uAspect, vUv.y) * 1.25;
    float pull = exp(-6.0 * distance(vec2(vUv.x * uAspect, vUv.y), vec2(uMouse.x * uAspect, uMouse.y)));
    p += (uMouse - vUv) * pull * 0.2;
    float e = 0.012;
    float h = folds(p);
    vec2 slope = vec2(folds(p + vec2(e, 0.0)) - h, folds(p + vec2(0.0, e)) - h) / e;
    vec3 n = normalize(vec3(-slope * 0.34, 1.0));
    float diffuse = clamp(dot(n, normalize(vec3(-0.45, 0.55, 0.7))), 0.0, 1.0);
    float spec = pow(clamp(dot(n, normalize(vec3(-0.2, 0.35, 0.92))), 0.0, 1.0), 26.0);
    vec3 color = mix(uDark, uLight, smoothstep(0.25, 0.95, diffuse));
    color += uSheen * spec * (0.1 + 0.34 * dot(uLight, vec3(0.3, 0.6, 0.1)));
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

function Silk({ colors, pointer }) {
  const { size } = useThree()
  const material = useRef()
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uLight: { value: new THREE.Color() },
    uDark: { value: new THREE.Color() },
    uSheen: { value: new THREE.Color('#FFE2B4') },
  }), [])

  useEffect(() => {
    const u = material.current.uniforms
    u.uLight.value.set(colors[0])
    u.uDark.value.set(colors[1])
  }, [colors])

  useFrame((state, delta) => {
    // Written through the material: R3F copies the uniforms object it is given.
    const u = material.current.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uAspect.value = size.width / size.height
    const m = u.uMouse.value
    m.x = THREE.MathUtils.damp(m.x, pointer.current.x, 3, delta)
    m.y = THREE.MathUtils.damp(m.y, pointer.current.y, 3, delta)
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} depthTest={false} />
    </mesh>
  )
}

/** Living satin used behind page openings, tinted per collection. */
export default function SilkScene({ colors, active = true }) {
  const pointer = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const move = (e) => {
      pointer.current.x = e.clientX / window.innerWidth
      pointer.current.y = 1 - e.clientY / window.innerHeight
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[0.75, 1]}
      gl={{ antialias: false, powerPreference: 'low-power' }}
      aria-hidden="true"
    >
      <Silk colors={colors} pointer={pointer} />
    </Canvas>
  )
}
