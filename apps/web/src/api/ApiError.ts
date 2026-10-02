export class ApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`HTTP ${String(status)}`)
    this.name = 'ApiError'
    this.status = status
  }
}
