import { useSyncExternalStore } from 'react'

// Lets a page hold its entrance until the preloader starts lifting.
let done = false
const listeners = new Set()

export function finishIntro() {
  done = true
  listeners.forEach((fn) => fn())
}
const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const useIntroDone = () => useSyncExternalStore(subscribe, () => done)

// The home film reports here once its first frame is on screen.
let release
const firstFrame = new Promise((resolve) => { release = resolve })
export const sceneFirstFrame = () => release()
export const waitForFirstFrame = () => firstFrame
