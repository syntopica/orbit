import type { DoctorCheck } from '../../types/DoctorCheck'

export const checkAdminToken: DoctorCheck = (state) => {
  const row = state.authDb.prepare('SELECT 1 AS present FROM admin_token').get()
  return row === undefined
    ? { name: 'admin token', level: 'fail', detail: 'run: orbit token create' }
    : { name: 'admin token', level: 'ok', detail: 'present' }
}
