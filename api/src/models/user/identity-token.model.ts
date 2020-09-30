import jwt_decode from 'jwt-decode';

export class IdentityToken {
  sub: string;
  aud: string;
  'email_verified': boolean;
  iss: string;
  exp: number;
  iat: number;
  email: string;

  /* istanbul ignore next */
  constructor(token: string) {
    const decoded = jwt_decode(token);
    Object.keys(decoded)
      .forEach(k => this[k] = decoded[k]);
  }
}
