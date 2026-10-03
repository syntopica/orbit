import { useOrbitTrail } from '../../hooks/useOrbitTrail'

export const OrbitTrail = ({
  color,
  index,
  light,
}: {
  readonly color: string
  readonly index: number
  readonly light: boolean
}) => {
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
