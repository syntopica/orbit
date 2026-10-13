import type Sigma from 'sigma'

import type { GraphEdgeAttributes } from './GraphEdgeAttributes'
import type { GraphNodeAttributes } from './GraphNodeAttributes'

// The third constructor argument of Sigma 4: settings and styles.
export type GraphSigmaOptions = NonNullable<
  ConstructorParameters<
    typeof Sigma<GraphNodeAttributes, GraphEdgeAttributes>
  >[2]
>
