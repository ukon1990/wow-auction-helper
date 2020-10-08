import {APIGatewayEvent, Callback} from 'aws-lambda';
import {AuthHandler} from './auth.handler';
import * as http from 'request';
import {Endpoints} from '../utils/endpoints.util';
import {Response} from '../utils/response.util';
import {Realm, RealmStatuses} from '../models/realm.model';
import {DatabaseUtil} from '../utils/database.util';
import {RealmQuery} from '../queries/realm.query';
import {S3Handler} from './s3.handler';
import {GzipUtil} from '../utils/gzip.util';

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
