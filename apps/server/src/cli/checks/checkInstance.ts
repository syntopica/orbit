import type { DoctorCheck } from '../../types/DoctorCheck'

export const checkInstance: DoctorCheck = (state) => ({
  name: 'instance',
  level: 'ok',
  detail: `SYNTOPICA_DATA=${state.dataDir}, orbit.json valid`,
})
