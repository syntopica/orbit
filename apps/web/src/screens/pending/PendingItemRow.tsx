import type { PendingView } from '@orbit/contract'

import { PENDING_STATE_TONES } from '../../labels/pendingStateTones'
import { PendingPlainText } from './PendingPlainText'
import { PendingRef } from './PendingRef'
import { PendingTitle } from './PendingTitle'
import { PendingTitleLinks } from './PendingTitleLinks'

// One dense row: the state in a fixed first column so titles align, the
// title cut by CSS (two lines on a phone, one on a desktop) and wrapped in
// full once the row is open.
export const PendingItemRow = ({
  item,
}: {
  item: PendingView['items'][number]
}) => (
  <details className="group/item min-w-0">
    <summary className="hover:bg-line/30 grid cursor-pointer list-none grid-cols-[5rem_minmax(0,1fr)] items-center gap-3 px-3 py-1.5 text-sm [&::-webkit-details-marker]:hidden">
      <span
        className={`justify-self-start rounded border px-2 py-0.5 text-xs uppercase ${PENDING_STATE_TONES[item.state] ?? 'border-line'}`}
      >
        {item.state}
      </span>
      <span className="line-clamp-2 min-w-0 wrap-break-word group-open/item:line-clamp-none md:line-clamp-none md:truncate md:group-open/item:whitespace-normal">
        <PendingTitle text={item.title} />
      </span>
    </summary>
    <div className="space-y-3 px-3 pb-3 md:pl-26">
      <PendingTitleLinks title={item.title} />
      {item.detail ? (
        <pre className="text-muted font-sans text-sm wrap-break-word whitespace-pre-wrap">
          <PendingPlainText text={item.detail} />
        </pre>
      ) : null}
      <PendingRef item={item} />
    </div>
  </details>
)
