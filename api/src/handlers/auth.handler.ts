import * as http from 'request';
import {APIGatewayEvent, Callback} from 'aws-lambda';
import * as btoa from 'btoa';
import {BLIZZARD, AWS_DETAILS} from '../secrets';

export class AuthHandler {
  public static getToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!BLIZZARD.ACCESS_TOKEN) {
        http.get(
          `https://eu.battle.net/oauth/token?grant_type=client_credentials&client_id=${
            BLIZZARD.CLIENT_ID
          }&client_secret=${BLIZZARD.CLIENT_SECRET}&scope=wow.profile`,
          (err, r, body) => {
            if (body) {
              const tokenResponse = JSON.parse(body);
              BLIZZARD.ACCESS_TOKEN = tokenResponse.access_token;
              resolve(tokenResponse.access_token);
            } else {
              reject({message: 'Empty response for token'});
            }
          }
        );
      } else {
        resolve(BLIZZARD.ACCESS_TOKEN);
      }
    });
  }

  static verifyToken(region: string, token: string): Promise<any> {
    return new Promise<any>(((resolve, reject) =>
      http.get(
        `https://${region}.battle.net/oauth/check_token?token=${token}`, (error, response, body) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(JSON.parse(body));
        })));
  }

  public static isAuthorizedIdentity(event: APIGatewayEvent): boolean {
    const requestIp = event.requestContext.identity.sourceIp,
      localIp = '127.0.0.1';
    const requestDomain = event.requestContext['domainName'],
      allowedDomain = AWS_DETAILS.ALLOWED_DOMAIN;

    return true;
  }

  getAccessToken(region: string, code: string, redirectURI: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      http.post({
          headers: {
            Authorization: `Basic ${btoa(`${BLIZZARD.CLIENT_ID}:${BLIZZARD.CLIENT_SECRET}`)}`,
            Origin: redirectURI,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          url: `https://${region}.battle.net/oauth/token`,
          form: {
            code: code,
            redirect_uri: redirectURI,
            grant_type: 'authorization_code',
            scope: 'wow.profile'
          }
        },
        (err, response, body) => {
          if (err) {
            reject(err);
          } else {
            resolve(JSON.parse(body));
          }
        });
    });
  }

  checkToken(region: string, token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      AuthHandler.verifyToken(region, token)
        .then(resolve)
        .catch(reject);
    });
  }
}
