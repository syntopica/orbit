export const isPermissionDenied = (error: unknown): boolean =>
  error instanceof Error &&
  'code' in error &&
  (error.code === 'EACCES' || error.code === 'EPERM')
