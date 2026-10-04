import { PerspectiveCamera, Vector3 } from 'three'
import { describe, expect, it } from 'vitest'

import type { OrbitLabelInput } from '../types/OrbitLabelInput'
import { orbitLabelIsClear } from './orbitLabelIsClear'
import { orbitPosition3d } from './orbitPosition3d'
import { resolveOrbitLabels } from './resolveOrbitLabels'

describe('resolveOrbitLabels', () => {
  it('prefers the side away from a neighboring sphere', () => {
    const left = { x: 220, y: 200, radius: 20, width: 142, height: 48 }
    const right = { ...left, x: 390 }
    const [box] = resolveOrbitLabels([left, right], {
      width: 700,
      height: 400,
    })
    expect(box?.x).toBeLessThan(left.x - left.radius)
  })

  it.each([920, 764])('keeps seven radial labels clear at %i px', (width) => {
    const points: OrbitLabelInput[] = [
      [0.35, 0.28],
      [0.68, 0.42],
      [0.5, 0.65],
      [0.3, 0.43],
      [0.62, 0.72],
      [0.76, 0.4],
      [0.44, 0.24],
    ].map((position) => ({
      x: (position[0] ?? 0) * width,
      y: (position[1] ?? 0) * 520,
      radius: 18,
      width: 142,
      height: 48,
    }))
    const boxes = resolveOrbitLabels(points, { width, height: 520 })
    expect(boxes).toHaveLength(7)
    boxes.forEach((box, index) => {
      expect(orbitLabelIsClear(box, points, boxes.slice(0, index))).toBe(true)
      expect(box.x).toBeGreaterThanOrEqual(12)
      expect(box.x + box.width).toBeLessThanOrEqual(width - 12)
    })
  })

  it.each([
    [1024, 600],
    [824, 563],
  ])(
    'keeps seven projected satellites clear through an orbit at %i × %i',
    (width, height) => {
      const camera = new PerspectiveCamera(42, width / height)
      camera.position.set(0, 4.2, 8.2)
      camera.lookAt(0, 0, 0)
      camera.updateMatrixWorld()
      for (let tick = 0; tick < 72; tick += 1) {
        const points = Array.from({ length: 7 }, (_, index) => {
          const point = new Vector3(
            ...orbitPosition3d(index, (tick * Math.PI) / 36),
          )
          point.project(camera)
          return {
            x: (point.x * 0.5 + 0.5) * width,
            y: (-point.y * 0.5 + 0.5) * height,
            radius: 27,
            width: 142,
            height: 48,
          }
        })
        const boxes = resolveOrbitLabels(points, { width, height })
        boxes.forEach((box, index) => {
          expect(orbitLabelIsClear(box, points, boxes.slice(0, index))).toBe(
            true,
          )
        })
      }
    },
  )
})
