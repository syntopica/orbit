export class DataDirError extends Error {
  constructor() {
    super('SYNTOPICA_DATA must be set to an absolute path')
    this.name = 'DataDirError'
  }
}
