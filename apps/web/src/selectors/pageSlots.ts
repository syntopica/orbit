import { communitySlots } from '../charts/communitySlots'
import { typeSlots } from '../charts/typeSlots'
import type { ColorMode } from '../types/ColorMode'
import type { GraphModel } from '../types/GraphModel'
import type { LayoutResult } from '../types/LayoutResult'

// Each page's series slot under the colour mode (D7).
export const pageSlots = (
  model: GraphModel,
  layout: LayoutResult,
  colorBy: ColorMode,
): readonly number[] => {
  if (colorBy === 'community') return communitySlots(layout.community)
  const slots = typeSlots(model.types)
  return model.types.map((type) => slots.get(type) ?? 6)
}
