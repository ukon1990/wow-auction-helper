import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {ItemServiceV2} from './service';
import {Response} from '../utils/response.util';

exports.findMissingItemsAndImport = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const clientId = event['clientId'],
    clientSecret = event['clientSecret'];
  new ItemServiceV2().findMissingItemsAndImport(clientId, clientSecret)
    .then(() => Response.send({}, callback))
    .catch(error => Response.error(callback, error, event, 500));
};
