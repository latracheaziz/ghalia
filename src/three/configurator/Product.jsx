import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from '../../animations/gsap'
import { prefersReducedMotion } from '../../utils/env'
import { BOXES, extentOf, ringOf } from './boxes.js'
import { applyPart, blendSpec, buildParts } from './loft.js'
import { dividers } from './packing.js'
import { ribbonGeometry } from './ribbon.js'
import { createSkin } from './skins.js'
import { Pieces } from './Pieces'
import { GiftCard } from './GiftCard'
import { SoftShadow } from '../models/SoftShadow'

const SURFACES = ['baseWall', 'baseRim', 'baseFloor', 'baseBottom', 'lidWall', 'lidTop', 'lidInner', 'lidCeiling', 'trim']
const speed = (seconds) => (prefersReducedMotion() ? 0 : seconds)

// Both sides cast shadow, or the shadow starts a sliver away from the box.
const printMaterial = () => new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: 1, bumpScale: 0.25, shadowSide: THREE.DoubleSide })

function dress(material, maps, skin) {
  material.map = maps.map
  material.metalnessMap = maps.mask
  material.roughnessMap = maps.mask
  material.bumpMap = maps.mask
  material.sheen = skin.velvet ? 1 : 0
  material.sheenRoughness = 0.55
  material.sheenColor.set(skin.velvet ?? '#000000')
  material.needsUpdate = true
}

/**
 * The gift box. Geometry, artwork, contents and ribbon all come from `config`,
 * and nothing here runs unless something is changing: every animation calls
 * invalidate() itself, so an untouched box costs no GPU work.
 */
