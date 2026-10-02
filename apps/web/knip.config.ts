import { createKnipConfig } from '@syntopica/quality-config/knip'

// @orbit/contract is imported by later tasks; the fonts are imported
// from styles.css, which knip does not follow.
export default createKnipConfig({
  framework: 'vite-react',
  ignoreDependencies: [
    '@orbit/contract',
    '@fontsource/geist-sans',
    '@fontsource/geist-mono',
  ],
})
