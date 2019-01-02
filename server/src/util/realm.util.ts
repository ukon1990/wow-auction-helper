import {Endpoints} from '../endpoints';
import * as http from 'request';

export class RealmUtil {
  static getRealmStatus(res, req) {
    http.get(new Endpoints()
        .getPath(`realm/status?locale=en_GB`, req.params.region),
      (err, r, body) => {
        try {
          res.send(JSON.parse(body));
        } catch (error) {
          res.send(body);
        }
      });
  }
}
