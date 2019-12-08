import {APIGatewayEvent, Callback, Context, Handler} from 'aws-lambda';
import {AuctionHandler} from '../handlers/auction.handler';
import {Response} from '../utils/response.util';

/* istanbul ignore next */
exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const type = event.httpMethod;
  const body = JSON.parse(event.body),
    region = body.region,
    realm = body.realm,
    timestamp = body.timestamp,
    url = body.url;

  switch (type) {
    case 'OPTIONS':
    case 'POST':
      new AuctionHandler().post(region, realm, timestamp, url)
        .then(res => Response.send(res, callback))
        .catch(err => Response.error(callback, err, event));
      break;
    default:
      Response.error(callback, 'The method you provided, is not available.', event);
  }
};

/* istanbul ignore next */
exports.s3 = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const type = event.httpMethod;

  switch (type) {
    case 'OPTIONS':
    case 'POST':
      new AuctionHandler().s3(event, context, callback);
      break;
    default:
      Response.error(callback, 'The method you provided, is not available.', event);
  }
};

/* istanbul ignore next */
exports.updateAll = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new AuctionHandler().updateAllHouses(event, callback);
};

/* istanbul ignore next */
exports.updateOne = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new AuctionHandler().updateHouseRequest(event, callback);
};

/* istanbul ignore next */
exports.deactivateInactiveHouses = (event: APIGatewayEvent, context: Context, callback: Callback) =>
  new AuctionHandler().deactivateInactiveHouses(event, callback);
