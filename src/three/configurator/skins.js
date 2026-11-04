import * as THREE from 'three'
import wordmark from '../../assets/brand/wordmark.svg?raw'

// Colours follow each collection's packaging photography and description.
// National Day is geometric only: the emblem shown in the packaging book is
// restricted for commercial use, so it is deliberately not reproduced here.
export const SKINS = {
  'standard-classic': { lid: '#E8BFB4', wall: '#E8BFB4', base: '#F3E6D4', liner: '#F5EBDD', ribbon: '#5A3522', ink: '#E3B873', foil: '#9C6E2C', tie: 'cross', art: 'classic', rough: 0.72 },
  'arabian-heritage': { lid: '#F0E5D1', wall: '#F0E5D1', base: '#EADBC2', liner: '#3A2013', ribbon: '#6B4630', ink: '#E3B873', foil: '#9C6E2C', tie: 'band', art: 'heritage', rough: 0.7 },
  'signature-rose': { lid: '#A5666E', wall: '#A5666E', base: '#A5666E', liner: '#D9B27A', ribbon: '#A9804F', ink: '#F4E2C4', foil: '#F6DCA6', tie: 'band', art: 'rose', rough: 0.92, velvet: '#E2B0A6' },
  ramadan: { lid: '#14306B', wall: '#14306B', base: '#0F5A4A', liner: '#0F5A4A', ribbon: '#C99A4E', ink: '#5A3522', tie: 'cross', art: 'ramadan', rough: 0.6 },
  'eid-al-fitr': { lid: '#F0E5D1', wall: '#C9805F', base: '#F0E5D1', liner: '#EBD7BE', ribbon: '#5A3522', ink: '#E3B873', foil: '#9C6E2C', tie: 'cross', art: 'fitr', rough: 0.68 },
  'eid-al-adha': { lid: '#F2E9D8', wall: '#F2E9D8', base: '#E8D9BF', liner: '#F7EFE2', ribbon: '#6B4630', ink: '#E3B873', foil: '#9C6E2C', tie: 'band', art: 'adha', rough: 0.66 },
  'saudi-national-day': { lid: '#0F4A38', wall: '#0F4A38', base: '#0F4A38', liner: '#D9B27A', ribbon: '#C99A4E', ink: '#0F4A38', tie: 'cross', art: 'national', rough: 0.9, velvet: '#3FA081' },
}

const GOLD = '#D9AE66'
// The mask packs three maps into one image: R = bump, G = roughness, B = metalness.
const FOIL = 'rgb(255 70 190)'

function canvas(size) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  return c
}

function loadWordmark(color) {
  const svg = wordmark.replace('<svg ', '<svg width="1364" height="192" ').replaceAll('currentColor', color)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  })
}

const logos = new Map()
const getLogo = (color) => {
  if (!logos.has(color)) logos.set(color, loadWordmark(color))
  return logos.get(color)
}

function star(ctx, x, y, r) {
  ctx.beginPath()
  for (let i = 0; i < 16; i += 1) {
    const radius = i % 2 ? r * 0.56 : r
    const a = (i * Math.PI) / 8
    ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * radius, y + Math.sin(a) * radius)
  }
  ctx.closePath()
}

function archPath(ctx, cx, bottom, w, h) {
  const r = w / 2
  ctx.beginPath()
  ctx.moveTo(cx - r, bottom)
  ctx.lineTo(cx - r, bottom - h + r)
  ctx.arc(cx, bottom - h + r, r, Math.PI, 0)
  ctx.lineTo(cx + r, bottom)
}

function ogeePath(ctx, cx, bottom, w, h) {
  const r = w / 2
  ctx.beginPath()
  ctx.moveTo(cx - r, bottom)
  ctx.lineTo(cx - r, bottom - h * 0.55)
  ctx.bezierCurveTo(cx - r, bottom - h * 0.8, cx - r * 0.2, bottom - h * 0.82, cx, bottom - h)
  ctx.bezierCurveTo(cx + r * 0.2, bottom - h * 0.82, cx + r, bottom - h * 0.8, cx + r, bottom - h * 0.55)
  ctx.lineTo(cx + r, bottom)
}

