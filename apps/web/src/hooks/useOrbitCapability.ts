import { useMemo } from 'react'

import { canRenderOrbit3d } from '../geometry/canRenderOrbit3d'

export const useOrbitCapability = (
  isPhone: boolean,
  animate: boolean,
): boolean =>
  useMemo(() => canRenderOrbit3d(isPhone || !animate), [isPhone, animate])
