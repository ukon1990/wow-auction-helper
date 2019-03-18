import * as http from 'request';
import { BLIZZARD } from '../secrets';

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
        
                /*
                if (res) {
                  try {
                    res.send({success: true, response: tokenResponse});
                  } catch (error) {
                    res.send({success: false});
                  }
                }*/
              });
        });
    }
}
