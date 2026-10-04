import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { PageListProps } from '../../types/PageListProps'
import { PageListRows } from './PageListRows'

// D12: the keyboard and screen-reader path to every page, WebGL or not.
export const PageList = ({ model, select }: PageListProps) => (
  <details className="border-line bg-panel rounded-xl border p-4">
    <summary className="cursor-pointer font-semibold">
      {BRAIN_LABELS.showPages}
    </summary>
    <div
      role="region"
      aria-label="Pages table"
      tabIndex={0}
      className="mt-3 max-h-96 overflow-auto"
    >
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{BRAIN_LABELS.pagesCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{BRAIN_LABELS.colPage}</th>
            <th scope="col">{BRAIN_LABELS.colType}</th>
            <th scope="col">{BRAIN_LABELS.colLinks}</th>
            <th scope="col">{BRAIN_LABELS.colOrphan}</th>
          </tr>
        </thead>
        <PageListRows model={model} select={select} />
      </table>
    </div>
  </details>
)
