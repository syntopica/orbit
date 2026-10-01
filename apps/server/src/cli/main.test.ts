describe('main', () => {
  it('prints the program name', async () => {
    const write = vi.spyOn(process.stdout, 'write').mockReturnValue(true)
    await import('./main')
    expect(write).toHaveBeenCalledWith('orbit\n')
  })
})
