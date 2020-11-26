import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {NpcHandler} from '../handlers/npc.handler';
import {DatabaseUtil} from '../utils/database.util';


exports.addNewNPCsByIds = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const db = new DatabaseUtil(false);
  NpcHandler.addNewNPCsByIds(JSON.parse(event.body).ids, db)
    .then(result => {
      db.end();
      Response.send(result, callback);
    })
    .catch(error => {
      db.end();
      Response.error(callback, error, event, 500);
    });
};

exports.getAll = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const {locale, timestamp} = JSON.parse(event.body);
  NpcHandler.getAll(locale, timestamp)
    .then(result => {
      Response.send(result, callback);
      result['npcs'].length = 0;
    })
    .catch(error => Response.error(callback, error, event, 500));
};

exports.getById = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  NpcHandler.getById(+event.pathParameters.id, JSON.parse(event.body).locale)
    .then(result => Response.send(result, callback))
    .catch(error => Response.error(callback, error, event, 500));
};
