import type { AtriumContext } from '@orbit/contract'

export type ContextBlockCardProps = {
  readonly block: AtriumContext['blocks'][number]
}
