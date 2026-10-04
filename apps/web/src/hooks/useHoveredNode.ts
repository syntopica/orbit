import { useState } from 'react'

// The node under the pointer, or null.
export const useHoveredNode = () => useState<string | null>(null)
