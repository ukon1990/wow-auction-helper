import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {Endpoints} from '../utils/endpoints.util';

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  Endpoints.setStage(event);
  const detail = event['detail'];
  console.log('requestParameters', detail.requestParameters);
  console.log('Resources', detail.resources);
  Response.send(event, callback);
};
