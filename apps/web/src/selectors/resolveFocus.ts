import type { GraphModel } from '../types/GraphModel'
import { mostCentralPage } from './mostCentralPage'

// The selected page, else the last page viewed, else the most linked page.
export const resolveFocus = (
  model: GraphModel,
  page: string | undefined,
  remembered: string | null,
): number | null =>
  model.indexOf.get(page ?? '') ??
  model.indexOf.get(remembered ?? '') ??
  mostCentralPage(model)
