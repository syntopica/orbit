import type { BrainGraph } from '@orbit/contract'

import { formatCount } from './formatCount'

// The canvas's accessible name (D12).
export const formatGraphSummary = (graph: BrainGraph): string => {
  const pages = graph.nodes.length
  const links = graph.edges.length
  const orphans = graph.nodes.filter((node) => node.orphan).length
  return `Brain graph: ${formatCount(pages)} ${pages === 1 ? 'page' : 'pages'}, ${formatCount(links)} ${links === 1 ? 'link' : 'links'}, ${formatCount(orphans)} ${orphans === 1 ? 'orphan' : 'orphans'}`
}
