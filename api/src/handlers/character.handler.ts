import {APIGatewayEvent, Callback} from 'aws-lambda';
import {Endpoints} from '../utils/endpoints.util';
import {Response} from '../utils/response.util';
import {AuthHandler} from './auth.handler';
import {bool} from 'aws-sdk/clients/signer';
import {HttpClientUtil} from '../utils/http-client.util';
import {CharacterUtil} from '../utils/character.util';

const request = require('request');

export class CharacterHandler {
  async get(region: string, realm: string, name: string, withFields: boolean, locale: string) {
    await AuthHandler.getToken();
    return CharacterUtil.get(region, realm, name, locale);
  }

  private getFields(withFields) {
    return withFields ?
      'fields=professions,statistics,pets,petSlots,mounts&' : '';
  }
}
