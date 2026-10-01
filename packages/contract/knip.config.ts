import { createKnipConfig } from '@syntopica/quality-config/knip'

export default createKnipConfig({
  framework: 'ts-package',
  // The barrel is the package's public API; its exports are consumed by other workspaces.
  includeEntryExports: false,
})
