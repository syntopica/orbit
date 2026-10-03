import { useEffect, useMemo } from 'react'

import { createOrbitGlowTexture } from '../geometry/createOrbitGlowTexture'

export const useOrbitGlowTexture = () => {
  const texture = useMemo(() => createOrbitGlowTexture(), [])
  useEffect(() => {
    return () => {
      texture.dispose()
    }
  }, [texture])
  return texture
}
