describe('WoWHeadUtil', () => {
  let body;
  beforeAll(async () => {
    await fetch('https://www.wowhead.com/item=109118/blackrock-ore')
      .then(res => body = res)
      .catch(console.error);
  });

  it('can fetch wowhead', async () => {
    // 168704
    // Dregged: 301405
    expect(body).toBe('testing');
  });
});
