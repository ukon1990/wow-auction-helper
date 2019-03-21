import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  Response.error(callback, 'Fake error', event);
};
