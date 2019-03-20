import {APIGatewayEvent, Callback} from 'aws-lambda';
import {Response} from '../utils/response.util';

exports.handler = (event: APIGatewayEvent, callback: Callback) => {
  Response.send(event, callback);
};
