import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

import { orbitPosition3d } from '../geometry/orbitPosition3d'

export const useOrbitTrail = (index: number) => {
  const group = useRef<Group>(null)
  useFrame(({ clock }) => {
    group.current?.children.forEach((child, trailIndex) => {
      child.position.set(
        ...orbitPosition3d(
          index,
          clock.elapsedTime * 0.055 - (trailIndex + 1) * 0.075,
        ),
      )
    })
  })
  return group
}
