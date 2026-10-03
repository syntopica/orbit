import { UNTYPED } from '../../charts/untypedType'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { PageListProps } from '../../types/PageListProps'

// D12: the keyboard and screen-reader path to every page, WebGL or not.
export const PageList = ({ model, select }: PageListProps) => (
  <details className="border-line bg-panel rounded-xl border p-4">
    <summary className="cursor-pointer font-semibold">
      {BRAIN_LABELS.showPages}
    </summary>
    <div className="mt-3 max-h-96 overflow-auto">
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
        <tbody>
          {model.ids.map((id, index) => (
            <tr key={id}>
              <td>
                <button
                  type="button"
                  className="cursor-pointer font-mono hover:underline"
                  onClick={() => {
                    select(id)
                  }}
                >
                  {id}
                </button>
              </td>
              <td>
                {model.types[index] === UNTYPED
                  ? BRAIN_LABELS.untyped
                  : model.types[index]}
              </td>
              <td>{model.degree[index]}</td>
              <td>
                {model.orphan[index] === true
                  ? BRAIN_LABELS.yes
                  : BRAIN_LABELS.no}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </details>
)
