import { UNTYPED } from '../charts/untypedType'
import { BRAIN_LABELS } from '../labels/brainLabels'

export const formatTypeName = (name: string | null): string => {
  if (name === null) return BRAIN_LABELS.otherTypes
  return name === UNTYPED ? BRAIN_LABELS.untyped : name
}
