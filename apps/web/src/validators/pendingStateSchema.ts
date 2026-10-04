import { z } from 'zod'

export const pendingStateSchema = z.enum([
  'open',
  'partial',
  'blocked',
  'issue',
  'failed',
  'waiting',
])
