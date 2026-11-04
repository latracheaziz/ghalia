import { useEffect, useState } from 'react'
import * as THREE from 'three'
import wordmark from '../../assets/brand/wordmark.svg?raw'

function loadSvg(svg, color, width, height) {
  const sized = svg.replace('<svg ', `<svg width="${width}" height="${height}" `).replaceAll('currentColor', color)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`
  })
}

function asTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function useAsyncTexture(build) {
  const [texture, setTexture] = useState(null)
  useEffect(() => {
    let live = true
    let made
    build().then((t) => {
      made = t
      if (live) setTexture(t)
      else t.dispose()
    }).catch(() => {})
    return () => {
      live = false
      made?.dispose()
    }
  }, [build])
  return texture
}

/** The real GHALIA wordmark as a transparent gold-foil decal. */
const buildWordmark = async () => {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 256
  const img = await loadSvg(wordmark, '#E3B873', 960, 135)
  canvas.getContext('2d').drawImage(img, 32, 60)
  return asTexture(canvas)
}
export const useWordmarkTexture = () => useAsyncTexture(buildWordmark)

/** Mocha satin woven with the wordmark, like the ribbon on every box. */
const buildRibbon = async () => {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#5A3522'
  ctx.fillRect(0, 0, 1024, 128)
  ctx.fillStyle = '#C79A55'
  ctx.fillRect(0, 7, 1024, 3)
  ctx.fillRect(0, 118, 1024, 3)
  const img = await loadSvg(wordmark, '#E3B873', 400, 56)
  ctx.drawImage(img, 56, 36)
  ctx.drawImage(img, 568, 36)
  const texture = asTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  return texture
}
export const useRibbonTexture = () => useAsyncTexture(buildRibbon)
