import { identifierSchema } from '@orbit/contract'

export const validateWorkerJobsSearch = (search: Record<string, unknown>) => {
  const queue = identifierSchema.safeParse(search['queue'])
  const state = identifierSchema.safeParse(search['state'])
  const producer = identifierSchema.safeParse(search['producer'])
  return {
    ...(queue.success ? { queue: queue.data } : {}),
    ...(state.success ? { state: state.data } : {}),
    ...(producer.success ? { producer: producer.data } : {}),
    ...(typeof search['before'] === 'string' && search['before'].length <= 512
      ? { before: search['before'] }
      : {}),
  }
}
