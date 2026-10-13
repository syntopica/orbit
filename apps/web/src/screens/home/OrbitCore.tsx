import { useOrbitCore } from '../../hooks/useOrbitCore'
import type { OrbitCoreProps } from '../../types/OrbitCoreProps'
import { OrbitGlow } from './OrbitGlow'
import { orbitCoreFragmentShader } from './orbitCoreFragmentShader'
import { orbitCoreVertexShader } from './orbitCoreVertexShader'

export const OrbitCore = ({ color, light, texture }: OrbitCoreProps) => {
  const { group, surface, uniforms } = useOrbitCore(color, light)
  return (
    <group ref={group}>
      <OrbitGlow
        color={color}
        light={light}
        opacity={light ? 1 : 0.67}
        scale={3.3}
        texture={texture}
      />
      <mesh>
        <sphereGeometry args={[0.67, 48, 32]} />
        <shaderMaterial
          ref={surface}
          uniforms={uniforms}
          vertexShader={orbitCoreVertexShader}
          fragmentShader={orbitCoreFragmentShader}
        />
      </mesh>
      <pointLight color={color} intensity={light ? 3 : 6} distance={5} />
    </group>
  )
}
