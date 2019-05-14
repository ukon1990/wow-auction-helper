import {APIGatewayEvent, Callback} from 'aws-lambda';
import {AuthHandler} from './auth.handler';
import * as http from 'request';
import {Endpoints} from '../utils/endpoints.util';
import {Response} from '../utils/response.util';
import {Realm, RealmStatuses} from '../models/realm.model';
import {LocaleHandler} from './locale.handler';
import {DatabaseUtil} from '../utils/database.util';
import {RealmQuery} from '../queries/realm.query';

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

  getRealmByRegionAndName(event: APIGatewayEvent, callback: Callback) {
    const params = event.pathParameters;
    new DatabaseUtil()
      .query(
        RealmQuery.getHouseForRealm(params.region, params.realm))
      .then(rows =>
        Response.send(
          rows.length > 0 ? rows[0] : {},
          callback))
      .catch(error =>
        Response.error(callback, error, event));
  }

  getAllRealms(event: APIGatewayEvent, callback: Callback) {
    new DatabaseUtil()
      .query(RealmQuery.getAll())
      .then(res =>
        Response.send(res, callback))
      .catch(error =>
        Response.error(callback, error, event));
  }

  async getAllRealmsGrouped(event: APIGatewayEvent, callback: Callback) {
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

    // this.addHouses(list);
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

}
