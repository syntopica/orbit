import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, type Group, type ShaderMaterial } from 'three'

export const useOrbitCore = (color: string, light: boolean) => {
  const group = useRef<Group>(null)
  const surface = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(color) },
      uLight: { value: light ? 1 : 0 },
      uTime: { value: 0 },
    }),
    [color, light],
  )
  useFrame(({ clock }) => {
    const time = surface.current?.uniforms['uTime']
    if (time) time.value = clock.elapsedTime
    if (group.current)
      group.current.scale.setScalar(
        1 + Math.sin(clock.elapsedTime * 0.8) * 0.025,
      )
  })
  return { group, surface, uniforms }
}
