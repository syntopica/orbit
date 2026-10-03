import { ACTIVITY_LABELS } from '../../labels/activityLabels'

export const ActivityTableHead = () => (
  <thead className="text-muted text-left">
    <tr>
      <th scope="col" className="py-1 pr-3">
        {ACTIVITY_LABELS.time}
      </th>
      <th scope="col" className="py-1 pr-3">
        {ACTIVITY_LABELS.attempts}
      </th>
      <th scope="col" className="py-1 pr-3 text-right">
        {ACTIVITY_LABELS.failedHeader}
      </th>
      <th scope="col" className="py-1 pr-3 text-right">
        {ACTIVITY_LABELS.samplingHeader}
      </th>
      <th scope="col" className="py-1 text-right">
        {ACTIVITY_LABELS.meanHeader}
      </th>
    </tr>
  </thead>
)
