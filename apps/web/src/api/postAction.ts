import { actionFailure } from './actionFailure'
import { apiFetch } from './apiFetch'

export const postAction = async (path: string): Promise<string> => {
  const response = await apiFetch(path, { method: 'POST' })
  if (!response.ok) throw await actionFailure(response)
  const body: unknown = await response.json()
  if (
    typeof body !== 'object' ||
    body === null ||
    !('id' in body) ||
    typeof body.id !== 'string'
  )
    throw new Error('Invalid action response')
  return body.id
}
