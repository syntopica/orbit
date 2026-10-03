import { useOrbitSatellite3d } from '../../hooks/useOrbitSatellite3d'
import type { OrbitSatellite3dProps } from '../../types/OrbitSatellite3dProps'
import { OrbitGlow } from './OrbitGlow'
import { OrbitPulseRing } from './OrbitPulseRing'

export const OrbitSatellite3d = ({
  card,
  index,
  color,
  label,
  light,
  texture,
}: OrbitSatellite3dProps) => {
  const { group, sphere, halo, wave, hoveredRef } = useOrbitSatellite3d(
    card,
    index,
    light,
  )
  return (
    <group ref={group}>
      <OrbitGlow
        color={color}
        light={light}
        opacity={0.64}
        scale={0.95}
        texture={texture}
        ref={halo}
      />
      <OrbitPulseRing color={color} ref={wave} />
      <mesh
        ref={sphere}
        onPointerOver={() => {
          hoveredRef.current = true
        }}
        onPointerOut={() => {
          hoveredRef.current = false
        }}
        onClick={() => label.current?.click()}
      >
        <sphereGeometry args={[0.25, 32, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={light ? 0.35 : 0.9}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}
