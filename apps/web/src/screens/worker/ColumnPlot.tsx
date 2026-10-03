import type { ColumnPlotProps } from '../../types/ColumnPlotProps'
import { ChartGrid } from './ChartGrid'
import { ColumnMarks } from './ColumnMarks'

// Grid, the shown bucket's band wash, then the columns; others dim.
export const ColumnPlot = ({ layout, fills, active }: ColumnPlotProps) => {
  const { frame } = layout
  const shown = layout.columns[active ?? -1]
  return (
    <>
      <ChartGrid layout={layout} />
      {shown === undefined ? null : (
        <rect
          x={shown.bandX}
          y={frame.top}
          width={shown.bandWidth}
          height={frame.height - frame.top - frame.bottom}
          className="fill-line/40"
        />
      )}
      {layout.columns.map((column, i) => (
        <ColumnMarks
          key={column.bandX}
          column={column}
          fills={fills}
          dimmed={active !== null && active !== i}
        />
      ))}
    </>
  )
}
