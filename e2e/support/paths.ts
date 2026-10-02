import { join } from 'node:path'

const root = join(import.meta.dirname, '..', '.tmp')
const port = 38_790

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
