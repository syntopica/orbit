import type { CheckResult } from './CheckResult'
import type { OrbitState } from './OrbitState'

export type DoctorCheck = (
  state: OrbitState,
) => CheckResult | Promise<CheckResult>
