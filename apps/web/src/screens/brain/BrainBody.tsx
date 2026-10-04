import type { BrainBodyProps } from '../../types/BrainBodyProps'
import { BrainGraphColumn } from './BrainGraphColumn'
import { BrainSide } from './BrainSide'

// The graph spans the width; the panels that do not belong on it go below.
export const BrainBody = ({ view, brain }: BrainBodyProps) => (
  <div className="space-y-4">
    <BrainGraphColumn view={view} brain={brain} />
    <BrainSide brain={brain} model={view.model} />
  </div>
)
