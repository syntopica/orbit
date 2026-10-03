import type { Ref } from 'react'
import type { Mesh } from 'three'

export const OrbitPulseRing = ({
  color,
  ref,
}: {
  readonly color: string
  readonly ref: Ref<Mesh>
}) => (
  <mesh ref={ref}>
    <ringGeometry args={[0.27, 0.29, 48]} />
    <meshBasicMaterial
      color={color}
      transparent
      opacity={0}
      depthWrite={false}
      side={2}
    />
  </mesh>
)
