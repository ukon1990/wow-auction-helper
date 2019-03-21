import {APIGatewayEvent, Callback} from 'aws-lambda';
import {AuthHandler} from './auth.handler';
import * as http from 'request';
import {Endpoints} from '../utils/endpoints.util';
import {Response} from '../utils/response.util';

export class RealmHandler {

  async getStatus(event: APIGatewayEvent, callback: Callback) {
    await AuthHandler.getToken();

    const body = JSON.parse(event.body);

    http.get(new Endpoints()
        .getPath(`realm/status?locale=en_GB`, body.region),
      (err, r, responseBody) => {
        try {
          Response.send(JSON.parse(responseBody), callback);
        } catch (error) {
          Response.error(callback, error, event);
        }
      });

  }
}
