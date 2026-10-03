import type { BrainBodyProps } from '../../types/BrainBodyProps'
import { BrainGraphColumn } from './BrainGraphColumn'
import { BrainSide } from './BrainSide'

// D15: two columns on wide screens; under them the side panels stack below.
export const BrainBody = ({ view, brain }: BrainBodyProps) => (
  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
    {view.data === null ? (
      <div />
    ) : (
      <BrainGraphColumn view={view} brain={brain} />
    )}
    <BrainSide brain={brain} />
  </div>
)
