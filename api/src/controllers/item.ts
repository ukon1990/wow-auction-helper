import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {ItemHandler} from '../handlers/item.handler';
import {DatabaseUtil} from '../utils/database.util';

const connection = new DatabaseUtil(false);
/* istanbul ignore next */
exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.pathParameters && event.pathParameters.id) {
    ItemController.byId(event, callback);
  } else {
    ItemController.all(event, callback);
  }
};

class ItemController {
  /* istanbul ignore next */
  public static async byId(event: APIGatewayEvent, callback: Callback) {
    const type = event.httpMethod,
      id = +event.pathParameters.id,
      locale = event.pathParameters.locale || JSON.parse(event.body).locale;
    switch (type) {
      case 'OPTIONS':
      case 'POST':
        new ItemHandler().getById(id, locale, connection)
          .then(res => Response.send(res, callback))
          .catch(err => Response.error(callback, err, undefined, 404));
        break;
      case 'PATCH':
        new ItemHandler().update(id, locale, connection)
          .then(res => Response.send(res, callback))
          .catch(err => Response.error(callback, err, undefined, 404));
        break;
      default:
        Response.error(callback, 'The method you provided, is not available.', event);
    }
  }

  /* istanbul ignore next */
  public static all(event: APIGatewayEvent, callback: Callback) {
    const type = event.httpMethod;
    switch (type) {
      case 'OPTIONS':
      case 'POST':
        const {timestamp, locale} = JSON.parse(event.body);
        new ItemHandler().getAllRelevant(timestamp, locale, connection)
          .then(res =>
            Response.send(res, callback))
          .catch(error =>
            Response.error(callback, error, event));
        break;
      default:
        Response.error(callback, 'The method you provided, is not available.', event, 401);
    }
  }
}
