import library from '../content/media.json'

/** Photos already on the site, offered in the picker. */
export const LIBRARY = Object.keys(library)

/**
 * A media value is { kind: 'library', id } for a site photo, or
 * { kind: 'upload', src } for a photo added in the admin (a downscaled JPEG data URL).
 */
export function mediaSrc(item, width = 800) {
  if (!item) return null
  if (item.kind === 'upload') return item.src
  const entry = library[item.id]
  if (!entry) return null
  const w = entry.widths.find((x) => x >= width) ?? entry.widths[entry.widths.length - 1]
  return `/media/${item.id}-${w}.webp`
}

/** Shrinks a photo before it is stored, so a few uploads don't fill the browser's storage. */
export async function resizeUpload(file, max = 1400, quality = 0.82) {
  if (!file.type.startsWith('image/')) throw new Error('not-image')
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  return { kind: 'upload', src: canvas.toDataURL('image/jpeg', quality), name: file.name }
}
