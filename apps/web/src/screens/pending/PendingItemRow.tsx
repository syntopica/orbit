import type { PendingView } from '@orbit/contract'

import { PendingRef } from './PendingRef'

export const PendingItemRow = ({
  item,
}: {
  item: PendingView['items'][number]
}) => (
  <details className="border-line bg-panel min-w-0 rounded-xl border p-3">
    <summary className="cursor-pointer wrap-break-word">
      <span className="border-line mr-2 inline-block rounded border px-2 py-0.5 text-xs uppercase">
        {item.state}
      </span>
      {item.title}
    </summary>
    <div className="mt-3 space-y-3 pl-1">
      {item.detail ? (
        <pre className="text-muted font-sans text-sm wrap-break-word whitespace-pre-wrap">
          {item.detail}
        </pre>
      ) : null}
      <PendingRef item={item} />
    </div>
  </details>
)
