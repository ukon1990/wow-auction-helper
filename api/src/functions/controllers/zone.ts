import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {ZoneHandler} from '../handlers/zone.handler';
import {Response} from '../../utils/response.util';


exports.getAll = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const {ids, locale, timestamp} = JSON.parse(event.body);

  if (ids) {
    ZoneHandler.getByIds(ids)
      .then(result => Response.send(result, callback))
      .catch(error => Response.error(callback, error, event, 500));
  } else if (locale) {
    ZoneHandler.getAll(locale, timestamp)
      .then(result => Response.send(result, callback))
      .catch(error => Response.error(callback, error, event, 500));
  }
};


exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  ZoneHandler.getById(+event.pathParameters.id)
    .then(result => Response.send(result, callback))
    .catch(error => Response.error(callback, error, event, 500));
};