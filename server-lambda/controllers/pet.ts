import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {PetHandler} from '../handlers/pet.handler';

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {

  if (event.pathParameters && event.pathParameters.id) {
    PetController.byId(event, callback);
  } else {
    PetController.all(event, callback);
  }
};

class PetController {
  public static byId(event: APIGatewayEvent, callback: Callback) {
    const type = event.httpMethod,
      id = +event.pathParameters.id;
    switch (type) {
      case 'OPTIONS':
      case 'POST':
        new PetHandler().getById(event, callback);
        break;
      case 'PATCH':
        new PetHandler().update(event, callback);
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
        new PetHandler().getAllRelevant(event, callback);
        break;
      default:
        Response.error(callback, 'The method you provided, is not available.', event);
    }
  }
}
