import { access, constants } from 'node:fs/promises'

import type { DoctorCheck } from '../../types/DoctorCheck'

export const checkWorkerToken: DoctorCheck = async (state) => {
  const worker = state.config.worker
  if (worker === undefined)
    return { name: 'worker', level: 'ok', detail: 'not configured' }
  const readable = await access(worker.tokenFile, constants.R_OK).then(
    () => true,
    () => false,
  )
  return readable
    ? { name: 'worker', level: 'ok', detail: 'token file readable' }
    : { name: 'worker', level: 'fail', detail: 'token file not readable' }
}
