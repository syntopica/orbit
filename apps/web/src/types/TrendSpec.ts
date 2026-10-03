import type { Metric } from '@orbit/contract'

export type TrendSpec = { readonly key: Metric['key']; readonly label: string }
