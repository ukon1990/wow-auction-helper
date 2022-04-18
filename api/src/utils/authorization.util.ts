import {APIGatewayEvent} from 'aws-lambda';
import {AccessToken} from '../models/user/access-token.model';
import {Group} from '../enums/group.enum';
import { COGNITO } from '../secrets';

export class AuthorizationUtil {
  static token: AccessToken;
  static tokenRaw: string;

  static isAdmin(token: AccessToken) {
    return token.groups.indexOf(Group.ADMIN) > -1;
  }

  /**
   * TODO: Read this -> https://github.com/awslabs/aws-support-tools/tree/master/Cognito/decode-verify-jwt
   * TODO: Use ? => https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.ts
   */
  static isValidToken({ headers }: APIGatewayEvent): AccessToken {
    if (headers && headers.Authorization) {
      const rawToken = headers.Authorization.replace('Bearer ', '');
      const token: AccessToken = new AccessToken(rawToken);
      console.log('Token', token);
      if (token.exp >= +new Date() &&
        token.iss === `https://cognito-idp.eu-west-1.amazonaws.com/${COGNITO.POOL_ID}`) {
        AuthorizationUtil.token = token;
        return token;
      }
    }
    return undefined;
  }

  static setToken({ headers }: APIGatewayEvent): boolean {
    if (headers && headers.Authorization) {
      AuthorizationUtil.tokenRaw = headers.Authorization.replace('Bearer ', '');
      const token: AccessToken = new AccessToken(AuthorizationUtil.tokenRaw);
      if (token.exp >= +new Date()) {
        AuthorizationUtil.token = token;
        return true;
      }
    }
    return false;
  }

  static refreshToken(): Promise<any> {
    /*
    const params = {
      ClientId: environment.cognitoClientId,
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: {
        REFRESH_TOKEN: AuthorizationUtil.tokenRaw
      }
    };*/
    return new Promise((resolve, reject) => {
      /*
      request.post({
        headers: {
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
          'Content-Type': 'application/x-amz-json-1.1'
        },
        url: `${environment.signInEndpoint}/oauth2/token`,
        body: params,
        json: true
      }, (error, r, body) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(body);
      });*/
      resolve();
    });
  }
}