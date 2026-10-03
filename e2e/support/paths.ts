import { join } from 'node:path'

const root = join(import.meta.dirname, '..', '.tmp')
// ORBIT_E2E_PORT lets two checkouts run their e2e suites at the same time.
const port = Number(process.env['ORBIT_E2E_PORT'] ?? 38_790)

export const E2E = {
  root,
  data: join(root, 'instance'),
  stateDir: join(root, 'instance', 'orbit'),
  port,
  baseURL: `http://127.0.0.1:${port}`,
  bundle: join(
    import.meta.dirname,
    '..',
    '..',
    'apps',
    'server',
    'dist',
    'orbit.mjs',
  ),
  fixtures: join(import.meta.dirname, '..', 'fixtures'),
} as const