function rosette(ctx, x, y, r) {
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4
    ctx.beginPath()
    ctx.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.46, r * 0.2, a, 0, Math.PI * 2)
    ctx.stroke()
  }
}

function lattice(ctx, size, cell, fn) {
  for (let y = -cell; y <= size + cell; y += cell) {
    for (let x = -cell; x <= size + cell; x += cell) fn(x + cell / 2, y + cell / 2)
  }
}

/** Runs a drawing on the colour art and, as foil, on the material mask. */
function painter(color, mask, gold) {
  const stamp = (ctx, style, width, draw) => {
    ctx.save()
    ctx.strokeStyle = style
    ctx.fillStyle = style
    ctx.lineWidth = width
    draw(ctx)
    ctx.restore()
  }
  return {
    foil: (width, draw) => {
      stamp(color, gold, width, draw)
      stamp(mask, FOIL, width, draw)
    },
    ink: (style, width, draw) => stamp(color, style, width, draw),
    emboss: (width, draw) => stamp(mask, 'rgb(235 150 0)', width, draw),
  }
}

const ART = {
  classic(p, s) {
    p.foil(s * 0.003, (c) => rosette(c, s / 2, s * 0.6, s * 0.03))
  },
  heritage(p, s) {
    for (const y of [s * 0.2, s * 0.8]) {
      for (let x = s * 0.1; x <= s * 0.9; x += s * 0.16) {
        p.ink('#6B4630', 0, (c) => { star(c, x, y, s * 0.07); c.fill() })
        p.foil(s * 0.004, (c) => { star(c, x, y, s * 0.052); c.stroke() })
      }
    }
    p.foil(s * 0.003, (c) => {
      for (const y of [s * 0.3, s * 0.7]) {
        c.beginPath()
        c.moveTo(0, y)
        c.lineTo(s, y)
        c.stroke()
      }
    })
  },
  rose(p, s) {
    p.foil(s * 0.0028, (c) => rosette(c, s / 2, s * 0.6, s * 0.028))
  },
  ramadan(p, s) {
    p.ink('#0F5A4A', 0, (c) => { ogeePath(c, s / 2, s * 0.78, s * 0.62, s * 0.62); c.closePath(); c.fill() })
    p.foil(s * 0.0026, (c) => lattice(c, s, s * 0.125, (x, y) => { star(c, x, y, s * 0.052); c.stroke() }))
    p.ink('#14306B', 0, (c) => { ogeePath(c, s / 2, s * 0.68, s * 0.46, s * 0.42); c.closePath(); c.fill() })
    p.foil(s * 0.005, (c) => { ogeePath(c, s / 2, s * 0.68, s * 0.46, s * 0.42); c.closePath(); c.stroke() })
    p.foil(0, (c) => {
      c.beginPath()
      c.arc(s / 2, s * 0.355, s * 0.035, 0.5, Math.PI * 2 - 0.5)
      c.arc(s / 2 + s * 0.012, s * 0.355, s * 0.027, Math.PI * 2 - 0.62, 0.62, true)
      c.fill()
    })
  },
  fitr(p, s) {
    const layers = [['#C9805F', 0.66, 0.72], ['#A9B79F', 0.5, 0.58], ['#F0E5D1', 0.36, 0.46]]
    layers.forEach(([tone, w, h]) => {
      p.ink(tone, 0, (c) => { ogeePath(c, s / 2, s * 0.9, s * w, s * h); c.closePath(); c.fill() })
      p.foil(s * 0.004, (c) => { ogeePath(c, s / 2, s * 0.9, s * w, s * h); c.closePath(); c.stroke() })
    })
    p.emboss(s * 0.004, (c) => lattice(c, s, s * 0.14, (x, y) => { star(c, x, y, s * 0.05); c.stroke() }))
  },
  adha(p, s) {
    p.emboss(s * 0.005, (c) => lattice(c, s, s * 0.125, (x, y) => { star(c, x, y, s * 0.055); c.stroke() }))
    for (const w of [0.66, 0.5, 0.34]) {
      p.foil(s * 0.004, (c) => { archPath(c, s / 2, s * 0.9, s * w, s * (w + 0.12)); c.stroke() })
    }
  },
  national(p, s) {
    p.foil(s * 0.0034, (c) => {
      lattice(c, s, s * 0.2, (x, y) => {
        const r = s * 0.07
        c.beginPath()
        c.moveTo(x, y - r)
        c.lineTo(x + r, y)
        c.lineTo(x, y + r)
        c.lineTo(x - r, y)
        c.closePath()
        c.stroke()
      })
    })
    p.ink('#0F4A38', 0, (c) => c.fillRect(s * 0.17, s * 0.4, s * 0.66, s * 0.2))
    p.foil(s * 0.004, (c) => c.strokeRect(s * 0.17, s * 0.4, s * 0.66, s * 0.2))
  },
}

