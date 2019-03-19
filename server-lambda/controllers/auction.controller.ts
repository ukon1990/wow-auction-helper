import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { AuctionHandler } from '../handlers/auction.handler';
import { Response } from '../utils/response.util';

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const type = event.httpMethod;

  switch (type) {
    case 'OPTIONS':
    case 'POST':
      new AuctionHandler().post(event, context, callback);
      break;
    default:
      Response.error(callback);
  }
};
