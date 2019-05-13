import {APIGatewayEvent, Callback} from 'aws-lambda';
import {AuthHandler} from './auth.handler';
import * as http from 'request';
import {Endpoints} from '../utils/endpoints.util';
import {Response} from '../utils/response.util';
import {Realm, RealmStatuses} from '../models/realm.model';
import {LocaleHandler} from './locale.handler';

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

  async getAllRealms(event: APIGatewayEvent, callback: Callback) {
    await AuthHandler.getToken();
    const list = [],
      regions = Object.keys(new LocaleHandler().region);

    for (let i = 0; i < regions.length; i++) {
      const region = regions[i];
      await this.getRealmList(region)
        .then(status =>
          this.processRealms(region, status, list))
        .catch(console.error);
    }

    Response.send(list, callback);
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

  private processRealms(region: string, status: RealmStatuses, list: any[]) {
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
        isActive: true
      });
    });

    Object.keys(map)
      .forEach(id =>
        list.push(map[id]));
    return list;
  }
}
