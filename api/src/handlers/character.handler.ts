import {APIGatewayEvent, Callback} from 'aws-lambda';
import {Endpoints} from '../utils/endpoints.util';
import {Response} from '../utils/response.util';
import {AuthHandler} from './auth.handler';

const request = require('request');

export class CharacterHandler {
  async get(event: APIGatewayEvent, callback: Callback) {
    await AuthHandler.getToken();

    const body = JSON.parse(event.body);
    const url = new Endpoints()
      .getPath(
        `character/${
          encodeURIComponent(body.realm)
          }/${
          encodeURIComponent(body.name)
          }?${
          this.getFields(body.withFields)
          }locale=${
          body.locale
          }`,
        body.region);

    request.get(url,
      body.region,
      (error, response, responseBody) => {
        if (error) {
          Response.error(callback, error, event);
          console.error('could not get character', error);
          return;
        }
        Response.send(JSON.parse(responseBody), callback);
      });
  }

  private getFields(withFields) {
    return withFields ?
      'fields=professions,statistics,pets,petSlots,mounts&' : '';
  }
}
