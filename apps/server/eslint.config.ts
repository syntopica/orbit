import { createBaseConfig } from '@syntopica/eslint-config/base'
import { createCodeQualityConfig } from '@syntopica/eslint-config/code-quality'
import { createNodeConfig } from '@syntopica/eslint-config/node'

export default [
  ...createBaseConfig({ tsconfigRootDir: import.meta.dirname }),
  ...createNodeConfig(),
  ...createCodeQualityConfig(),
  {
    // The server reads operator-owned configuration from SYNTOPICA_DATA, and its
    // tests write fixtures into temporary directories: paths are never request input.
    files: ['src/fs/readJsonFile.ts', 'src/**/*.test.ts'],
    rules: { 'security/detect-non-literal-fs-filename': 'off' },
  },
]
