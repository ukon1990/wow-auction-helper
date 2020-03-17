import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {CharacterHandler} from '../handlers/character.handler';
import {Response} from '../utils/response.util';

/* istanbul ignore next */
exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const {region, realm, name, withFields, locale} = JSON.parse(event.body);
  if (event.httpMethod === 'POST') {
    new CharacterHandler().get(region, realm, name, withFields, locale)
      .then(res => Response.send(res, callback))
      .catch(error => Response.error(callback, error, event));
  } else {
    Response
      .error(callback, 'The method you provided, is not available.', event);
  }
};
