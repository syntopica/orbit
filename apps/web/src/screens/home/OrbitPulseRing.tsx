import type { OrbitPulseRingProps } from '../../types/OrbitPulseRingProps'

export const OrbitPulseRing = ({ color, ref }: OrbitPulseRingProps) => (
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
