import type { LaunchdHistory } from './LaunchdHistory'

export type HistoryReadings = Pick<LaunchdHistory, 'observations' | 'runs'>
