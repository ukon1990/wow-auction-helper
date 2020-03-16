import {APIGatewayEvent, Callback} from 'aws-lambda';
import {Endpoints} from '../utils/endpoints.util';
import {Response} from '../utils/response.util';
import {AuthHandler} from './auth.handler';
import {bool} from 'aws-sdk/clients/signer';
import {HttpClientUtil} from '../utils/http-client.util';

const request = require('request');

export class CharacterHandler {
  async get(region: string, realm: string, name: string, withFields: boolean, locale: string) {
    await AuthHandler.getToken();
    return new Promise((resolve, reject) => {
      const url = new Endpoints()
        .getPath(
          `character/${
            encodeURIComponent(realm)
          }/${
            encodeURIComponent(name)
          }?${
            this.getFields(withFields)
          }locale=${
            locale
          }`,
          region, 'profile');
      new HttpClientUtil().get(url)
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          console.error('could not get character', error);
          reject(error);
        });
    });
  }

  private getFields(withFields) {
    return withFields ?
      'fields=professions,statistics,pets,petSlots,mounts&' : '';
  }
}
