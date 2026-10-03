import { createKnipConfig } from '@syntopica/quality-config/knip'

// The fonts are imported from styles.css, which knip does not follow.
export default createKnipConfig({
  framework: 'vite-react',
  ignoreDependencies: ['@fontsource/geist-sans', '@fontsource/geist-mono'],
})
