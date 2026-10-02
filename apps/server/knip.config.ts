import { createKnipConfig } from '@syntopica/quality-config/knip'

export default createKnipConfig({
  framework: 'ts-package',
  entry: ['src/cli/main.ts'],
})
