import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {ItemHandler} from '../handlers/item.handler';

/* istanbul ignore next */
exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {

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
        new ItemHandler().getById(id, locale)
          .then(res => Response.send(res, callback))
          .catch(err => Response.error(callback, err, undefined, 404));
        break;
      case 'PATCH':
        new ItemHandler().update(id, locale)
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
        new ItemHandler().getAllRelevant(event, callback);
        break;
      default:
        Response.error(callback, 'The method you provided, is not available.', event, 401);
    }
  }
}
