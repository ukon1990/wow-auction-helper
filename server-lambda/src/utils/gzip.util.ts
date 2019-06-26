const zlib = require('zlib');

export class GzipUtil {
  compress(input: any): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const gzip = zlib.createGzip();
      zlib.gzip(JSON.stringify(input),
        (error: Error | null, buffer: Buffer) => {
          if (error) {
            reject(error);
          } else {
            resolve(buffer);
          }
        });
    });
  }
}
