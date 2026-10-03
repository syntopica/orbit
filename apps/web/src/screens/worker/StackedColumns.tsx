import { useStackedColumns } from '../../hooks/useStackedColumns'
import type { StackColumn } from '../../types/StackColumn'
import type { StackedColumnsProps } from '../../types/StackedColumnsProps'
import { ChartSlider } from './ChartSlider'
import { ChartTooltip } from './ChartTooltip'
import { ColumnPlot } from './ColumnPlot'
import { HitBands } from './HitBands'

// Hover, tap and the arrow keys all show the same bucket tooltip.
export const StackedColumns = <C extends StackColumn>(
  props: StackedColumnsProps<C>,
) => {
  const { columns, bucketMs, fills, label, height } = props
  const { parentRef, layout, focus } = useStackedColumns(
    columns,
    height,
    bucketMs,
  )
  const shown = columns[focus.active ?? columns.length - 1]
  const place = layout.columns[focus.active ?? -1]
  return (
    <div ref={parentRef} className="relative">
      <ChartSlider
        label={label}
        count={columns.length}
        valueText={shown === undefined ? '' : props.describe(shown)}
        width={layout.frame.width}
        height={height}
        focus={focus}
      >
        <ColumnPlot layout={layout} fills={fills} active={focus.active} />
        <HitBands
          bands={layout.columns.map((c) => ({
            x: c.bandX,
            width: c.bandWidth,
          }))}
          height={height}
          onShow={focus.show}
        />
      </ChartSlider>
      {place === undefined || shown === undefined ? null : (
        <ChartTooltip left={place.center} top={layout.frame.top}>
          {props.renderTooltip(shown)}
        </ChartTooltip>
      )}
    </div>
  )
}