export function Product({ config, open, onToggle, quality, onStatus }) {
  const { collection, format, filling, note } = config
  const { invalidate } = useThree()
  const root = useRef()
  const tray = useRef()
  const pivot = useRef()
  const lid = useRef()
  const ribbon = useRef()
  const handles = useRef()
  const state = useRef({ from: format, to: format, k: 1, open: 0, drop: 1, tie: 0, spin: 0 })
  const openRef = useRef(open)
  const skins = useRef(new Map())
  const [ready, setReady] = useState(false)
  const [settled, setSettled] = useState({ format, floorY: 0.5 })

  const geometries = useMemo(() => Object.fromEntries(SURFACES.map((name) => [name, new THREE.BufferGeometry()])), [])
  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 0), [])
  const materials = useMemo(() => ({
    lidTop: printMaterial(),
    lidWall: printMaterial(),
    base: printMaterial(),
    liner: new THREE.MeshPhysicalMaterial({ roughness: 0.46, sheen: 1, sheenRoughness: 0.35 }),
    gold: new THREE.MeshStandardMaterial({ color: '#E6BE78', metalness: 1, roughness: 0.3 }),
    ribbon: new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide, roughness: 0.46, sheen: 0.6, sheenRoughness: 0.4 }),
    tissue: new THREE.MeshStandardMaterial({ color: '#FBF4EA', roughness: 0.9, side: THREE.DoubleSide }),
  }), [])

  const applyPose = useCallback(() => {
    const s = state.current
    const box = BOXES[s.to]
    const spec = blendSpec(s.from, s.to, s.k)
    const edge = extentOf(spec.ring(0))
    const rest = spec.height - spec.lid
    const p = s.open
    if (!pivot.current) return

    pivot.current.position.set(0, rest + s.drop * 2.4, 0)
    pivot.current.rotation.set(0, 0, 0)
    lid.current.position.set(0, 0, 0)
    tray.current.position.set(0, 0, 0)

    if (box.open === 'hinge') {
      pivot.current.position.z = -edge.z
      lid.current.position.z = edge.z
      pivot.current.rotation.x = -p * 1.92
    } else if (box.open === 'lift') {
      // Up, across, and set down beside the box with its artwork showing.
      const rise = Math.min(p / 0.4, 1)
      const travel = Math.max((p - 0.3) / 0.7, 0)
      const eased = travel * travel * (3 - 2 * travel)
      pivot.current.position.x = eased * (edge.x * 2 + 0.5)
      pivot.current.position.y = rest + (1 - eased) * rise * 1.5 - eased * rest
      pivot.current.rotation.y = eased * -0.35
    } else if (box.open === 'drawer') {
      tray.current.position.z = p * edge.z * 1.5
    }

    clip.normal.set(0, 0, -1)
    clip.constant = edge.z - 0.03
    root.current.rotation.y = s.spin
    if (ribbon.current) ribbon.current.scale.setScalar(Math.max(s.tie, 0.0001))
    if (handles.current) handles.current.scale.setScalar(Math.max(s.tie, 0.0001))
    invalidate()
  }, [clip, invalidate])

  const rebuild = useCallback(() => {
    const s = state.current
    const parts = buildParts(blendSpec(s.from, s.to, s.k))
    SURFACES.forEach((name) => { if (parts[name]) applyPart(geometries[name], parts[name]) })
    const hasLid = Boolean(parts.lidWall) && !BOXES[s.to].bag
    if (lid.current) lid.current.visible = hasLid
    applyPose()
    return parts
  }, [applyPose, geometries])

  const tieRibbon = useCallback((name, skin) => {
    const mesh = ribbon.current
    mesh.geometry.dispose()
    const built = ribbonGeometry(name, skin.tie, BOXES[name].lid)
    mesh.geometry = built ?? new THREE.BufferGeometry()
    mesh.visible = Boolean(built)
  }, [])

  const getSkin = useCallback(async (slug) => {
    if (!skins.current.has(slug)) skins.current.set(slug, createSkin(slug, quality.low ? 512 : 1024))
    return skins.current.get(slug)
  }, [quality.low])

  const wearSkin = useCallback((skin) => {
    dress(materials.lidTop, skin.lidMaps, skin)
    dress(materials.lidWall, skin.wallMaps, skin)
    dress(materials.base, skin.baseMaps, skin)
    materials.liner.color.set(skin.liner)
    materials.liner.sheenColor.set(skin.liner)
    materials.ribbon.map = skin.ribbonMap
    materials.ribbon.sheenColor.set(skin.ribbon)
    materials.ribbon.needsUpdate = true
    invalidate()
  }, [invalidate, materials])

  // First appearance: the base is there, the lid comes down, the ribbon ties.
  useEffect(() => {
    let live = true
    getSkin(collection).then((skin) => {
      if (!live) return
      wearSkin(skin)
      tieRibbon(format, skin)
      rebuild()
      setSettled({ format, floorY: buildParts(blendSpec(format, format, 1)).floorY })
      setReady(true)
      const s = state.current
      gsap.timeline({ onUpdate: applyPose })
        .to(s, { drop: 0, duration: speed(1.1), ease: 'power3.inOut' }, 0.15)
        .to(s, { tie: 1, duration: speed(0.7), ease: 'back.out(1.6)' }, speed(0.95))
    }).catch((err) => console.error(err))
    return () => { live = false }
    // Runs once; later changes go through the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const owned = skins.current
    return () => {
      owned.forEach((skin) => skin.then((s) => s.dispose()).catch(() => {}))
      Object.values(geometries).forEach((g) => g.dispose())
      Object.values(materials).forEach((m) => m.dispose())
    }
  }, [geometries, materials])

  // Choosing a collection turns the box once; the artwork changes as it passes edge-on.
  const worn = useRef(collection)
  useEffect(() => {
    if (!ready || worn.current === collection) return undefined
    worn.current = collection
    let tween
    let live = true
    getSkin(collection).then((skin) => {
      if (!live) return
      const s = state.current
      const start = s.spin
      const tieChanged = materials.ribbon.map && BOXES[s.to].ribbon !== 'none'
      let swapped = false
      const swap = () => {
        swapped = true
        wearSkin(skin)
        if (tieChanged) tieRibbon(s.to, skin)
      }
      if (!speed(1)) {
        swap()
        return
      }
      tween = gsap.to(s, {
        spin: start + Math.PI * 2,
        duration: 1.15,
        ease: 'power2.inOut',
        onUpdate() {
          if (!swapped && this.progress() >= 0.5) swap()
          applyPose()
        },
        onComplete() {
          s.spin = 0
          applyPose()
        },
      })
    })
    return () => {
      live = false
      tween?.progress(1)
    }
  }, [applyPose, collection, getSkin, materials, ready, tieRibbon, wearSkin])

  // Choosing a format closes the box, unties it, morphs the real geometry and ties it again.
  const shaped = useRef(format)
  useEffect(() => {
    if (!ready || shaped.current === format) return undefined
    const s = state.current
    s.from = shaped.current
    s.to = format
    shaped.current = format
    s.k = 0

    const finish = async () => {
      const skin = await getSkin(worn.current)
      if (s.to !== format) return
      tieRibbon(format, skin)
      const parts = rebuild()
      setSettled({ format, floorY: parts.floorY })
      gsap.to(s, { tie: 1, duration: speed(0.55), ease: 'back.out(1.6)', onUpdate: applyPose })
      gsap.to(s, { open: openRef.current ? 1 : 0, duration: speed(0.8), ease: 'power2.inOut', onUpdate: applyPose })
    }

    const timeline = gsap.timeline({ onComplete: finish })
    timeline
      .to(s, { open: 0, duration: speed(s.open > 0.01 ? 0.5 : 0), ease: 'power2.inOut', onUpdate: applyPose })
      .to(s, { tie: 0, duration: speed(0.22), ease: 'power2.in', onUpdate: applyPose }, 0)
      .to(s, { k: 1, duration: speed(0.8), ease: 'power3.inOut', onUpdate: rebuild })
    return () => timeline.kill()
  }, [applyPose, format, getSkin, ready, rebuild, tieRibbon])

  useEffect(() => {
    openRef.current = open
    if (!ready) return undefined
    const s = state.current
    if (s.k < 1) return undefined
    const tween = gsap.to(s, { open: open ? 1 : 0, duration: speed(1.05), ease: 'power2.inOut', onUpdate: applyPose })
    return () => tween.kill()
  }, [applyPose, open, ready])

  // A drawer's sleeve is the lid with its front wall cut away, so the tray can slide out.
  const box = BOXES[settled.format]
  useEffect(() => {
    const planes = box.open === 'drawer' ? [clip] : []
    for (const m of [materials.lidWall, materials.gold]) m.clippingPlanes = planes
    materials.lidWall.clipShadows = true
    materials.lidWall.needsUpdate = true
    materials.gold.needsUpdate = true
    invalidate()
  }, [box.open, clip, invalidate, materials])

  // Clipping planes live in world space, so this one follows the turning box.
  const worldClip = useMemo(() => new THREE.Matrix4(), [])
  useFrame(() => {
    if (box.open !== 'drawer' || !root.current) return
    const edge = extentOf(ringOf(settled.format, 0))
    clip.normal.set(0, 0, -1)
    clip.constant = edge.z - 0.03
    clip.applyMatrix4(worldClip.copy(root.current.matrixWorld))
  })

  const walls = useMemo(() => dividers(settled.format), [settled.format])
  const showContents = !box.bag

  useEffect(() => {
    onStatus?.({ format: settled.format, collection: worn.current, ready })
  }, [onStatus, ready, settled.format, collection])

  const reportCount = useCallback((pieces) => onStatus?.({ pieces }), [onStatus])

  const handleClick = (e) => {
    e.stopPropagation()
    if (e.delta < 6 && box.open !== 'none') onToggle()
  }
  const pointer = (cursor) => () => { document.body.style.cursor = box.open === 'none' ? '' : cursor }
  useEffect(() => () => { document.body.style.cursor = '' }, [])

  const front = extentOf(ringOf(settled.format, 0)).z
  const footprint = ringOf(settled.format, 0)

  return (
    <group ref={root} visible={ready} onClick={handleClick} onPointerOver={pointer('pointer')} onPointerOut={pointer('')}>
      <group ref={tray}>
        <mesh geometry={geometries.baseWall} material={materials.base} castShadow />
        <mesh geometry={geometries.baseRim} material={materials.base} />
        <mesh geometry={geometries.baseFloor} material={materials.liner} />
        <mesh geometry={geometries.baseBottom} material={materials.base} />
        {walls.map((line) => (
          <mesh key={`${line.x}:${line.z}`} position={[line.x, settled.floorY + 0.14, line.z]} material={materials.gold}>
            <boxGeometry args={[line.width, 0.28, line.depth]} />
          </mesh>
        ))}
        {box.open === 'drawer' ? (
          <mesh position={[0, box.height / 2, front + 0.015]} material={materials.gold}>
            <boxGeometry args={[0.34, 0.1, 0.05]} />
          </mesh>
        ) : null}
        {box.bag ? (
          <>
            <mesh position={[0, box.height - 0.2, 0]} scale={[1.45, 0.62, 0.5]} material={materials.tissue}>
              <icosahedronGeometry args={[1, 2]} />
            </mesh>
            {[1, -1].map((side) => (
              <mesh key={side} position={[0, box.height * 0.5, side * (front + 0.004)]} rotation={[0, side < 0 ? Math.PI : 0, 0]} material={materials.lidTop}>
                <planeGeometry args={[3.3, 3.3]} />
              </mesh>
            ))}
          </>
        ) : null}
        {showContents ? (
          <Pieces
            format={settled.format}
            filling={filling}
            floorY={settled.floorY}
            visible={open || state.current.open > 0.01}
            duration={speed(0.9)}
            onCount={reportCount}
          />
        ) : null}
      </group>

      <group ref={pivot}>
        <group ref={lid}>
          <mesh geometry={geometries.lidWall} material={materials.lidWall} castShadow />
          <mesh geometry={geometries.lidTop} material={materials.lidTop} castShadow />
          <mesh geometry={geometries.lidInner} material={materials.liner} />
          <mesh geometry={geometries.lidCeiling} material={materials.liner} />
          <mesh geometry={geometries.trim} material={materials.gold} />
          <mesh ref={ribbon} material={materials.ribbon} castShadow />
          {box.handle ? (
            <group ref={handles}>
              <mesh position={[0, box.lid, 0]} rotation={[0, 0, 0]} material={materials.gold}>
                <torusGeometry args={[0.72, 0.035, 10, 40, Math.PI]} />
              </mesh>
            </group>
          ) : null}
        </group>
      </group>

      {box.bag ? (
        <group ref={handles}>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[0, box.height, side * 0.62]} material={materials.ribbon}>
              <torusGeometry args={[0.78, 0.03, 10, 40, Math.PI]} />
            </mesh>
          ))}
        </group>
      ) : null}

      <SoftShadow ring={footprint} />
      <GiftCard note={note} z={front + 0.55} />
    </group>
  )
}
