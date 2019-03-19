import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { gzipResponse } from './utils/convertion.util';
import { AuctionHandler } from './handlers/auction.handler';
import { Response } from './utils/response.util';
const request: any = require('request');
const RequestPromise = require('request-promise');

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
