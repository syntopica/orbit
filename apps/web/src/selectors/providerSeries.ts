import { PROVIDER_SERIES_ORDER } from '../charts/providerSeriesOrder'

export const providerSeries = (provider: string): string =>
  PROVIDER_SERIES_ORDER.includes(provider) ? provider : 'other'
