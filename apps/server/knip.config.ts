import { createKnipConfig } from '@syntopica/quality-config/knip'

// Placeholder until Task 17 wires the CLI: its runtime dependencies are
// declared now so the bundle's --external list and the lockfile are final.
export default createKnipConfig({
  framework: 'ts-package',
  entry: ['src/cli/main.ts'],
  ignoreDependencies: ['qrcode-terminal', '@types/qrcode-terminal'],
})
