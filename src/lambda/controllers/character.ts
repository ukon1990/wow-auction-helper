import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {CharacterHandler} from '../handlers/character.handler';
import {Response} from '../utils/response.util';

/* istanbul ignore next */
exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  if (event.httpMethod === 'POST') {
    new CharacterHandler()
      .get(event, callback);
  } else {
    Response
      .error(callback, 'The method you provided, is not available.', event);
  }
};
