import { createKnipConfig } from '@syntopica/quality-config/knip'

export default createKnipConfig({
  framework: 'ts-package',
  includeEntryExports: false,
  ignoreDependencies: ['zod'],
})
