import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {RealmHandler} from '../handlers/realm.handler';
import {Endpoints} from '../utils/endpoints.util';

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
  const {region, realm} = event.pathParameters;
  Endpoints.setStage(event);
  new RealmHandler()
    .getRealmByRegionAndName(region, realm)
    .then((response) => Response.send(response, callback))
    .catch(Response.error);
};

/* istanbul ignore next */
exports.handleGetAll = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new RealmHandler()
    .getAllRealms(event, callback);
};
