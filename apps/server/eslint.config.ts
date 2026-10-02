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
    // State paths derive from SYNTOPICA_DATA, never request input.
    files: [
      'src/fs/readJsonFile.ts',
      'src/adapters/worker/readWorkerToken.ts',
      'src/adapters/synthetic/createSyntheticAdapter.ts',
      'src/state/ensureStateDir.ts',
      'src/state/openDatabase.ts',
      'src/**/*.test.ts',
      'src/test/**/*.ts',
    ],
    rules: { 'security/detect-non-literal-fs-filename': 'off' },
  },
  {
    // Static web files: the path is checked by isUnsafeWebPath and realpath-confined to webRoot.
    files: [
      'src/http/resolveWebFile.ts',
      'src/http/resolveWebRoot.ts',
      'src/http/serveWeb.ts',
    ],
    rules: { 'security/detect-non-literal-fs-filename': 'off' },
  },
]
