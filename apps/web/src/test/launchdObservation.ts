import type { LaunchdObservation } from '../types/LaunchdObservation'

export const observation = (
  at: number,
  runs: number | null,
  lastExit: number | null,
  pid: number | null = null,
): LaunchdObservation => ({ label: 'com.example.job', at, runs, lastExit, pid })
