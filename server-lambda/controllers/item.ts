import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {ItemHandler} from '../handlers/item.handler';

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {

  if (event.pathParameters && event.pathParameters.id) {
    ItemController.byId(event, callback);
  } else {
    ItemController.all(event, callback);
  }
};

class ItemController {
  public static byId(event: APIGatewayEvent, callback: Callback) {
    const type = event.httpMethod,
      id = +event.pathParameters.id;
    switch (type) {
      case 'OPTIONS':
      case 'POST':
        new ItemHandler().getById(event, callback);
        break;
      case 'PATCH':
        new ItemHandler().update(event, callback);
        break;
      default:
        Response.error(callback, 'The method you provided, is not available.', event);
    }
  }

  public static all(event: APIGatewayEvent, callback: Callback) {
    const type = event.httpMethod;
    switch (type) {
      case 'OPTIONS':
      case 'POST':
        new ItemHandler().getAllRelevant(event, callback);
        break;
      default:
        Response.error(callback, 'The method you provided, is not available.', event);
    }
  }
}
