import type { Ref } from 'react'
import { AdditiveBlending, type Sprite, type Texture } from 'three'

export const OrbitGlow = ({
  color,
  light,
  opacity,
  ref,
  scale,
  texture,
}: {
  readonly color: string
  readonly light: boolean
  readonly opacity: number
  readonly ref?: Ref<Sprite> | null
  readonly scale: number
  readonly texture: Texture
}) => (
  <sprite ref={ref ?? null} scale={[scale, scale, 1]}>
    <spriteMaterial
      map={texture}
      color={color}
      blending={AdditiveBlending}
      transparent
      opacity={opacity * (light ? 0.3 : 1)}
      depthWrite={false}
    />
  </sprite>
)
