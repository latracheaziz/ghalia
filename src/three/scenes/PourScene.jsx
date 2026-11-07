import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { getQuality } from '../quality'
import { StudioLight } from '../StudioLight'
import { GoldDust } from '../models/GoldDust'
import { emblemGeometry } from '../models/emblem'
import { GLYPHS } from '../../components/brand/SocialIcon'
import { pourPhase } from '../../utils/pour'

const DUST_DEPTH = [-5, 2.5]
const PRALINE = { width: 2, height: 0.78, radius: 0.2 }

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

// A sheet of molten chocolate, drawn over the whole screen. Its top edge rises
// as a slow wave; once the screen is covered it lifts away, drips hanging from it.
const fragment = /* glsl */ `
  uniform float uWave;
  uniform float uTime;
  uniform vec2 uRes;
  varying vec2 vUv;

  float hash1(float n) { return fract(sin(n * 12.9898) * 43758.5453); }
  float hash2(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), u.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  // Smooth union, so each drip flows out of the sheet instead of meeting it at a corner.
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    float aspect = uRes.x / uRes.y;
    float x = vUv.x * aspect;
    float y = vUv.y;
    float rise = smoothstep(0.0, 0.5, uWave);
    float leave = smoothstep(0.5, 1.0, uWave);

    float surface = sin(x * 3.1 + uTime * 1.3) * 0.035 + sin(x * 7.3 - uTime * 1.9) * 0.018 + (fbm(vec2(x * 2.0, uTime * 0.4)) - 0.5) * 0.07;
    float top = mix(-0.3, 1.4, rise) + surface;

    // The sheet's lower edge, and a rounded drip hanging from it in every column,
    // each its own width, length and place, stretching as the sheet lifts away.
    float base = mix(-0.75, 1.95, leave) + sin(x * 5.0 + uTime * 0.8) * 0.008;
    float cell = 0.085;
    float id = floor(x / cell);
    float r = cell * (0.16 + 0.16 * hash1(id + 3.0));
    float cx = (id + 0.5 + (hash1(id + 7.0) - 0.5) * max(0.0, 1.0 - 2.7 * r / cell)) * cell;
    float len = (0.03 + 0.26 * hash1(id + 11.0)) * (0.3 + leave * 1.3);
    float tipY = base - len;
    float py = clamp(y, tipY, base);
    float bulb = 1.0 + 0.35 * smoothstep(base - len * 0.6, tipY, y);
    float dDrip = length(vec2(x - cx, y - py)) - r * bulb;
    float d = smin(base - y, dDrip, 0.03);

    float edge = 1.5 / uRes.y;
    float cover = smoothstep(edge, -edge, d) * (1.0 - smoothstep(top - edge, top + edge, y));
    if (cover <= 0.0) discard;

    vec3 dark = vec3(0.13, 0.055, 0.025);
    vec3 mid = vec3(0.33, 0.16, 0.07);
    vec3 light = vec3(0.62, 0.36, 0.19);
    vec3 shine = vec3(0.98, 0.83, 0.62);

    float flow = fbm(vec2(x * 2.6, y * 2.2 - uTime * 0.5));
    vec3 color = mix(dark, mid, smoothstep(0.25, 0.85, flow));
    // The molten surface catches the light along the rising edge…
    color = mix(color, light, smoothstep(0.12, 0.0, top - y) * 0.75);
    color += shine * smoothstep(0.018, 0.0, abs(top - 0.012 - y)) * 0.55;
    // …long glossy streaks run through it…
    float streak = fbm(vec2(x * 5.0 + sin(y * 3.4 + uTime * 0.7) * 0.45, y * 1.6 - uTime * 0.9));
    color += shine * pow(smoothstep(0.58, 0.92, streak), 3.0) * 0.32;
    // …and each drip has a lit rim and a glint on its bulb.
    color += light * smoothstep(0.03, 0.0, -d) * 0.5;
    color += shine * smoothstep(r * 0.55, 0.0, length(vec2(x - cx + r * 0.35, y - tipY - r * 0.25))) * 0.45;

    gl_FragColor = vec4(color, cover);
  }
`

