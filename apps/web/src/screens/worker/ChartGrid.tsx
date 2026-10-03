import type { ChartGridProps } from '../../types/ChartGridProps'

// One y axis: hairline solid gridlines with whole-count ticks, time below.
export const ChartGrid = ({ layout }: ChartGridProps) => {
  const { frame } = layout
  return (
    <g aria-hidden="true" className="fill-muted text-[10px]">
      {layout.yTicks.map((tick) => (
        <g key={tick.label}>
          <line
            x1={frame.left}
            x2={frame.width - frame.right}
            y1={tick.at}
            y2={tick.at}
            className="stroke-line"
            shapeRendering="crispEdges"
          />
          <text x={frame.left - 6} y={tick.at} dy="0.32em" textAnchor="end">
            {tick.label}
          </text>
        </g>
      ))}
      {layout.xTicks.map((tick) => (
        <text
          key={`${String(tick.at)}:${tick.label}`}
          x={tick.at}
          y={frame.height - 4}
          textAnchor="middle"
        >
          {tick.label}
        </text>
      ))}
    </g>
  )
}
