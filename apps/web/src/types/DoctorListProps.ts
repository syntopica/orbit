// Clips, brain and atrium checks share this shape; only atrium has severity.
export type DoctorListProps = {
  readonly doctor: {
    readonly ok: boolean
    readonly checks: readonly {
      readonly name: string
      readonly ok: boolean
      readonly code: string | null
      readonly severity?: 'ok' | 'warn' | 'broken'
    }[]
  }
  readonly note?: string
}