function ChocolateSheet({ state, last }) {
  const mesh = useRef()
  const material = useRef()
  const uniforms = useMemo(() => ({ uWave: { value: 0 }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } }), [])
  useFrame((frame) => {
    const { wave } = pourPhase(state.current.raw, last)
    // Written through the material: R3F copies the uniforms object it is given.
    const u = material.current.uniforms
    u.uWave.value = wave
    u.uTime.value = frame.clock.elapsedTime
    u.uRes.value.set(frame.size.width, frame.size.height)
    mesh.current.visible = wave > 0 && wave < 1
  })
  return (
    <mesh ref={mesh} renderOrder={10} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

/** A glossy praline with the account's mark pressed into its top in gold. */
function Praline({ ids, tones, state }) {
  const place = useRef()
  const spin = useRef()
  const emblem = useRef()
  const shell = useRef()
  const pointer = useRef(new THREE.Vector2())
  const tone = useMemo(() => new THREE.Color(), [])
  const box = useMemo(() => new RoundedBoxGeometry(PRALINE.width, PRALINE.height, PRALINE.width, 5, PRALINE.radius), [])
  const emblems = useMemo(() => ids.map((id) => emblemGeometry(GLYPHS[id], 1.3)), [ids])
  useEffect(() => () => { box.dispose(); emblems.forEach((g) => g.dispose()) }, [box, emblems])
  const last = ids.length - 1

  useFrame((frame, delta) => {
    const s = state.current
    const { from, wave, shown } = pourPhase(s.raw, last)
    const t = frame.clock.elapsedTime

    // It sinks into the chocolate as the pour rises, and comes back up restruck.
    const dip = Math.sin(Math.PI * wave)
    const { width: vw, height: vh } = frame.viewport
    const tall = frame.size.width / frame.size.height < 0.9
    const fit = tall ? Math.min(vw * 0.56, vh * 0.32) : Math.min(vh * 0.5, vw * 0.3)
    place.current.scale.setScalar((fit / 2.7) * (1 - dip * 0.35))
    place.current.position.set(0, (tall ? vh * 0.02 : -vh * 0.1) - dip * vh * 0.18 + Math.sin(t * 0.9) * 0.04, 0)

    pointer.current.x = THREE.MathUtils.damp(pointer.current.x, s.mouseX, 2.5, delta)
    pointer.current.y = THREE.MathUtils.damp(pointer.current.y, s.mouseY, 2.5, delta)
    place.current.rotation.set(0.95 - pointer.current.y * 0.18, pointer.current.x * 0.3, Math.sin(t * 0.5) * 0.04)
    // A full turn per pour, so the mark settles upright for each account; a gentle sway at rest.
    spin.current.rotation.y = Math.sin(t * 0.45) * 0.3 + (from + THREE.MathUtils.smootherstep(wave, 0, 1)) * Math.PI * 2

    emblem.current.geometry = emblems[shown]
    shell.current.color.lerp(tone.set(tones[shown % tones.length]), 1 - Math.exp(-delta * 10))
  })

  return (
    <group ref={place}>
      <group ref={spin}>
        <mesh geometry={box}>
          <meshPhysicalMaterial ref={shell} color={tones[0]} roughness={0.38} clearcoat={0.9} clearcoatRoughness={0.16} />
        </mesh>
        <mesh ref={emblem} geometry={emblems[0]} rotation-x={-Math.PI / 2} position-y={PRALINE.height / 2 - 0.02}>
          <meshPhysicalMaterial color="#D9A55A" metalness={1} roughness={0.26} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}

/** `state` is a ref written by ScrollTrigger, so scrolling never re-renders React. */
export default function PourScene({ ids, tones, state, active }) {
  const quality = useMemo(getQuality, [])
  return (
    <Canvas
      className="pour__canvas"
      frameloop={active ? 'always' : 'never'}
      dpr={quality.dpr}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 0.1, far: 40, position: [0, 0, 7.4] }}
      aria-hidden="true"
    >
      {/* A face-on praline mirrors what is behind the viewer, so the studio gets a front wall. */}
      <StudioLight intensity={1.1}>
        <Lightformer form="rect" intensity={2.2} color="#FFE2B8" position={[0, 6, 8]} scale={[9, 2.5, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#FFD29A" position={[-6, -2, 7]} rotation={[0, -0.6, 0]} scale={[6, 4, 1]} />
      </StudioLight>
      <directionalLight position={[3, 5, 5]} intensity={1.5} color="#FFE3C2" />
      <pointLight position={[-3.5, 1.5, -2.5]} color="#FFB868" intensity={14} distance={12} />
      <Praline ids={ids} tones={tones} state={state} />
      <group position-y={-2.4}>
        <GoldDust count={Math.round(quality.dust / 4)} zRange={DUST_DEPTH} radius={4.2} />
      </group>
      <ChocolateSheet state={state} last={ids.length - 1} />
    </Canvas>
  )
}
