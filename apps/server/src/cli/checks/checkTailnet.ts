import type { DoctorCheck } from '../../types/DoctorCheck'

export const checkTailnet: DoctorCheck = (state) => {
  const { allowedHosts, allowedLogins } = state.config
  if (allowedHosts.length === 0) {
    return {
      name: 'tailnet',
      level: 'warn',
      detail: 'no allowedHosts: local access only',
    }
  }
  if (allowedLogins.length === 0) {
    return {
      name: 'tailnet',
      level: 'fail',
      detail:
        'allowedHosts set but allowedLogins empty: every tailnet request is refused',
    }
  }
  return {
    name: 'tailnet',
    level: 'ok',
    detail: `${String(allowedHosts.length)} host(s), ${String(allowedLogins.length)} login(s)`,
  }
}
