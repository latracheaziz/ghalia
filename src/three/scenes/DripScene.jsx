import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from '../../animations/gsap'
import { prefersReducedMotion } from '../../utils/env'

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

// Chocolate running off a whisk. One signed-distance field holds the pool, the strands,
// the drops and the puddle, so drops stretch out of the strands the way liquid does.
// Shading is built the way a photograph of it would be lit: a rounded liquid profile,
// reflections of a studio's softboxes, warm light through the thin edges, a puddle that
// rings where each drop lands, soft contact shadows, bokeh behind, and a little grain.
const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uAspect;
  uniform float uIntro;
  uniform vec2 uMouse;
  varying vec2 vUv;

  const float PUDDLE = 0.05;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
  }
  float seg(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
  }
  float poolEdge(float x) {
    return mix(1.14, 0.935, uIntro) + 0.010 * sin(x * 7.0 + uTime * 0.18) + 0.006 * sin(x * 19.0 - uTime * 0.13);
  }
  // Where in its fall each drop is: 0 as it leaves the strand, 1 as it reaches the puddle.
  float phase(float fk) {
    return fract(uTime * (0.055 + 0.035 * hash(vec2(fk, 5.0))) + hash(vec2(fk, 3.0)));
  }
  float stand(float fk) { return ((fk + 0.5) / 8.0 + (hash(vec2(fk, 1.0)) - 0.5) * 0.06) * uAspect; }

  float map(vec2 p) {
    float edge = poolEdge(p.x);
    // The puddle is chocolate below its surface, so the field is negative there.
    float d = min(edge - p.y, p.y - (PUDDLE + 0.004 * sin(p.x * 11.0 + uTime * 0.4)));
    for (int k = 0; k < 8; k++) {
      float fk = float(k);
      float h2 = hash(vec2(fk, 2.0)), h3 = hash(vec2(fk, 3.0)), h4 = hash(vec2(fk, 4.0));
      float x0 = stand(fk);
      float run = (0.10 + 0.22 * h2 + 0.04 * sin(uTime * 0.22 + h3 * 6.28)) * smoothstep(0.0, 1.0, uIntro);
      float r = 0.011 + 0.009 * h4;
      vec2 tip = vec2(x0, edge - run);
      float strand = seg(p, vec2(x0, edge + 0.02), tip) - r * 0.5;
      float bulb = length(p - tip) - r * 1.5;
      d = smin(d, smin(strand, bulb, 0.02), 0.03);
      // A teardrop: a round head with a thin tail that lengthens as it speeds up.
      float ph = phase(fk);
      float fall = ph * ph;
      vec2 dp = vec2(x0, mix(tip.y, PUDDLE - 0.01, fall));
      float stretch = 0.012 + 0.05 * sin(ph * 3.14159);
      float head = length(p - dp) - r * 1.05;
      float tail = seg(p, dp + vec2(0.0, stretch * 0.25), dp + vec2(0.0, stretch)) - r * 0.42;
      d = smin(d, smin(head, tail, 0.02), 0.014);
    }
    return d;
  }

  // A rounded cross-section, so strands read as round and the pool's rim as a thick lip.
  float profile(float d) {
    float t = clamp(-d / 0.014, 0.0, 1.0);
    return sqrt(1.0 - (1.0 - t) * (1.0 - t));
  }

  // Ripples ringing outward along the puddle from each drop's impact.
  float ripple(vec2 p) {
    float sum = 0.0;
    for (int k = 0; k < 8; k++) {
      float fk = float(k);
      float age = phase(fk);
      float life = 1.0 - smoothstep(0.0, 0.22, age);
      float dist = abs(p.x - stand(fk));
      float radius = age * 0.6;
      sum += sin((dist - radius) * 150.0) * exp(-abs(dist - radius) * 30.0) * life * 0.5;
    }
    return sum;
  }

  // A small studio: a big softbox top left, a strip right, a warm floor, a dark room.
  vec3 studio(vec3 r) {
    vec3 c = mix(vec3(0.10, 0.055, 0.03), vec3(0.62, 0.48, 0.34), smoothstep(-0.3, 0.9, r.y));
    float box = smoothstep(0.55, 0.3, abs(r.x + 0.55)) * smoothstep(0.6, 0.32, abs(r.y - 0.4));
    float strip = smoothstep(0.2, 0.08, abs(r.x - 0.62)) * smoothstep(0.75, 0.45, abs(r.y - 0.05));
    float top = smoothstep(0.85, 0.95, r.y);
    return c + vec3(2.4, 2.0, 1.6) * box + vec3(1.2, 1.0, 0.8) * strip * 0.9 + vec3(1.3, 1.1, 0.9) * top * 0.4;
  }

  void main() {
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    p.x -= (uMouse.x - 0.5) * 0.03 * (1.0 - vUv.y);
    float d = map(p);
    float aa = max(fwidth(d), 1e-4);
    float mask = 1.0 - smoothstep(-aa, aa, d);

    // Backdrop: warm amber light falling away to deep caramel, with out-of-focus highlights.
    vec3 bg = mix(vec3(0.66, 0.44, 0.22), vec3(0.97, 0.88, 0.72), smoothstep(0.0, 1.0, vUv.y * 0.8 + 0.2));
    bg *= 0.78 + 0.34 * exp(-2.6 * length(vUv - vec2(0.64, 0.58)));
    for (int i = 0; i < 12; i++) {
      float fi = float(i);
      vec2 c = vec2(hash(vec2(fi, 7.0)) * uAspect, 0.15 + 0.7 * hash(vec2(fi, 8.0)));
      c += vec2(sin(uTime * 0.04 + fi), cos(uTime * 0.035 + fi * 2.0)) * 0.03;
      float rad = 0.022 + 0.05 * hash(vec2(fi, 9.0));
      bg += vec3(1.0, 0.84, 0.52) * smoothstep(rad, rad * 0.55, length(p - c)) * 0.055;
    }
    // Contact shadow: two soft taps toward the light, plus a darker core hugging each shape.
    float s1 = smoothstep(0.05, -0.02, map(p + vec2(-0.016, 0.026)));
    float s2 = smoothstep(0.11, -0.03, map(p + vec2(-0.04, 0.07)));
    bg = mix(bg, bg * vec3(0.50, 0.38, 0.28), clamp(s1 * 0.5 + s2 * 0.28, 0.0, 0.8));
    bg *= 1.0 - 0.18 * smoothstep(0.03, 0.0, d);

    // The surface normal comes from the slope of the rounded profile.
    float e = 0.0022;
    float hx = profile(map(p + vec2(e, 0.0))) - profile(map(p - vec2(e, 0.0)));
    float hy = profile(map(p + vec2(0.0, e))) - profile(map(p - vec2(0.0, e)));
    vec3 n = normalize(vec3(-vec2(hx, hy) / (2.0 * e) * 0.011, 1.0));
    // A slow swell on the pool, and the rings on the puddle.
    n.xy += (vec2(noise(p * 6.0 + uTime * 0.05), noise(p * 6.0 + 9.0 - uTime * 0.05)) - 0.5) * 0.05;
    if (p.y < PUDDLE + 0.05) n.x += ripple(p) * 0.18;
    n = normalize(n);

    vec3 V = normalize(vec3((0.5 - vUv) * vec2(0.5, 0.3), 1.0));
    vec3 R = reflect(-V, n);
    float fresnel = 0.06 + 0.94 * pow(1.0 - max(dot(n, V), 0.0), 5.0);
    vec3 L = normalize(vec3(-0.5, 0.6, 0.65));
    float diffuse = clamp(dot(n, L) * 0.75 + 0.25, 0.0, 1.0);

    vec3 base = vec3(0.115, 0.05, 0.025);
    vec3 choc = base * (0.4 + 0.95 * diffuse);
    // Light passing through the thin edges and tips glows a warm red-brown.
    float thin = exp(-(-d) / 0.0065);
    float backlight = dot(bg, vec3(0.3, 0.55, 0.15));
    choc += vec3(0.50, 0.18, 0.055) * thin * (0.2 + 0.6 * backlight);
    choc += studio(R) * (0.05 + fresnel * 1.25);
    choc += vec3(1.0, 0.86, 0.62) * pow(clamp(dot(n, normalize(L + V)), 0.0, 1.0), 140.0) * 0.55;

    vec3 col = mix(bg, choc, mask);
    // Lens: vignette and a little grain, so it does not look rendered.
    col *= 0.86 + 0.14 * smoothstep(1.3, 0.3, length(vUv - 0.5));
    col += (hash(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) * 0.028;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

function Drip({ pointer, still }) {
  const { size, invalidate } = useThree()
  const material = useRef()
  const uniforms = useMemo(() => ({
    uTime: { value: still ? 8 : 0 },
    uAspect: { value: 1 },
    uIntro: { value: still ? 1 : 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  }), [still])

  // The pool lowers and the strands run out when the page opens.
  useEffect(() => {
    if (still) return undefined
    // The material holds its own copy of the uniforms, so the tween has to drive that one.
    const tween = gsap.to(material.current.uniforms.uIntro, { value: 1, duration: 3.4, delay: 0.3, ease: 'power2.out' })
    return () => tween.kill()
  }, [still])

  useEffect(() => { invalidate() }, [size, invalidate])

  useFrame((state, delta) => {
    // Written through the material: R3F copies the uniforms object it is given.
    const u = material.current.uniforms
    if (!still) u.uTime.value = state.clock.elapsedTime + 8
    u.uAspect.value = size.width / size.height
    u.uMouse.value.x = THREE.MathUtils.damp(u.uMouse.value.x, pointer.current.x, 1.6, delta)
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} depthTest={false} />
    </mesh>
  )
}

/** Slow, photographic chocolate drips on warm studio light, drawn at the screen's full resolution. */
export default function DripScene({ active = true }) {
  const pointer = useRef({ x: 0.5 })
  const still = useMemo(prefersReducedMotion, [])

  useEffect(() => {
    if (still) return undefined
    const move = (e) => { pointer.current.x = e.clientX / window.innerWidth }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [still])

  return (
    <Canvas
      frameloop={!active ? 'never' : still ? 'demand' : 'always'}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <Drip pointer={pointer} still={still} />
    </Canvas>
  )
}
