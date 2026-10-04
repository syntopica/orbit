import { useSceneInstances3d } from '../../hooks/useSceneInstances3d'
import type { SceneNodes3dProps } from '../../types/SceneNodes3dProps'

export const SceneNodes3d = ({
  onHover,
  onSelect,
  ...part
}: SceneNodes3dProps) => {
  const mesh = useSceneInstances3d(part)
  const { nodes } = part.scene
  return (
    <instancedMesh
      key={nodes.length}
      ref={mesh}
      args={[undefined, undefined, nodes.length]}
      onPointerMove={(event) => {
        onHover(nodes[event.instanceId ?? -1]?.id ?? null)
      }}
      onPointerOut={() => {
        onHover(null)
      }}
      onClick={(event) => {
        event.stopPropagation()
        const node = nodes[event.instanceId ?? -1]
        if (node !== undefined) onSelect(node.id)
      }}
    >
      <sphereGeometry args={[1, 20, 14]} />
      <meshStandardMaterial roughness={0.45} />
    </instancedMesh>
  )
}
