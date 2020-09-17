import { BLIZZARD, AWS_DETAILS } from '../secrets';
import { APIGatewayEvent } from 'aws-lambda';
import {HttpClientUtil} from '../utils/http-client.util';

export class AuthHandler {
  public static getToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!BLIZZARD.ACCESS_TOKEN) {
        new HttpClientUtil().post(`https://eu.battle.net/oauth/token?grant_type=client_credentials&client_id=${
          BLIZZARD.CLIENT_ID
        }&client_secret=${BLIZZARD.CLIENT_SECRET}&scope=wow.profile`, {})
          .then(({body}) => {
            const tokenResponse = body;
            BLIZZARD.ACCESS_TOKEN = tokenResponse.access_token;
            resolve(tokenResponse.access_token);
          })
          .catch(error => {
            reject({message: 'Empty response for token', error});
          });
      } else {
        resolve(BLIZZARD.ACCESS_TOKEN);
      }
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
