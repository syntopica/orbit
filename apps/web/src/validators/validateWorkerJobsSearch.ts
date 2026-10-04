import { identifierSchema } from '@orbit/contract'

export const validateWorkerJobsSearch = (search: Record<string, unknown>) => ({
  ...(identifierSchema.safeParse(search['queue']).success
    ? { queue: search['queue'] as string }
    : {}),
  ...(identifierSchema.safeParse(search['state']).success
    ? { state: search['state'] as string }
    : {}),
  ...(identifierSchema.safeParse(search['producer']).success
    ? { producer: search['producer'] as string }
    : {}),
  ...(typeof search['before'] === 'string' && search['before'].length <= 512
    ? { before: search['before'] }
    : {}),
})
