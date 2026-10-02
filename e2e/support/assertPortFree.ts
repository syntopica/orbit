import { createServer } from 'node:net'

import { E2E } from './paths'

export const assertPortFree = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const probe = createServer()
    probe.once('error', () =>
      reject(
        new Error(
          `e2e port ${E2E.port} is already in use; free it or change E2E.port in e2e/support/paths.ts`,
        ),
      ),
    )
    probe.listen(E2E.port, '127.0.0.1', () => probe.close(() => resolve()))
  })
