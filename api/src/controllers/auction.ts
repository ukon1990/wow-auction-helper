import {APIGatewayEvent, Callback, Context, Handler} from 'aws-lambda';
import {AuctionHandler} from '../handlers/auction.handler';
import {Response} from '../utils/response.util';
import {Endpoints} from '../utils/endpoints.util';

/* istanbul ignore next */
exports.updateAll = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  Endpoints.setStage(event);
  const region = event.body ?
    JSON.parse(event.body).region : undefined;
  new AuctionHandler().updateAllHouses(region)
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err));
};

/* istanbul ignore next */
exports.updateOne = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  Endpoints.setStage(event);
  new AuctionHandler().updateHouseRequest(event, callback);
};

/* istanbul ignore next */
exports.deactivateInactiveHouses = (event: APIGatewayEvent, context: Context, callback: Callback) =>
  new AuctionHandler().deactivateInactiveHouses(event, callback);

/* istanbul ignore next */
exports.getUpdateLogForRealm = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const id = +event.pathParameters.id;
  Endpoints.setStage(event);
  new AuctionHandler().getUpdateLog(id, 24 * 7)
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, event, 401));
};

exports.updateStaticS3Data = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  Endpoints.setStage(event);
  new AuctionHandler().updateStaticS3Data(event['Records'])
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, event, 401));
};

exports.auctionsDownloadAndSave = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  Endpoints.setStage(event);
  new AuctionHandler().downloadAndSaveAuctionDump(event['Records'])
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, event, 401));
};

exports.deleteOldPriceHistoryForRealmAndSetDailyPrice = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new AuctionHandler().deleteOldPriceHistoryForRealmAndSetDailyPrice()
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, event, 500));
};

exports.updateAllRealmDailyData = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const start = event['start'],
    end = event['end'];
  new AuctionHandler().updateAllRealmDailyData(start, end)
    .then(() => Response.send({}, callback))
    .catch(error => Response.error(callback, error, event, 500));
}
