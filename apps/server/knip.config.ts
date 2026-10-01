import { createKnipConfig } from '@syntopica/quality-config/knip'

// Placeholder until Task 17 wires the server: its runtime dependencies are
// declared now so the bundle's --external list and the lockfile are final.
export default createKnipConfig({
  framework: 'ts-package',
  entry: ['src/cli/main.ts'],
  ignoreDependencies: [
    'hono',
    '@hono/node-server',
    'qrcode-terminal',
    '@types/qrcode-terminal',
  ],
})
