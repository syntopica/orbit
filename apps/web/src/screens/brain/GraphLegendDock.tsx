import type { BrainBodyProps } from '../../types/BrainBodyProps'
import { GraphLegend } from './GraphLegend'

// Bottom left over the canvas from lg up; under it otherwise.
export const GraphLegendDock = ({ view, brain }: BrainBodyProps) =>
  view.model === null ? null : (
    <div className="order-3 lg:absolute lg:bottom-3 lg:left-3 lg:max-w-[calc(100%-29rem)]">
      <GraphLegend
        model={view.model}
        colorBy={brain.search.color}
        communities={view.communities}
        highlightOrphans={brain.search.orphans}
        skipped={view.data?.skipped ?? 0}
        caption={view.caption}
        overview={brain.search.depth === 0}
      />
    </div>
  )
