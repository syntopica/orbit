import { formatViewCaption } from '../formatters/formatViewCaption'
import type { GraphDepth } from '../types/GraphDepth'
import type { GraphModel } from '../types/GraphModel'
import type { GraphScene } from '../types/GraphScene'

// The legend's line about the view; empty until a scene is laid out.
export const selectViewCaption = (
  depth: GraphDepth,
  model: GraphModel | null,
  focus: number | null,
  scene: GraphScene | null,
): string =>
  model === null || scene === null
    ? ''
    : formatViewCaption(depth, model.ids[focus ?? -1] ?? null, scene)
