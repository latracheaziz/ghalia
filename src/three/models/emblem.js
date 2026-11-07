import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

/**
 * A 24 × 24 SVG mark struck in relief: extruded from its path, upright, its
 * widest side `size` units across, standing on z = 0 and rising towards +z.
 */
export function emblemGeometry(d, size = 1.6) {
  const svg = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${d}"/></svg>`)
  const shapes = svg.paths.flatMap((path) => SVGLoader.createShapes(path))
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: 0.7,
    bevelEnabled: true,
    bevelThickness: 0.28,
    bevelSize: 0.14,
    bevelSegments: 3,
    curveSegments: 14,
  })
  geometry.center()
  // SVG runs y-down. Turning half over the x axis puts it upright without mirroring it.
  geometry.rotateX(Math.PI)
  geometry.computeBoundingBox()
  const box = geometry.boundingBox
  const scale = size / Math.max(box.max.x - box.min.x, box.max.y - box.min.y)
  geometry.scale(scale, scale, scale)
  geometry.computeBoundingBox()
  geometry.translate(0, 0, -geometry.boundingBox.min.z)
  return geometry
}
