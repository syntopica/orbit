import type { GraphModel } from './GraphModel'

export type PageSearchProps = {
  readonly model: GraphModel
  readonly select: (id: string) => void
}
