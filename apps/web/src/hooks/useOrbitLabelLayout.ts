import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import { Vector3 } from 'three'

import { orbitLeaderGeometry } from '../geometry/orbitLeaderGeometry'
import { orbitPosition3d } from '../geometry/orbitPosition3d'
import { resolveOrbitLabels } from '../geometry/resolveOrbitLabels'
import type { OrbitLabelInput } from '../types/OrbitLabelInput'

export const useOrbitLabelLayout = (
  labels: readonly React.RefObject<HTMLAnchorElement | null>[],
  leaders: readonly React.RefObject<SVGPathElement | null>[],
): void => {
  const point = useMemo(() => new Vector3(), [])
  const edge = useMemo(() => new Vector3(), [])
  useFrame(({ camera, clock, size }) => {
    const inputs: OrbitLabelInput[] = []
    for (let index = 0; index < labels.length; index += 1) {
      const element = labels[index]?.current
      if (!element) continue
      point.set(...orbitPosition3d(index, clock.elapsedTime * 0.055))
      edge.set(point.x + 0.25, point.y, point.z)
      point.project(camera)
      edge.project(camera)
      inputs.push({
        x: (point.x * 0.5 + 0.5) * size.width,
        y: (-point.y * 0.5 + 0.5) * size.height,
        radius: Math.max(12, (Math.abs(edge.x - point.x) * size.width) / 2),
        width: element.offsetWidth,
        height: element.offsetHeight,
      })
    }
    resolveOrbitLabels(inputs, size).forEach((box, index) => {
      const element = labels[index]?.current
      if (!element) return
      element.style.left = `${String(box.x)}px`
      element.style.top = `${String(box.y)}px`
      element.style.visibility = 'visible'
      element.dataset['sphereX'] = String(inputs[index]?.x)
      element.dataset['sphereY'] = String(inputs[index]?.y)
      element.dataset['sphereRadius'] = String(inputs[index]?.radius)
      const leader = leaders[index]?.current
      const input = inputs[index]
      if (!leader || !input) return
      const { x1, y1, x2, y2 } = orbitLeaderGeometry(input, box)
      leader.setAttribute(
        'd',
        `M ${String(x1)} ${String(y1)} L ${String(x2)} ${String(y2)}`,
      )
      leader.style.visibility = 'visible'
    })
  })
}
