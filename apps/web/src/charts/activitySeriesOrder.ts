import { PROVIDER_SERIES_ORDER } from './providerSeriesOrder'

// Stack order, bottom to top: providers, then failures on the cap.
export const ACTIVITY_SERIES_ORDER: readonly string[] = [
  ...PROVIDER_SERIES_ORDER,
  'failed',
]
