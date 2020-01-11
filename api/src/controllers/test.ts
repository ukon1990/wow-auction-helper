import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {Endpoints} from '../utils/endpoints.util';

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  Endpoints.setStage(event);
  console.log('Event', event, event['s3']);

  event['Records'].forEach(r => {
    console.log('Record', r.s3); // awsRegion
  });
  Response.send(event, callback);
};
