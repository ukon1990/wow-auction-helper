import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {TSMHandler} from '../handlers/tsm.handler';

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new TSMHandler().getAndStartAllRealmsToUpdate(event['key'])
    .then(result => Response.send(result, callback))
    .catch(error => Response.error(callback, error, event, 500));
};
