import * as crypto from 'crypto';

export class IdUtil {
  static generate(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}