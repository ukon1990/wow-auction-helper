import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {ZoneHandler} from '../handlers/zone.handler';
import {Response} from '../utils/response.util';


exports.getByIds = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  ZoneHandler.getByIds(JSON.parse(event.body).ids)
    .then(result => Response.send(result, callback))
    .catch(error => Response.error(callback, error, event, 500));
};

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  ZoneHandler.getById(+event.pathParameters.id)
    .then(result => Response.send(result, callback))
    .catch(error => Response.error(callback, error, event, 500));
};
