import { createRoute } from '@tanstack/react-router'

import { LoginScreen } from '../screens/login/LoginScreen'
import { rootRoute } from './rootRoute'

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginScreen,
})
