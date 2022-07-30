import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {AuctionService} from './services/auction.service';
import {Response} from '../utils/response.util';
import {Endpoints} from '../utils/endpoints.util';
import {DatabaseUtil} from '../utils/database.util';
import {StatsService} from './services/stats.service';
import {TsmService} from './services/tsm.service';

/* istanbul ignore next */
exports.deactivateInactiveHouses = (event: APIGatewayEvent, context: Context, callback: Callback) =>
  new AuctionService().deactivateInactiveHouses(event, callback);

exports.auctionsDownloadAndSave = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  Endpoints.setStage(event);
  new AuctionService().downloadAndSaveAuctionDump(event['Records'])
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, event, 401));
};

exports.updateHourlyRealmData = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new StatsService().processRecord(event['Records'])
    .then(() => Response.send({}, callback))
    .catch(error => Response.error(callback, error, event, 500));
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
  const {items} = JSON.parse(event.body);
  const conn = new DatabaseUtil(false, true);
  const service = new StatsService();
  service.getPriceHistoryFor(items || [{ahId, itemId: id, petSpeciesId, bonusIds}], onlyHourly, conn)
    .then(async history => {
      conn.end();
      Response.send(history, callback);
    })
    .catch(error => {
      conn.end();
      Response.error(callback, error, event);
    });
};

exports.getComparablePricesFor = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const service = new StatsService();
  service.getComparablePricesFor(JSON.parse(event.body))
    .then(async history => {
      Response.send(history, callback);
    })
    .catch(error => {
      Response.error(callback, error, event);
    });
};

/* istanbul ignore next */
exports.updateAll = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  Endpoints.setStage(event);
  new AuctionService().updateAllHouses()
    .then(res => {
      Response.send(res, callback);
    })
    .catch(err => {
      Response.error(callback, err);
    });
};

exports.deleteOldPriceHistoryForRealmAndSetDailyPrice = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new StatsService().deleteOldPriceHistoryForRealm()
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, event, 500));
};

exports.insertStatisticsData = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new StatsService().insertStats()
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err, event, 500));
};

exports.updateStaticS3Data = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  Endpoints.setStage(event);
  new AuctionService().updateStaticS3Data(event['Records'])
    .then(res => {
      console.log('Promise returned in then for static data');
      Response.send(res, callback);
    })
    .catch(err => {
      console.log('Promise returned in catch for static data');
      Response.error(callback, err, event, 401);
    });
};

exports.updateTSMDataForOneRealm = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new TsmService().updateTSMDataForOneRealm(event['key'])
    .then(result => Response.send(result, callback))
    .catch(error => Response.error(callback, error, event, 500));
};

exports.updateRealmTrends = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new StatsService().updateRealmTrends()
    .then(result => Response.send(result, callback))
    .catch(error => Response.error(callback, error, event, 500));
};


/**
 * Deletes the hourly data
 */
exports.deleteOldPriceForRealmHourly =
  (event: {table: string, olderThan: number, period: string}, context: Context, callback: Callback) => {
  new StatsService().deleteOldPriceForRealm(
    'itemPriceHistoryPerHour',
    15,
    'DAY'
  )
    .then(result => Response.send(result, callback))
    .catch(error => Response.error(callback, error, undefined, 500));
};

/**
 * Deletes the auction stats that are grouped by day
 */
exports.deleteOldPriceForRealmDaily =
  (event: {table: string, olderThan: number, period: string}, context: Context, callback: Callback) => {
  new StatsService().deleteOldPriceForRealm(
    'itemPriceHistoryPerDay',
    2,
    'MONTH'
  )
    .then(result => Response.send(result, callback))
    .catch(error => Response.error(callback, error, undefined, 500));
};

exports.updateNextRealmsDailyPrices = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new StatsService().updateNextRealmsDailyPrices()
    .then(result => Response.send(result, callback))
    .catch(error => Response.error(callback, error, undefined, 500));
};

exports.migrate = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  if (process.env.IS_OFFLINE) {
    Promise.all([
      /*
        UpdatesService.getAndSetRecipes(),
        UpdatesService.getAndSetClassicRecipes(),
        UpdatesService.getAndSetItems(),
        UpdatesService.getAndSetClassicItems(),
        UpdatesService.getAndSetNpc(),
        UpdatesService.getAndSetZones(),
        UpdatesService.getAndSetProfessions(),
        UpdatesService.getAndSetItemClasses(),
        UpdatesService.getAndSetTimestamps(),
      */
      // new StatsMigrationToolUtil().migrateTables(),
      // new StatsMigrationToolUtil().performMigrationForAllRealms(),
      // new StatsService().updateRealmTrends(),
    ])
      .then(result => Response.send(result, callback))
      .catch(error => Response.error(callback, error, undefined, 500));
  } else {
    Response.error(callback, {message: 'Not authorized'}, undefined, 401);
  }
};