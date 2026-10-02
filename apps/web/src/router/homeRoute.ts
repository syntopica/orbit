import { createRoute } from '@tanstack/react-router'

import { HomeScreen } from '../screens/home/HomeScreen'
import { shellRoute } from './shellRoute'

export const homeRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/',
  component: HomeScreen,
})
