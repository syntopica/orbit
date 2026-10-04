import type { AppDeps } from '../types/AppDeps'
import { buildTestApp } from './buildTestApp'

// A test app whose session already re-entered the admin token, for routes
// behind the action step-up.
export const buildSteppedApp = (overrides: Partial<AppDeps> = {}) =>
  buildTestApp(overrides, { stepUp: true })
