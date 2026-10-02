import { QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'

import { queryClient } from './api/queryClient'
import { AppRouter } from './router/AppRouter'

export const App = () => (
  <MotionConfig reducedMotion="user">
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  </MotionConfig>
)
