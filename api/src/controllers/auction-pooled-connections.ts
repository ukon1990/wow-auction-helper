import {DatabaseUtil} from '../utils/database.util';
import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Endpoints} from '../utils/endpoints.util';
import {AuctionHandler} from '../handlers/auction.handler';
import {Response} from '../utils/response.util';

const connection = new DatabaseUtil(false);

/* istanbul ignore next */
exports.updateAll = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  Endpoints.setStage(event);
  const region = event.body ?
    JSON.parse(event.body).region : undefined;
  new AuctionHandler().updateAllHouses(region, connection)
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err));
};
