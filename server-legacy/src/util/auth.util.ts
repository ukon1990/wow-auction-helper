import * as http from 'request';
import {BLIZZARD} from './secrets';

export class AuthUtil {
  public static readonly timeInterval12Hours = 43200000;

  public static setToken(res?): void {
    http.get(`https://eu.battle.net/oauth/token?grant_type=client_credentials&client_id=${
        BLIZZARD.CLIENT_ID
        }&client_secret=${
        BLIZZARD.CLIENT_SECRET
        }&scope=wow.profile`,
      (err, r, body) => {
        const tokenResponse = JSON.parse(body);
        BLIZZARD.ACCESS_TOKEN = tokenResponse.access_token;
        console.log(`Updated access token to ${ BLIZZARD.ACCESS_TOKEN } at ${ new Date() }`);

        if (res) {
          try {
            res.send({success: true, response: tokenResponse});
          } catch (error) {
            res.send({success: false});
          }
        }
      });
  }

  static init() {
    AuthUtil.setToken();
    setInterval(() =>
        AuthUtil.setToken(),
      AuthUtil.timeInterval12Hours);
  }
}
