import type { ChartLegendProps } from '../../types/ChartLegendProps'

// Swatches mirror the marks (rects for columns); names stay in text colour.
export const ChartLegend = ({ keys, swatches }: ChartLegendProps) => (
  <ul className="text-muted flex flex-wrap gap-x-4 gap-y-1 text-xs">
    {keys.map((key) => (
      <li key={key} className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className={`size-2.5 rounded-xs ${swatches[key] ?? 'bg-unknown'}`}
        />
        <span className="font-mono">{key}</span>
      </li>
    ))}
  </ul>
)
