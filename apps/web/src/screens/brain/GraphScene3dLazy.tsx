import { lazy } from 'react'

// Its own chunk with three.js, loaded only when 3D is asked for (spec 11).
export const GraphScene3dLazy = lazy(async () => import('./GraphScene3d'))
