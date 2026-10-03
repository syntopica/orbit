import { BarRounded } from '@visx/shape'

import type { ColumnMarksProps } from '../../types/ColumnMarksProps'

// A 4 px rounded data end on the top segment, square at the baseline.
export const ColumnMarks = ({ column, fills, dimmed }: ColumnMarksProps) => (
  <g
    data-dimmed={dimmed}
    className="transition-opacity data-[dimmed=true]:opacity-40"
  >
    {column.rects.map((rect) =>
      rect.rounded ? (
        <BarRounded
          key={rect.key}
          x={column.x}
          y={rect.y}
          width={column.barWidth}
          height={rect.height}
          radius={Math.min(4, column.barWidth / 2, rect.height)}
          top
          className={fills[rect.key] ?? 'fill-unknown'}
        />
      ) : (
        <rect
          key={rect.key}
          x={column.x}
          y={rect.y}
          width={column.barWidth}
          height={rect.height}
          className={fills[rect.key] ?? 'fill-unknown'}
        />
      ),
    )}
  </g>
)
