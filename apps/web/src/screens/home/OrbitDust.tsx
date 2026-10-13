import { useOrbitDust } from '../../hooks/useOrbitDust'
import type { OrbitDustProps } from '../../types/OrbitDustProps'

export const OrbitDust = ({ color, light }: OrbitDustProps) => {
  const { group, positions } = useOrbitDust()
  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={light ? 0.018 : 0.025}
          transparent
          opacity={light ? 0.24 : 0.5}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  )
}
