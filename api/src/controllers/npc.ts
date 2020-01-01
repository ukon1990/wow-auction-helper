import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {ZoneHandler} from '../handlers/zone.handler';
import {Response} from '../utils/response.util';
import {NpcHandler} from '../handlers/npc.handler';


exports.getByIds = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  NpcHandler.getByIds(JSON.parse(event.body).ids)
    .then(result => Response.send(result, callback))
    .catch(error => Response.error(callback, error, event, 500));
};

exports.getAll = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  NpcHandler.getAll(JSON.parse(event.body).locale)
    .then(result => {
      Response.send(result, callback);
      result.length = 0;
    })
    .catch(error => Response.error(callback, error, event, 500));
};

exports.getById = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  NpcHandler.getById(+event.pathParameters.id, JSON.parse(event.body).locale)
    .then(result => Response.send(result, callback))
    .catch(error => Response.error(callback, error, event, 500));
};
