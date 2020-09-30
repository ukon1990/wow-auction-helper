import {AuthorizationUtil} from './authorization.util';
import * as nJwt from 'njwt';
import * as secureRandom from 'secure-random';

const getToken = (token?: string) => ({
  body: undefined,
  httpMethod: '',
  isBase64Encoded: false,
  multiValueHeaders: {},
  multiValueQueryStringParameters: undefined,
  path: '',
  pathParameters: undefined,
  queryStringParameters: undefined,
  requestContext: undefined,
  resource: '',
  stageVariables: undefined,
  headers: token ? {
    Authorization: 'Bearer ' + token
  } : {}
});

describe('AuthorizationUtil', () => {
  const signingKey = secureRandom(256, {type: 'Buffer'});
  describe('setToken', () => {
    afterEach(() => AuthorizationUtil.token = undefined);

    it('Can set token if valid date', () => {
      const jwt = nJwt.create({
        sub: '123',
        name: 'asdasd',
        exp: +new Date() * 2
      }, signingKey);
      AuthorizationUtil.setToken(getToken(jwt));
      expect(AuthorizationUtil.token).toBeTruthy();
    });

    it('Will not set token if invalid date', () => {
      AuthorizationUtil.setToken(
        getToken('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZ' +
      'XIiLCJpYXQiOjE1NzE2NjQ2NTUsImV4cCI6MTU' +
      '3MTY2NDYwNCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmF' +
      'tZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZ' +
      'XhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.TblJhIM9rQFmMU3qLTKrOhTWa2rScoFSUyaZoRGaj20')
      );
      expect(AuthorizationUtil.token).toBeFalsy();
    });

    it('Will not set token if Authorization is not passed in the header', () => {
      AuthorizationUtil.setToken(getToken());
      expect(AuthorizationUtil.token).toBeFalsy();
    });
  });
});