import { useId } from 'react'

export const usePageSearch = () => ({ input: useId(), list: useId() })
