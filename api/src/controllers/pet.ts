import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {PetHandler} from '../handlers/pet.handler';

/* istanbul ignore next */
exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {

  if (event.pathParameters && event.pathParameters.id) {
    PetController.byId(event, callback);
  } else {
    PetController.all(event, callback);
  }
};

class PetController {
  /* istanbul ignore next */
  public static byId(event: APIGatewayEvent, callback: Callback) {
    // `Could not get locale for ${newPet.name} (${newPet.speciesId})`, e
    const { locale } = JSON.parse(event.body);
    const type = event.httpMethod,
      id = +event.pathParameters.id;
    switch (type) {
      case 'OPTIONS':
      case 'POST':
        new PetHandler().getById(id, locale)
          .then(res => Response.send(res, callback))
          .catch(error => Response.error(callback, error, event));
        break;
      case 'PATCH':
        new PetHandler().update(id, locale)
          .then(res => Response.send(res, callback))
          .catch(error => Response.error(callback, error, event));
        break;
      default:
        Response.error(callback, 'The method you provided, is not available.', event);
    }
  }

  /* istanbul ignore next */
  public static all(event: APIGatewayEvent, callback: Callback) {
    const { locale } = JSON.parse(event.body);
    const id = +event.pathParameters.id;
    const type = event.httpMethod;
    switch (type) {
      case 'OPTIONS':
      case 'POST':
        const { locale, timestamp } = JSON.parse(event.body);
        new PetHandler().getAllRelevant(id, timestamp, locale)
          .then(res => Response.send(res, callback))
          .catch(error => Response.error(callback, error, event));
        break;
      default:
        Response.error(callback, 'The method you provided, is not available.', event);
    }
  }
}
