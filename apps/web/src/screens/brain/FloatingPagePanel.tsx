import type { PagePanelProps } from '../../types/PagePanelProps'
import { PagePanel } from './PagePanel'

// Over the right edge of a framed graph from lg up; in the flow otherwise,
// including while the graph is still loading or has failed, and then first
// under the canvas.
export const FloatingPagePanel = (props: PagePanelProps) => (
  <div className="order-2 lg:group-data-[framed=true]:absolute lg:group-data-[framed=true]:inset-y-3 lg:group-data-[framed=true]:right-3 lg:group-data-[framed=true]:w-104 lg:group-data-[framed=true]:overflow-y-auto">
    <PagePanel {...props} />
  </div>
)
