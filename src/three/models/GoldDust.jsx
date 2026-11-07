import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { seeded } from './geometry'

const vertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixel;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.22 + aSeed * 6.28) * 0.5;
    p.x += cos(uTime * 0.17 + aSeed * 12.0) * 0.35;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    vTwinkle = 0.45 + 0.55 * sin(uTime * (0.6 + aSeed * 1.6) + aSeed * 40.0);
    gl_PointSize = uPixel * (0.6 + aSeed * 1.6) * (22.0 / max(-view.z, 0.5));
    gl_Position = projectionMatrix * view;
  }
`

const fragment = /* glsl */ `
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    vec3 gold = mix(vec3(0.83, 0.63, 0.37), vec3(1.0, 0.9, 0.68), core * vTwinkle);
    gl_FragColor = vec4(gold, core * core * vTwinkle * uOpacity);
  }
`

/** Gold dust hanging in the air, drawn as one point cloud. */
export function GoldDust({ count, zRange = [-52, 6], radius = 13, opacityRef }) {
  const material = useRef()
  const geometry = useMemo(() => {
    const rand = seeded(5)
    const position = new Float32Array(count * 3)
    const seedAttr = new Float32Array(count)
    for (let i = 0; i < count; i += 1) {
      const a = rand() * Math.PI * 2
      const r = Math.sqrt(rand()) * radius
      position.set([Math.cos(a) * r, 2.4 + Math.sin(a) * r * 0.7, zRange[0] + rand() * (zRange[1] - zRange[0])], i * 3)
      seedAttr[i] = rand()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(position, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seedAttr, 1))
    return g
  }, [count, radius, zRange])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixel: { value: Math.min(window.devicePixelRatio, 2) },
    uOpacity: { value: 1 },
  }), [])

  useFrame((state) => {
    // Written through the material: R3F copies the uniforms object it is given.
    const u = material.current.uniforms
    u.uTime.value = state.clock.elapsedTime
    if (opacityRef) u.uOpacity.value = opacityRef.current
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
