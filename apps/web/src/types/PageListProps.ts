import type { GraphModel } from './GraphModel'

export type PageListProps = {
  readonly model: GraphModel
  readonly select: (id: string) => void
}
