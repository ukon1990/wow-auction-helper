import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {ZoneHandler} from '../handlers/zone.handler';
import {Response} from '../utils/response.util';
import {TSMHandler} from '../handlers/tsm.handler';

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new TSMHandler().getAndStartAllRealmsToUpdate()
    .then(result => Response.send(result, callback))
    .catch(error => Response.error(callback, error, event, 500));
};
