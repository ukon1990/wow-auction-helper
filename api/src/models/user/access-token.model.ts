import jwt_decode from 'jwt-decode';

export class AccessToken {
  sub: string; // Subject for whom the token refers to
  'token_use': string;
  scope: string;
  'auth_time': number;
  iss: string; // Who issued the token
  exp: number; // Expiration time (seconds)
  iat: number; // Issued at (seconds)
  version: number;
  jti: string; // JWT id -> Unique to the token
  'client_id': string; // Cognito client
  username: string;

  constructor(token: string) {
    if (!token) {
      return;
    }
    const decoded = jwt_decode(token);
    Object.keys(decoded)
      .forEach(k => this[k] = decoded[k]);

    this.exp = this.exp * 1000;
  }
}
