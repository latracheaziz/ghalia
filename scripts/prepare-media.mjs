/**
 * Builds the responsive WebP set in /public/media and its manifest from the
 * images embedded in the two brand PDFs. Run with GHALIA_SOURCE pointing at the
 * folder of extracted images:  GHALIA_SOURCE=/path/to/img npm run media
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SRC = process.env.GHALIA_SOURCE
if (!SRC) throw new Error('Set GHALIA_SOURCE to the folder of extracted PDF images.')

const OUT = path.resolve('public/media')
const MANIFEST = path.resolve('src/content/media.json')
const WIDTHS = [480, 800, 1200, 1680]

// id: [source file, crop box [x, y, w, h] | null, upscale factor]
const JOBS = {
  // Brand book
  'cover-silk': ['A_p01_0_X4.png', [0, 0, 500, 945], 1.6],
  'cover-box': ['A_p01_0_X4.png', [985, 330, 680, 615], 1.6],
  'gift-heritage': ['A_p02_0_X4.png', null, 1.1],
  boutique: ['A_p05_0_X5.png', null, 1.2],
  atelier: ['A_p07_0_X5.png', null, 1.2],
  hosts: ['A_p03_2_X9.jpg', null, 1.3],
  'halo-board': ['A_p03_0_X4.png', null, 1.6],
  'halo-tray': ['A_p03_0_X4.png', [52, 42, 320, 372], 2.2],
  pergola: ['pergola-dusk.png'], // supplied separately, not from the PDFs: keep it in GHALIA_SOURCE
  'pergola-arch': ['A_p03_1_X7.png', [2, 448, 164, 176], 2.4],
  'pergola-ceiling': ['A_p03_1_X7.png', [172, 448, 164, 176], 2.4],
  'pergola-ceremony': ['pergola-ceremony.png', [424, 0, 859, 922]], // supplied separately, not from the PDFs: keep it in GHALIA_SOURCE
  'pergola-decor': ['A_p03_1_X7.png', [510, 448, 164, 176], 2.4],
  'pergola-lounge': ['A_p03_1_X7.png', [678, 448, 164, 176], 2.4],
  moodboard: ['A_p09_0_X4.png', null, 1.1],
  'mood-craft': ['A_p09_0_X4.png', [401, 2, 250, 306], 2.4],
  'mood-maison': ['A_p09_0_X4.png', [656, 2, 376, 332], 2.2],
  'mood-arch': ['A_p09_0_X4.png', [1037, 2, 245, 332], 2.4],
  'mood-rose-box': ['A_p09_0_X4.png', [717, 343, 274, 472], 2.2],
  'mood-open-box': ['A_p09_0_X4.png', [1000, 552, 294, 262], 2.4],
  'mood-cacao': ['A_p09_0_X4.png', [0, 824, 253, 136], 2.4],
  'mood-pralines': ['A_p09_0_X4.png', [497, 824, 366, 136], 2.2],
  'mood-silk': ['A_p09_0_X4.png', [868, 824, 208, 136], 2.4],
  'mood-roses': ['A_p09_0_X4.png', [1270, 824, 266, 136], 2.4],
  // Standard Classic
  'classic-1': ['E_p02_0_X10.png'], 'classic-2': ['E_p03_0_X4.png'], 'classic-3': ['E_p03_1_X6.png'],
  'classic-4': ['E_p03_2_X7.png'], 'classic-5': ['E_p03_3_X8.png'], 'classic-6': ['E_p03_4_X9.png'],
  // Arabian Heritage
  'heritage-1': ['E_p04_0_X5.png'], 'heritage-2': ['E_p05_0_X4.png'], 'heritage-3': ['E_p05_1_X6.png'],
  'heritage-4': ['E_p05_2_X7.png'], 'heritage-5': ['E_p05_3_X8.png'],
  // Signature Rose
  'rose-1': ['E_p06_0_X4.png'], 'rose-2': ['E_p06_1_X7.png'],
  // Ramadan
  'ramadan-1': ['E_p07_1_X7.png'], 'ramadan-2': ['E_p07_0_X5.png'],
  // Eid Al Fitr
  'fitr-1': ['E_p09_3_X12.png'], 'fitr-2': ['E_p09_0_X5.png'], 'fitr-3': ['E_p09_1_X8.png'],
  'fitr-4': ['E_p09_2_X10.png'], 'fitr-5': ['E_p09_4_X13.png'], 'fitr-6': ['E_p10_3_X11.png'],
  'fitr-7': ['E_p10_0_X4.png'], 'fitr-8': ['E_p10_1_X7.png'], 'fitr-9': ['E_p10_2_X9.png'],
  'fitr-10': ['E_p10_4_X12.png'], 'fitr-11': ['E_p08_0_X4.png'], 'fitr-12': ['E_p08_1_X6.png'],
  // Eid Al Adha
  'adha-1': ['E_p11_1_X7.png'], 'adha-2': ['E_p11_0_X4.png'], 'adha-3': ['E_p11_2_X8.png'],
  'adha-4': ['E_p11_3_X9.png'], 'adha-5': ['E_p12_3_X11.png'], 'adha-6': ['E_p12_0_X4.png'],
  'adha-7': ['E_p12_1_X7.png'], 'adha-8': ['E_p12_2_X9.png'], 'adha-9': ['E_p12_4_X12.png'],
  // Saudi National Day
  'national-1': ['E_p13_1_X7.png'], 'national-2': ['E_p13_0_X4.png'], 'national-3': ['E_p14_1_X7.png'],
  'national-4': ['E_p14_0_X4.png'], 'national-5': ['E_p14_3_X9.png'], 'national-6': ['E_p14_4_X11.png'],
}

await fs.rm(OUT, { recursive: true, force: true })
await fs.mkdir(OUT, { recursive: true })

const manifest = {}
for (const [id, [file, crop, upscale = 1]] of Object.entries(JOBS)) {
  let base = sharp(path.join(SRC, file)).removeAlpha()
  if (crop) base = base.extract({ left: crop[0], top: crop[1], width: crop[2], height: crop[3] })
  const buffer = await base.png().toBuffer()
  const meta = await sharp(buffer).metadata()
  const maxW = Math.round(meta.width * upscale)
  const ratio = meta.height / meta.width
  const widths = [...WIDTHS.filter((w) => w < maxW * 0.9), Math.min(maxW, 1920)]

  for (const w of widths) {
    let pipe = sharp(buffer).resize({ width: w, kernel: 'lanczos3' })
    if (w > meta.width) pipe = pipe.sharpen({ sigma: 0.8 })
    await pipe.webp({ quality: 78, effort: 5 }).toFile(path.join(OUT, `${id}-${w}.webp`))
  }
  const { dominant } = await sharp(buffer).stats()
  manifest[id] = {
    ratio: Number(ratio.toFixed(4)),
    widths,
    color: `rgb(${dominant.r} ${dominant.g} ${dominant.b})`,
  }
}

await sharp(path.join(SRC, 'A_p02_0_X4.png')).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 82 }).toFile(path.join(OUT, 'og.jpg'))
await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 1))
console.log(`${Object.keys(manifest).length} images → ${OUT}`)
