import jwt_decode from 'jwt-decode';
import {Group} from '../../enums/group.enum';

export class AccessToken {
  sub: string; // Subject for whom the token refers to
  token_use: string;
  scope: string;
  auth_time: number;
  iss: string; // Who issued the token
  exp: number; // Expiration time (seconds)
  iat: number; // Issued at (seconds)
  version: number;
  jti: string; // JWT id -> Unique to the token
  client_id: string; // Cognito client
  username: string;
  groups: Group[];

  constructor(token: string) {
    if (!token) {
      return;
    }
    const decoded = jwt_decode(token);
    Object.keys(decoded)
      .forEach(k => {
        if (k === 'cognito:groups') {
          this.groups = decoded[k];
        } else {
          this[k] = decoded[k];
        }
      });

    this.exp = this.exp * 1000;
  }

  hasGroup(group: Group): boolean {
    return !!this.groups.filter(g => group === g).length;
  }
}