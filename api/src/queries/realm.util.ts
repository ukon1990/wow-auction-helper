import {HttpClientUtil} from '../utils/http-client.util';
import {Endpoints} from '../utils/endpoints.util';
import {AuthHandler} from '../handlers/auth.handler';
import {RealmHandler} from '../handlers/realm.handler';
import {DatabaseUtil} from '../utils/database.util';
import {RealmQuery} from './realm.query';
import {RDSQueryUtil} from '../utils/query.util';
import {NameSpace} from '../enums/name-space.enum';
const PromiseThrottle: any = require('promise-throttle');

export class RealmUtil {
  static getSetConnectedRealmIdForHouses(): Promise<void> {
    const promiseThrottle = new PromiseThrottle({
      requestsPerSecond: 5,
      promiseImplementation: Promise
    }),
      promises = [];
    return new Promise(async (resolve, reject) => {
      const conn = new DatabaseUtil(false);
      conn.query(RealmQuery.getAllMinimal())
        .then(async (realms: {id, region, slug, connectedId}[]) => {
          realms.forEach(realm => {
            promises.push(
              promiseThrottle.add(async () =>
                this.handleRealmConnectedId(realm, conn)));
          });
          await Promise.all(promises);
          conn.end();
          resolve();
        })
        .catch(reject);
    });
  }

  private static async handleRealmConnectedId({ id, region, slug}, conn: DatabaseUtil) {
    return new Promise(async (resolve) => {
      const connectedId = await this.getConnectedRealmIdForHouse(id, region, slug)
        .catch(console.error);
      if (connectedId) {
        await conn.query(
          new RDSQueryUtil(`auction_houses`, false)
            .update(id, {connectedId}))
          .then(() => {
          })
          .catch(err => console.error('Could set connectedId', id, connectedId));
      } else {
        console.error('No connected id defined');
      }
      resolve(connectedId);
    });
  }

  static getConnectedRealmIdForHouse(id: number, region: string, slug: string): Promise<number> {
    return new Promise<any>(async (resolve, reject) => {
      await AuthHandler.getToken();
      const path = new Endpoints().getPath(`realm/${slug}`, region, NameSpace.DYNAMIC_RETAIL);
      new HttpClientUtil().get(path)
        .then(({body}) => {
          const url: string = body['connected_realm']['href'],
            regexResult = (/connected-realm\/[\d]{0,10}\?/gi).exec(url);
          if (regexResult[0]) {
            resolve(+regexResult[0]
              .replace('connected-realm/', '')
              .replace('?', ''));
          } else {
            reject('No connected realm id found');
          }
        })
        .catch(reject);
    });
  }
}
