/**
 * Adds single images to the media set without rebuilding it (unlike prepare-media.mjs, which
 * starts from the brand PDFs and clears public/media first).
 *
 *   node scripts/add-media.mjs <id>=<path-to-image> [<id>=<path-to-image> ...]
 *
 * Writes the responsive WebP sizes to public/media and merges the entry into src/content/media.json.
 * Sources smaller than the largest size are enlarged up to 1.5x with a light sharpen.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const OUT = path.resolve('public/media')
const MANIFEST = path.resolve('src/content/media.json')
const WIDTHS = [480, 800, 1200, 1600, 2000]
const MAX_WIDTH = 2400

const jobs = process.argv.slice(2).map((arg) => {
  const at = arg.indexOf('=')
  if (at < 1) throw new Error(`Expected id=path, got "${arg}"`)
  return [arg.slice(0, at), arg.slice(at + 1)]
})
if (!jobs.length) throw new Error('Usage: node scripts/add-media.mjs <id>=<path> ...')

const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'))
for (const [id, file] of jobs) {
  const buffer = await sharp(file).removeAlpha().png().toBuffer()
  const meta = await sharp(buffer).metadata()
  const maxW = Math.min(Math.round(meta.width * 1.5), MAX_WIDTH)
  const widths = [...WIDTHS.filter((w) => w < maxW * 0.9), maxW]
  for (const w of widths) {
    let pipe = sharp(buffer).resize({ width: w, kernel: 'lanczos3' })
    if (w > meta.width) pipe = pipe.sharpen({ sigma: 0.8 })
    await pipe.webp({ quality: 88, effort: 6, smartSubsample: true }).toFile(path.join(OUT, `${id}-${w}.webp`))
  }
  const { dominant } = await sharp(buffer).stats()
  manifest[id] = {
    ratio: Number((meta.height / meta.width).toFixed(4)),
    widths,
    color: `rgb(${dominant.r} ${dominant.g} ${dominant.b})`,
  }
  console.log(`${id}: ${meta.width}×${meta.height} → ${widths.join(', ')}`)
}
await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 1))
