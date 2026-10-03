import { useParentSize } from '@visx/responsive'

// The chart's own width; a first render before measuring uses 640 px, and the
// SVG scales to its box either way, so nothing overflows meanwhile.
export const useChartWidth = () => {
  const { parentRef, width } = useParentSize({
    initialSize: { width: 640 },
    debounceTime: 50,
  })
  return { parentRef, width: width > 0 ? width : 640 }
}
