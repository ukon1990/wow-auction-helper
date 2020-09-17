import {APIGatewayEvent, Callback, Context, Handler} from 'aws-lambda';
import {AuctionService} from './services/auction.service';
import {Response} from '../utils/response.util';
import {Endpoints} from '../utils/endpoints.util';
import {DatabaseUtil} from '../utils/database.util';
import {StatsService} from './services/stats.service';
import {ItemHandler} from '../handlers/item.handler';


/* istanbul ignore next */
exports.updateOne = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  Endpoints.setStage(event);
  new AuctionService().updateHouseRequest(event, callback);
};

/* istanbul ignore next */
exports.deactivateInactiveHouses = (event: APIGatewayEvent, context: Context, callback: Callback) =>
  new AuctionService().deactivateInactiveHouses(event, callback);

/* istanbul ignore next */
exports.getUpdateLogForRealm = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const id = +event.pathParameters.id;
  Endpoints.setStage(event);
  new AuctionService().getUpdateLog(id, 24 * 7)
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, event, 401));
};

exports.auctionsDownloadAndSave = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  Endpoints.setStage(event);
  new AuctionService().downloadAndSaveAuctionDump(event['Records'])
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, event, 401));
};

exports.updateHourlyRealmData = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new StatsService().processRecord(event['Records']);
};

exports.updateAllRealmDailyData = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const start = event['start'],
    end = event['end'];
  new StatsService().updateAllRealmDailyData(start, end)
    .then(() => Response.send({}, callback))
    .catch(error => Response.error(callback, error, event, 500));
};

exports.getPriceHistoryForItem = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const {ahId, id, petSpeciesId, bonusIds, onlyHourly} = JSON.parse(event.body);
  const conn = new DatabaseUtil(false);
  new StatsService().getPriceHistoryFor(ahId, id, petSpeciesId, bonusIds, onlyHourly, conn)
    .then(async history => {
      conn.end();
      Response.send(history, callback);
    })
    .catch(error => {
      conn.end();
      Response.error(callback, error, event);
    });
};

/* istanbul ignore next */
exports.updateAll = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const conn = new DatabaseUtil(true);
  Endpoints.setStage(event);
  const region = event.body ?
    JSON.parse(event.body).region : undefined;
  new AuctionService().updateAllHouses(region, conn)
    .then(res => {
      // conn.end();
      Response.send(res, callback);
    })
    .catch(err => {
      // conn.end();
      Response.error(callback, err);
    });
};

exports.deleteOldPriceHistoryForRealmAndSetDailyPrice = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new StatsService().deleteOldPriceHistoryForRealmAndSetDailyPrice()
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, event, 500));
};


exports.updateStaticS3Data = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  // context.callbackWaitsForEmptyEventLoop = false;
  const conn = new DatabaseUtil(false);
  Endpoints.setStage(event);
  new AuctionService().updateStaticS3Data(event['Records'], conn)
    .then(res => {
      console.log('Promise returned in then for static data');
      conn.end();
      Response.send(res, callback);
    })
    .catch(err => {
      console.log('Promise returned in catch for static data');
      conn.end();
      Response.error(callback, err, event, 401);
    });
};
