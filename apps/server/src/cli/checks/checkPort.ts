import { createServer } from 'node:net'

import type { DoctorCheck } from '../../types/DoctorCheck'

export const checkPort: DoctorCheck = async (state) =>
  new Promise((resolve) => {
    const port = state.config.port
    const probe = createServer()
    probe.once('error', () => {
      resolve({
        name: 'port',
        level: 'warn',
        detail: `${String(port)} in use (orbit already running?)`,
      })
    })
    probe.listen(port, '127.0.0.1', () => {
      probe.close()
      resolve({ name: 'port', level: 'ok', detail: `${String(port)} free` })
    })
  })
