import {APIGatewayEvent, Callback} from 'aws-lambda';
import {AuthHandler} from './auth.handler';
import * as http from 'request';
import {Endpoints} from '../utils/endpoints.util';
import {Response} from '../utils/response.util';
import {Realm, RealmStatuses} from '../models/realm.model';
import {DatabaseUtil} from '../utils/database.util';
import {RealmQuery} from '../queries/realm.query';
import {HttpClientUtil} from '../utils/http-client.util';
import {S3Handler} from './s3.handler';
import {GzipUtil} from '../utils/gzip.util';
import {AuctionHouseStatus} from '../../../client/src/client/modules/auction/models/auction-house-status.model';

export class RealmHandler {

  async getStatus(event: APIGatewayEvent, callback: Callback) {
    await AuthHandler.getToken();

    const body = JSON.parse(event.body);

    this.getRealmList(body.region)
      .then(response =>
        Response.send(response, callback))
      .catch(error =>
        Response.error(callback, error, event));

  }

  getRealmByRegionAndName(region: string, realm: string) {
    console.log('Fetching realm status for ', region, realm);
    return new Promise((resolve, reject) => {
      new S3Handler().get(`wah-data-${region}`, `auctions/${region}/${realm}.json.gz`)
        .then(async (data) => {

          const house: AuctionHouseStatus = await new GzipUtil().decompress(data['Body'])
              .catch(console.error),
            conn = new DatabaseUtil(false);
          if (!house.autoUpdate) {
            console.log('Attempting ah activation id=', house.id);
            await conn.query(
              RealmQuery.activateHouse(house.id))
              .then(() => console.log('Successfully activated id=', house.id))
              .catch(console.error);
            new HttpClientUtil()
              .post(new Endpoints()
                  .getLambdaUrl('auction/update-one', region),
                house,
                true);
            house.autoUpdate = 1;
            house.isUpdating = 1;
          }
          await conn.query(
            RealmQuery.updateLastRequested(house.id))
            .then(() => {
            })
            .catch(console.error);
          conn.end();
          resolve(house);
        })
        .catch(reject);
    });
  }

  getAllRealmsFromS3(region = 'eu') {
    return new Promise((resolve, reject) => {
      new S3Handler().get(`wah-data-${region}`, `auctions/${region}/status.json.gz`)
        .then((data) => {
          resolve(data['Body']);
        })
        .catch(reject);
    });
  }

  getAllRealms(conn = new DatabaseUtil()) {
    return new Promise((resolve, reject) => {
      conn.query(RealmQuery.getAll())
        .then(resolve)
        .catch(reject);
    });
  }

  getRealmList(region: string): Promise<RealmStatuses> {
    const url = new Endpoints()
      .getPath(`realm/status?locale=en_GB`, region);
    return new Promise((resolve, reject) => {
      http.get(url,
        (err, r, responseBody) => {
          if (err) {
            reject(err);
            return;
          }
          try {
            resolve(JSON.parse(responseBody));
          } catch (error) {
            reject(error);
          }
        });
    });
  }

  private async processRealms(region: string, status: RealmStatuses, list: any[]) {
    const map = {};
    status.realms.forEach((realm: Realm) => {
      const id = realm.connected_realms
        .sort((a, b) =>
          a.localeCompare(b)).join(';');
      if (!map[id]) {
        map[id] = {
          id: Object.keys(map).length + list.length,
          region: region,
          realms: [],
          isActive: true,
          autoUpdate: region === 'eu' || region === 'us',
          isUpdating: false,
          lastChecked: undefined,
          lastModified: undefined
        };
      }
      map[id].realms.push({
        id: `${realm.slug}@${region}`,
        ahId: map[id].id,
        slug: realm.slug,
        name: realm.name,
        battlegroup: realm.battlegroup,
        timezone: realm.timezone,
        locale: realm.locale,
        isActive: true
      });
    });

    Object.keys(map)
      .forEach(id =>
        list.push(map[id]));
    return list;
  }

  private async addHouses(list: any[]) {
    for (let i = 0; i < list.length; i++) {
      const house = list[i];
      const query = RealmQuery.insertHouse(house);
      console.log(query);
      await new DatabaseUtil().query(query)
        .then(async res => {
          await this.addRealms(house, res);
        })
        .catch(console.error);
    }
  }

  private async addRealms(house, res) {
    house.id = res.insertId;
    for (let ir = 0; ir < house.realms.length; ir++) {
      const realm = house.realms[ir];
      realm.ahId = house.id;
      await new DatabaseUtil()
        .query(RealmQuery.insertRealm(realm))
        .then(() => {
        })
        .catch(console.error);
    }
  }

  async checkIfRealmIsInactive(bucket: string, fileName: string) {
    return new Promise((resolve, reject) => {
      const regex = /auctions\/[a-z]{2}\/[\w]{1,30}\.json\.gz/gi;
      if (fileName.indexOf('status.json.gz') === -1 && regex.exec(fileName)) {
        const [auctions, region, realm] = fileName.split('/');
        console.log('Files', {auctions, region, realm});
        new S3Handler().get(bucket, `${auctions}/${region}/status.json.gz`)
          .then(async (data: Buffer) => {
            await new GzipUtil().decompress(data)
              .then((statuses) => {
                console.log('statuses', statuses);
              })
              .catch(console.error);
            /*
            statuses.forEach(status => {
              if (status.slug === realm && status.region === region) {
                console.log('Found the realm!', status);
              }
            });*/
            resolve();
          })
          .catch(reject);
      } else {
        resolve();
      }
    });
  }
}
