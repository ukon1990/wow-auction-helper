import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {RecipeHandler} from '../handlers/recipe.handler';

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {

  if (event.pathParameters && event.pathParameters.id) {
    RecipeController.byId(event, callback);
  } else {
    RecipeController.all(event, callback);
  }
};

class RecipeController {
  public static byId(event: APIGatewayEvent, callback: Callback) {
    const type = event.httpMethod,
      id = +event.pathParameters.id;
    switch (type) {
      case 'OPTIONS':
      case 'POST':
        new RecipeHandler().getById(event, callback);
        break;
      case 'PATCH':
        new RecipeHandler().update(event, callback);
        break;
      default:
        Response.error(callback);
    }
  }

  public static all(event: APIGatewayEvent, callback: Callback) {
    const type = event.httpMethod;
    switch (type) {
      case 'OPTIONS':
      case 'POST':
        new RecipeHandler().getAllRelevant(event, callback);
        break;
      default:
        Response.error(callback);
    }
  }
}
