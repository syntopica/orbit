import { readClusterId } from '../graph/readClusterId'
import type { GraphDepth } from '../types/GraphDepth'
import type { GraphScene } from '../types/GraphScene'
import { formatCount } from './formatCount'

// Says what the canvas shows, since it is no longer the whole wiki.
export const formatViewCaption = (
  depth: GraphDepth,
  focus: string | null,
  scene: GraphScene,
): string => {
  const shown = scene.nodes.length
  if (depth > 0)
    return `${formatCount(depth)} ${depth === 1 ? 'step' : 'steps'} around ${focus ?? '-'}: ${formatCount(shown)} ${shown === 1 ? 'page' : 'pages'}`
  const groups = scene.nodes.filter((node) => readClusterId(node.id) !== null)
  const opened = shown - groups.length
  return `Overview: ${formatCount(groups.length)} ${groups.length === 1 ? 'group' : 'groups'}${opened > 0 ? `, one opened into ${formatCount(opened)} pages` : ''}`
}
