import type { EngineRunner } from './EngineRunner'
import type { LatestClipsDocuments } from './LatestClipsDocuments'

export type ClipsAdapterDeps = {
  readonly run: EngineRunner
  readonly cadenceMs: number
  readonly oldestDays?: number | undefined
  readonly latest?: LatestClipsDocuments | undefined
}
