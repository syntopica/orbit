import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'

export const useOrbitDust = () => {
  const group = useRef<Group>(null)
  const positions = useMemo(() => {
    const values = new Float32Array(140 * 3)
    for (let index = 0; index < 140; index += 1) {
      const angle = index * 2.39996
      const radius = 0.8 + Math.sqrt((index + 0.5) / 140) * 5.1
      values[index * 3] = Math.cos(angle) * radius
      values[index * 3 + 1] = Math.sin(angle) * radius * 0.65
      values[index * 3 + 2] = -1.4 + (index % 13) * 0.19
    }
    return values
  }, [])
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.z = clock.elapsedTime * 0.006
  })
  return { group, positions }
}
