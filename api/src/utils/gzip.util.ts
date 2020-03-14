const zlib = require('zlib');

export class GzipUtil {
  compress(input: any): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
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

  decompress(input: Buffer): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      zlib.gunzip(input, (error, data) => {
        try {
          if (error) {
            reject(error);
          } else {
            resolve(JSON.parse(data.toString()));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}
