import type { TrendSlot } from './TrendSlot'
import type { TrendSpec } from './TrendSpec'

export type TrendLine = TrendSpec &
  TrendSlot & { readonly values: readonly (number | null)[] }
