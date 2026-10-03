import { rankSlots } from './rankSlots'

// Communities have no names, so their size rank is their only stable order.
export const communitySlots = (
  community: readonly number[],
): readonly number[] => {
  const slots = rankSlots(community, (a, b) => a - b)
  return community.map((id) => slots.get(id) ?? 6)
}
