import pako from 'pako';

export class Compression {
  public static decompress(base64: string): any {
    const compressData = atob(base64).split('').map(function (e) {
      return e.charCodeAt(0);
    }),
    output = pako.inflate(compressData),
    obj = JSON.parse(
      new Uint16Array(output).reduce((data, byte) => {
        return data + String.fromCharCode(byte);
      }, ''));
    return obj;
  }
}
