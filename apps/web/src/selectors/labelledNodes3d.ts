import { MAX_LABELS_3D } from '../charts/maxLabels3d'
import type { SceneNode } from '../types/SceneNode'

// Sprite labels cost a texture each: the always-labelled nodes, or the lit
// ones while a node is hovered, capped.
export const labelledNodes3d = (
  nodes: readonly SceneNode[],
  lit: ReadonlySet<string> | null,
): readonly SceneNode[] =>
  nodes
    .filter((node) => (lit === null ? node.forceLabel : lit.has(node.id)))
    .slice(0, MAX_LABELS_3D)
