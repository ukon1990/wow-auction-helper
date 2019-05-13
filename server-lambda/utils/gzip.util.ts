const zlib = require('zlib');
export class GzipUtil {
  compress(input: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const gzip = zlib.createGzip();
      zlib.gzip(JSON.stringify(input), (error, buffer) => {
        if (error) {
          reject(error);
        } else {
          resolve(
            buffer.toString('base64'));
        }
      });
    });
  }
}
