import {APIGatewayEvent, Callback, Context, Handler} from 'aws-lambda';
import {gzipResponse} from './utils/convertion.util';
import {AuctionHandler} from './handlers/auction.handler';
import {Response} from './utils/response.util';
import {ItemHandler} from './handlers/item.handler';
import {RequestBody} from './models/request-body.model';

const request: any = require('request');
const RequestPromise = require('request-promise');

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const type = event.httpMethod;

  switch (type) {
    case 'OPTIONS':
    case 'POST':
      const body = JSON.parse(event.body) as RequestBody;
      break;
    default:
      Response.error(callback);
  }
};
