export type LaunchdObservation = {
  readonly label: string
  readonly pid: number | null
  readonly runs: number | null
  readonly lastExit: number | null
  readonly at: number
}
