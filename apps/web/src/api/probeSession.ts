import { apiFetch } from './apiFetch'

export const probeSession = async (): Promise<boolean> => {
  try {
    const response = await apiFetch('/api/snapshots')
    return response.status !== 401
  } catch {
    return true
  }
}
