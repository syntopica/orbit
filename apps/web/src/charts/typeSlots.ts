import { rankSlots } from './rankSlots'

export const typeSlots = (
  types: readonly string[],
): ReadonlyMap<string, number> => rankSlots(types, (a, b) => a.localeCompare(b))
