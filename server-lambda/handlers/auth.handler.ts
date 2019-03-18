import * as http from 'request';
import {BLIZZARD, AWS_DETAILS} from '../secrets';
import {APIGatewayEvent} from 'aws-lambda';

export class AuthHandler {
  public static getToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      http.get(`https://eu.battle.net/oauth/token?grant_type=client_credentials&client_id=${
          BLIZZARD.CLIENT_ID
          }&client_secret=${
          BLIZZARD.CLIENT_SECRET
          }&scope=wow.profile`,
        (err, r, body) => {
          const tokenResponse = JSON.parse(body);
          resolve(tokenResponse.access_token);
        });
    });
  }

  public static isAuthorizedIdentity(event: APIGatewayEvent): boolean {
    const requestIp = event.requestContext.identity.sourceIp,
      localIp = '127.0.0.1';
    const requestDomain = event.requestContext['domainName'],
      allowedDomain = AWS_DETAILS.ALLOWED_DOMAIN;

    return true;
  }
}
