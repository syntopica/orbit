import { Canvas } from '@react-three/fiber'

import { useScene3d } from '../../hooks/useScene3d'
import type { GraphScene3dProps } from '../../types/GraphScene3dProps'
import { SceneControls3d } from './SceneControls3d'
import { SceneEdges3d } from './SceneEdges3d'
import { SceneLabels3d } from './SceneLabels3d'
import { SceneNodes3d } from './SceneNodes3d'

// The 2D scene in three dimensions: same nodes, colours and selection; the
// stage around it carries the accessible name.
const GraphScene3d = ({ scene, palette, onSelect }: GraphScene3dProps) => {
  const { part, hover } = useScene3d(scene, palette)
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 2]}
      frameloop="demand"
      camera={{ position: [0, 0, 32], fov: 50 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      onPointerMissed={() => {
        onSelect(null)
      }}
    >
      <ambientLight intensity={1.6} />
      <directionalLight position={[10, 12, 16]} intensity={1.4} />
      <SceneControls3d />
      <SceneEdges3d {...part} />
      <SceneNodes3d {...part} onHover={hover} onSelect={onSelect} />
      <SceneLabels3d {...part} />
    </Canvas>
  )
}

export default GraphScene3d
