import { useOrbitTrail } from '../../hooks/useOrbitTrail'
import type { OrbitTrailProps } from '../../types/OrbitTrailProps'

export const OrbitTrail = ({ color, index, light }: OrbitTrailProps) => {
  const group = useOrbitTrail(index)
  return (
    <group ref={group}>
      {Array.from({ length: 5 }, (_, trailIndex) => (
        <mesh key={trailIndex} scale={1 - trailIndex * 0.15}>
          <sphereGeometry args={[0.07, 8, 6]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={(light ? 0.12 : 0.28) * (1 - trailIndex / 5)}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
