export type LaunchctlState = {
  readonly state: string
  readonly pid: number | null
  readonly runs: number | null
  readonly lastExit: number | null
}
