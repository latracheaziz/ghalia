import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { prefersReducedMotion } from '../../utils/env'

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

// Poured chocolate: a domain-warped flow field gives the swirls, milk and caramel
// ribbons ride the same field, and its slope is lit like a glossy liquid surface.
const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uMouse;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 1.9 + 7.0; a *= 0.42; }
    return v;
  }
  // Returns the height of the liquid and, through flow, how much milk has mixed in.
  float liquid(vec2 p, out float flow) {
    float t = uTime * 0.022;
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 1.3), fbm(p + 3.0 * q + vec2(8.3, 2.8) - t));
    float f = fbm(p + 3.2 * r);
    flow = r.x * 0.6 + q.y * 0.4;
    return f;
  }
  void main() {
    vec2 uv = vec2(vUv.x * uAspect, vUv.y);
    vec2 m = vec2(uMouse.x * uAspect, uMouse.y);
    // The pointer drags the liquid towards it, like a spoon through the pour.
    float near = exp(-2.6 * distance(uv, m));
    vec2 p = uv * 0.9 + (m - uv) * near * 0.35;

    float flow;
    float h = liquid(p, flow);
    float e = 0.01;
    float fx, fy;
    vec2 slope = vec2(liquid(p + vec2(e, 0.0), fx) - h, liquid(p + vec2(0.0, e), fy) - h) / e;
    vec3 n = normalize(vec3(-slope * 0.3, 1.0));

    vec3 cocoa = vec3(0.075, 0.032, 0.016);
    vec3 dark = vec3(0.19, 0.085, 0.04);
    vec3 milk = vec3(0.50, 0.30, 0.17);
    vec3 caramel = vec3(0.80, 0.55, 0.29);
    vec3 cream = vec3(0.95, 0.84, 0.66);

    // Dark body, with milk and caramel streaks following the flow lines.
    float body = smoothstep(0.3, 0.62, h);
    vec3 col = mix(cocoa, dark, body);
    float streak = smoothstep(0.56, 0.8, flow + (h - 0.5) * 0.5);
    col = mix(col, milk, streak * 0.7);
    col = mix(col, caramel, smoothstep(0.78, 0.98, flow + (h - 0.5) * 0.6) * 0.55);
    // Thin cream ribbons where the milk is poured in.
    float ribbon = smoothstep(0.03, 0.0, abs(fract(flow * 5.0 + h * 1.5) - 0.5) - 0.44);
    col = mix(col, cream, ribbon * smoothstep(0.62, 0.9, flow) * 0.32);

    // Glossy light: a broad diffuse, a hard specular and a soft rim.
    vec3 L = normalize(vec3(-0.45, 0.6, 0.65));
    float diffuse = clamp(dot(n, L), 0.0, 1.0);
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    float spec = pow(clamp(dot(n, H), 0.0, 1.0), 70.0);
    float sheen = pow(clamp(dot(n, normalize(vec3(0.5, 0.2, 0.8))), 0.0, 1.0), 12.0);
    col *= 0.4 + 0.75 * diffuse;
    col += vec3(1.0, 0.86, 0.66) * pow(spec, 1.3) * 0.7 + vec3(0.9, 0.6, 0.35) * sheen * 0.08;

    // Slow vignette keeps the corners deep, so the title reads on top.
    float v = smoothstep(1.25, 0.25, length(vUv - 0.5));
    col *= 0.5 + 0.5 * v;
    // Deeper on the left and bottom, where the title sits.
    col *= 0.45 + 0.55 * smoothstep(0.0, 0.95, vUv.x * 0.8 + vUv.y * 0.55);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

function Pour({ pointer, still }) {
  const { size, invalidate } = useThree()
  const material = useRef()
  const uniforms = useMemo(() => ({
    uTime: { value: still ? 40 : 0 },
    uAspect: { value: 1 },
    uMouse: { value: new THREE.Vector2(0.62, 0.5) },
  }), [still])

  useEffect(() => { invalidate() }, [size, invalidate])

  useFrame((state, delta) => {
    // Written through the material: R3F copies the uniforms object it is given.
    const u = material.current.uniforms
    if (!still) u.uTime.value = state.clock.elapsedTime + 40
    u.uAspect.value = size.width / size.height
    const m = u.uMouse.value
    m.x = THREE.MathUtils.damp(m.x, pointer.current.x, 1.3, delta)
    m.y = THREE.MathUtils.damp(m.y, pointer.current.y, 1.3, delta)
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} depthTest={false} />
    </mesh>
  )
}

/** Slow, glossy liquid chocolate for a page opening. The pointer stirs it. */
export default function ChocolateScene({ active = true }) {
  const pointer = useRef({ x: 0.62, y: 0.5 })
  const still = useMemo(prefersReducedMotion, [])

  useEffect(() => {
    if (still) return undefined
    const move = (e) => {
      pointer.current.x = e.clientX / window.innerWidth
      pointer.current.y = 1 - e.clientY / window.innerHeight
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [still])

  return (
    <Canvas
      frameloop={!active ? 'never' : still ? 'demand' : 'always'}
      dpr={[0.75, 1.25]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <Pour pointer={pointer} still={still} />
    </Canvas>
  )
}
