import type { BrainSideProps } from '../../types/BrainSideProps'
import { ChecksSection } from './ChecksSection'
import { PageList } from './PageList'
import { RelatedPanel } from './RelatedPanel'

export const BrainSide = ({ brain, model }: BrainSideProps) => {
  const { search, select } = brain
  return (
    <div className="gap-4 *:mb-4 *:break-inside-avoid lg:columns-2 2xl:columns-3">
      <RelatedPanel selectedId={search.page ?? null} search={search} />
      <ChecksSection brain={brain} />
      {model === null ? null : <PageList model={model} select={select} />}
    </div>
  )
}
