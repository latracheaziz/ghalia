import { Environment, Lightformer } from '@react-three/drei'

/** A softbox studio built from light shapes: reflections with no HDR file to download. */
export function StudioLight({ intensity = 1, warmth = '#FFE9CF', fill, children }) {
  return (
    <Environment resolution={128} frames={1} environmentIntensity={intensity}>
      {/* Metal shows its surroundings, so foil needs a room to reflect, not a black void. */}
      {fill ? <color attach="background" args={[fill]} /> : null}
      <Lightformer form="rect" intensity={3.2} color={warmth} position={[0, 7, 3]} rotation={[Math.PI / 2, 0, 0]} scale={[14, 8, 1]} />
      <Lightformer form="rect" intensity={1.6} color="#FFD9B0" position={[-8, 3, 3]} rotation={[0, Math.PI / 2, 0]} scale={[9, 6, 1]} />
      <Lightformer form="rect" intensity={1.1} color="#FFF2E2" position={[8, 3, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[9, 6, 1]} />
      <Lightformer form="ring" intensity={1.4} color="#FFC98A" position={[0, 2, -9]} scale={7} />
      <Lightformer form="rect" intensity={0.5} color="#C98E5A" position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[16, 16, 1]} />
      {children}
    </Environment>
  )
}
