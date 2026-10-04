import { useFrame } from '@react-three/fiber'
import type { RefObject } from 'react'
import { useRef } from 'react'
import type { Group } from 'three'

import { clearLabels3d } from '../geometry/clearLabels3d'
import { labelRect3d } from '../geometry/labelRect3d'

// Before each frame, hides every label that would cover a higher-priority
// one (children come largest node first), so rotating the scene never stacks
// text.
export const useLabelCulling3d = (): RefObject<Group | null> => {
  const group = useRef<Group>(null)
  useFrame(({ camera, size }) => {
    const labels = group.current?.children ?? []
    const shown = clearLabels3d(
      labels.map((label) => labelRect3d(label, camera, size)),
    )
    labels.forEach((label, index) => {
      label.visible = shown[index] ?? false
    })
  })
  return group
}
