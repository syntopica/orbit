import { AdditiveBlending } from 'three'
import type { OrbitGlowProps } from '../../types/OrbitGlowProps'

export const OrbitGlow = ({
  color,
  light,
  opacity,
  ref,
  scale,
  texture,
}: OrbitGlowProps) => (
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
