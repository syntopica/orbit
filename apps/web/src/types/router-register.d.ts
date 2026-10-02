import type { router } from '../router/router'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
