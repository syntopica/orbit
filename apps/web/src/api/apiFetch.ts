export const apiFetch = async (
  path: string,
  init: RequestInit = {},
): Promise<Response> => {
  const headers = new Headers(init.headers)
  const method = (init.method ?? 'GET').toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') {
    headers.set('X-Orbit', '1')
    headers.set('Content-Type', 'application/json')
  }
  return fetch(path, { ...init, method, headers, credentials: 'same-origin' })
}
