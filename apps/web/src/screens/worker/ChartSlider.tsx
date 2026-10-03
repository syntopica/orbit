import type { ChartSliderProps } from '../../types/ChartSliderProps'

// One tab stop per chart: a slider over its buckets whose value text is the
// bucket's numbers, so keyboard and screen-reader users get the tooltip too.
export const ChartSlider = ({
  label,
  count,
  valueText,
  width,
  height,
  focus,
  children,
}: ChartSliderProps) => (
  <svg
    role="slider"
    tabIndex={0}
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={Math.max(0, count - 1)}
    aria-valuenow={focus.active ?? Math.max(0, count - 1)}
    aria-valuetext={valueText}
    viewBox={`0 0 ${String(width)} ${String(height)}`}
    width="100%"
    height={height}
    className="block touch-pan-y overflow-visible rounded-md"
    onKeyDown={focus.onKeyDown}
    onFocus={focus.onFocus}
    onBlur={focus.clear}
    onPointerLeave={focus.clear}
  >
    {children}
  </svg>
)
