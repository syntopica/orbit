import { UNTYPED } from '../../charts/untypedType'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { PageListProps } from '../../types/PageListProps'

export const PageListRows = ({ model, select }: PageListProps) => (
  <tbody>
    {model.ids.map((id, index) => (
      <tr key={id}>
        <td>
          <button
            type="button"
            className="cursor-pointer font-mono break-all hover:underline"
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
          {model.orphan[index] === true ? BRAIN_LABELS.yes : BRAIN_LABELS.no}
        </td>
      </tr>
    ))}
  </tbody>
)
