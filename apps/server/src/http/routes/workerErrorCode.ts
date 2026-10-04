export const workerErrorCode = (body: string): unknown => {
  try {
    return (JSON.parse(body) as { error?: unknown }).error
  } catch {
    return null
  }
}
