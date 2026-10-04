import type { AtriumView } from '@orbit/contract'

export type AtriumDoctorSectionProps = {
  readonly doctor: AtriumView['doctor']
  readonly now: number
}
