import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {ProfessionService} from '../profession/service';
import {Response} from '../utils/response.util';
import {CharacterService} from './service';

export const getCharacter = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const {region, realm, name, withFields, locale} = JSON.parse(event.body);
  CharacterService.get(region, realm, name, locale)
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err.message, event, err.code));
};
