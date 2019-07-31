import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {RealmHandler} from '../handlers/realm.handler';

/* istanbul ignore next */
exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  if (event.httpMethod === 'POST') {
    new RealmHandler()
      .getStatus(event, callback);
  } else {
    Response
      .error(callback, 'The method you provided, is not available.', event);
  }
};

/* istanbul ignore next */
exports.getByRegionAndName  = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new RealmHandler()
    .getRealmByRegionAndName(event, callback);
};

/* istanbul ignore next */
exports.handleGetAll = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new RealmHandler()
    .getAllRealms(event, callback);
};
