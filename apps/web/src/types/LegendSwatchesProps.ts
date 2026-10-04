import type { GraphLegendProps } from './GraphLegendProps'

export type LegendSwatchesProps = Pick<
  GraphLegendProps,
  'model' | 'colorBy' | 'communities' | 'highlightOrphans'
>
