import { MAX_LABELS_3D } from '../charts/maxLabels3d'
import type { SceneNode } from '../types/SceneNode'

// Sprite labels cost a texture each and stack when many face the camera: the
// largest always-labelled nodes, or the lit ones while a node is hovered,
// capped.
export const labelledNodes3d = (
  nodes: readonly SceneNode[],
  lit: ReadonlySet<string> | null,
): readonly SceneNode[] =>
  nodes
    .filter((node) => (lit === null ? node.forceLabel : lit.has(node.id)))
    .toSorted((a, b) => b.size - a.size)
    .slice(0, MAX_LABELS_3D)
