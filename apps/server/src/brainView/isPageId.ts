import { pageIdSchema } from '@orbit/contract'

export const isPageId = (value: string): boolean =>
  pageIdSchema.safeParse(value).success
