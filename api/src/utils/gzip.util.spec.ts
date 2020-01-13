import {GzipUtil} from './gzip.util';

describe('GzipUtil', () => {
  it('Can decompress', async () => {
    const gzip = new GzipUtil();
    const obj = {name: 'xæøåpasd', alterEgo: 'y'};
    const compressed = await gzip.compress(obj);
    const decompressed: any = await gzip.decompress(compressed);
    expect(compressed instanceof Buffer).toBe(true);
    expect(compressed instanceof Object).toBe(false);
    expect(decompressed.name).toBe(obj.name);
    expect(decompressed instanceof Object).toBe(true);
    expect(decompressed instanceof Buffer).toBe(false);
  });
});
