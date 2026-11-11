/**
 * Platforms a social post can go to. Caption limits are each platform's published
 * maximum (X: standard accounts). `needsMedia` platforms reject text-only posts;
 * `video` ones need a video, which can only be uploaded once the backend exists.
 */
export const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', limit: 2200, needsMedia: true },
  { id: 'facebook', name: 'Facebook', limit: 63206 },
  { id: 'tiktok', name: 'TikTok', limit: 2200, needsMedia: true, video: true },
  { id: 'snapchat', name: 'Snapchat', limit: 160, needsMedia: true },
  { id: 'youtube', name: 'YouTube', limit: 5000, needsMedia: true, video: true },
  { id: 'x', name: 'X', limit: 280 },
  { id: 'threads', name: 'Threads', limit: 500 },
  { id: 'linkedin', name: 'LinkedIn', limit: 3000 },
]

export const platformById = (id) => PLATFORMS.find((p) => p.id === id)

/** Problems that would stop a post on its chosen platforms. */
export function postWarnings({ caption = '', platforms = [], media = [] }) {
  const warnings = []
  for (const p of platforms.map(platformById).filter(Boolean)) {
    if (caption.length > p.limit) warnings.push(`${p.name}: the caption is ${caption.length - p.limit} characters over its ${p.limit.toLocaleString()} limit.`)
    if (p.video) warnings.push(`${p.name} posts need a video. Video upload arrives with the backend; until then, save this as a draft.`)
    else if (p.needsMedia && !media.length) warnings.push(`${p.name} needs at least one photo.`)
  }
  return warnings
}
