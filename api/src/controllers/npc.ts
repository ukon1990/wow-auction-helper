import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {ZoneHandler} from '../handlers/zone.handler';
import {Response} from '../utils/response.util';
import {NpcHandler} from '../handlers/npc.handler';


exports.getByIds = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  NpcHandler.getByIds(JSON.parse(event.body).ids)
    .then(result => Response.send(result, callback))
    .catch(error => Response.error(callback, error, event, 500));
};
