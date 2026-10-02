import { identifierSchema } from '@orbit/contract'

export const isIdentifier = (
  value: string | null | undefined,
): value is string => identifierSchema.safeParse(value).success
