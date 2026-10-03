import { communitySlots } from '../charts/communitySlots'
import { nodeColor } from '../charts/nodeColor'
import { nodeSize } from '../charts/nodeSize'
import { typeSlots } from '../charts/typeSlots'
import type { GraphModel } from '../types/GraphModel'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'
import type { GraphPalette } from '../types/GraphPalette'
import type { LayoutResult } from '../types/LayoutResult'
import type { NodeStyleOptions } from '../types/NodeStyleOptions'

export const toNodeAttributes = (
  model: GraphModel,
  layout: LayoutResult,
  options: NodeStyleOptions,
  palette: GraphPalette,
): GraphNodeAttributes[] => {
  const byType = typeSlots(model.types)
  const byCommunity = communitySlots(layout.community)
  return model.ids.map((id, index) => ({
    label: id,
    x: layout.x[index] ?? 0,
    y: layout.y[index] ?? 0,
    size: nodeSize(model.degree[index] ?? 0),
    color: nodeColor(
      {
        slot:
          options.colorBy === 'type'
            ? (byType.get(model.types[index] ?? '') ?? 6)
            : (byCommunity[index] ?? 6),
        orphan: model.orphan[index] === true,
        selected: options.selected === index,
        highlightOrphans: options.highlightOrphans,
      },
      palette,
    ),
    hidden: options.visible[index] !== true,
  }))
}
