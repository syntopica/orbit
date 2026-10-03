import type { BrainSideProps } from '../../types/BrainSideProps'
import { ChecksSection } from './ChecksSection'
import { PagePanel } from './PagePanel'
import { RelatedPanel } from './RelatedPanel'

export const BrainSide = ({ brain }: BrainSideProps) => {
  const { search, select } = brain
  return (
    <div className="min-w-0 space-y-4">
      {search.page === undefined ? null : (
        <PagePanel
          key={search.page}
          id={search.page}
          search={search}
          select={select}
        />
      )}
      <RelatedPanel selectedId={search.page ?? null} search={search} />
      <ChecksSection brain={brain} />
    </div>
  )
}
