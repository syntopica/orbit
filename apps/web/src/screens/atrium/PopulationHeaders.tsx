import { ATRIUM_LABELS } from '../../labels/atriumLabels'

export const PopulationHeaders = () => (
  <thead className="text-muted text-left text-xs">
    <tr>
      <th scope="col" className="py-1 pr-3 font-normal">
        {ATRIUM_LABELS.model}
      </th>
      <th scope="col" className="py-1 pr-3 text-right font-normal">
        {ATRIUM_LABELS.intended}
      </th>
      <th scope="col" className="py-1 pr-3 text-right font-normal">
        {ATRIUM_LABELS.indexed}
      </th>
      <th scope="col" className="py-1 text-right font-normal">
        {ATRIUM_LABELS.notIndexed}
      </th>
    </tr>
  </thead>
)
