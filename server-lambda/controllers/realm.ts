import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {RealmHandler} from '../handlers/realm.handler';

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  if (event.httpMethod === 'POST') {
    new RealmHandler()
      .getStatus(event, callback);
  } else {
    Response
      .error(callback, 'The method you provided, is not available.', event);
  }
};

exports.handleGetAll = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  if (event['isOffline']) {
    new RealmHandler()
      .getAllRealms(event, callback);
  } else {
    Response.error(callback, 'You are not authorized', event);
  }
};
