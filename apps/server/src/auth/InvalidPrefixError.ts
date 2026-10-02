export class InvalidPrefixError extends Error {
  constructor() {
    super('prefix must be at least 8 hex characters')
    this.name = 'InvalidPrefixError'
  }
}