// Paper fibre or velvet nap, added to the mask so light breaks up across the surface.
function grain(ctx, size, skin, seed) {
  const image = ctx.getImageData(0, 0, size, size)
  const { data } = image
  // xorshift: a plain LCG correlates between rows and draws visible vertical streaks.
  let n = seed
  const spread = skin.velvet ? 46 : 18
  for (let i = 0; i < data.length; i += 4) {
    n ^= n << 13
    n ^= n >>> 17
    n ^= n << 5
    const noise = ((n >>> 0) / 4294967296 - 0.5) * spread
    if (data[i + 2] < 128) {
      // Roughness carries the texture. Noise in the bump channel would alias into streaks.
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
    }
  }
  ctx.putImageData(image, 0, 0)
}

function texture(source, srgb) {
  const t = new THREE.CanvasTexture(source)
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 8
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  return t
}

function surface(size, skin, fill, draw) {
  const color = canvas(size)
  const mask = canvas(size)
  const c = color.getContext('2d')
  const m = mask.getContext('2d', { willReadFrequently: true })
  c.fillStyle = fill
  c.fillRect(0, 0, size, size)
  m.fillStyle = `rgb(110 ${Math.round(skin.rough * 255)} 0)`
  m.fillRect(0, 0, size, size)
  draw(painter(c, m, skin.foil ?? GOLD), c, m)
  grain(m, size, skin, 2463534242)
  return { map: texture(color, true), mask: texture(mask, false) }
}

function ribbonTexture(skin, ink) {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 128
  const ctx = c.getContext('2d')
  ctx.fillStyle = skin.ribbon
  ctx.fillRect(0, 0, 1024, 128)
  ctx.fillStyle = skin.ink
  ctx.fillRect(0, 7, 1024, 3)
  ctx.fillRect(0, 118, 1024, 3)
  ctx.globalAlpha = 0.9
  ctx.drawImage(ink, 80, 42, 300, 44)
  ctx.drawImage(ink, 592, 42, 300, 44)
  return texture(c, true)
}

/** Builds a collection's textures. The caller owns them and disposes them. */
export async function createSkin(slug, size) {
  const skin = SKINS[slug]
  const [gold, foil, ribbonInk] = await Promise.all([getLogo(skin.foil ?? GOLD), getLogo(FOIL), getLogo(skin.ink)])
  const logoW = size * 0.5
  const logoH = logoW * (192 / 1364)

  const lid = surface(size, skin, skin.lid, (p, c, m) => {
    ART[skin.art](p, size)
    const x = (size - logoW) / 2
    const y = size * 0.5 - logoH / 2
    c.drawImage(gold, x, y, logoW, logoH)
    m.drawImage(foil, x, y, logoW, logoH)
  })
  const wall = surface(size / 2, skin, skin.wall, (p) => {
    if (skin.art === 'ramadan' || skin.art === 'heritage') p.foil(size * 0.002, (c) => lattice(c, size / 2, size / 8, (x, y) => { star(c, x, y, size * 0.024); c.stroke() }))
  })
  const base = surface(size / 2, { ...skin, velvet: skin.velvet }, skin.base, () => {})

  const textures = [lid.map, lid.mask, wall.map, wall.mask, base.map, base.mask]
  const ribbon = ribbonTexture(skin, ribbonInk)
  return {
    ...skin,
    slug,
    lidMaps: lid,
    wallMaps: wall,
    baseMaps: base,
    ribbonMap: ribbon,
    dispose: () => [...textures, ribbon].forEach((t) => t.dispose()),
  }
}

export const SKIN_SLUGS = Object.keys(SKINS)
