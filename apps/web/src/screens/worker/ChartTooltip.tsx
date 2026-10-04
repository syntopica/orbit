// visx types the class component's state as `any`; nothing here reads it.
// type-coverage:ignore-next-line
import { TooltipWithBounds } from '@visx/tooltip'

import type { ChartTooltipProps } from '../../types/ChartTooltipProps'

// Flips to stay inside the chart's box; never takes the pointer.
export const ChartTooltip = ({ left, top, children }: ChartTooltipProps) => (
  <TooltipWithBounds
    left={left}
    top={top}
    applyPositionStyle
    unstyled
    role="tooltip"
    className="border-line bg-panel pointer-events-none z-10 rounded-lg border px-3 py-2 text-xs shadow-lg"
  >
    {children}
    {/* type-coverage:ignore-next-line */}
  </TooltipWithBounds>
)
