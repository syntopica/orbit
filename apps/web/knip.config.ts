import { createKnipConfig } from '@syntopica/quality-config/knip'

// Placeholder until the web app imports the contract in a later task.
export default createKnipConfig({
  framework: 'vite-react',
  ignoreDependencies: ['@orbit/contract'],
})
