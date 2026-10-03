export const OrbitTrack = ({
  radius,
  color,
}: {
  readonly radius: number
  readonly color: string
}) => (
  <mesh rotation={[0.606, 0, 0]} scale={[1, 0.91, 1]}>
    <torusGeometry args={[radius, 0.009, 4, 192]} />
    <meshBasicMaterial color={color} transparent opacity={0.38} />
  </mesh>
)
