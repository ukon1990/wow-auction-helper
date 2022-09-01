import {AuctionService} from './services/auction.service';
import {DatabaseUtil} from '../../utils/database.util';
import {StatsService} from './services/stats.service';
import {middyfy} from '@libs/lambda';
import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';

/* istanbul ignore next */
export const deactivateInactiveHouses = middyfy(async (): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new AuctionService();
  let response;
  await service.deactivateInactiveHouses()
    .then(() => response = formatJSONResponse())
    .catch(err => response = formatErrorResponse(err.code, err.message, err));

  return response;
});

/* istanbul ignore next */
export const auctionsDownloadAndSave = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new AuctionService();
  let response;
  await service.downloadAndSaveAuctionDump(event['Records'])
    .then(() => response = formatJSONResponse())
    .catch(err => response = formatErrorResponse(401, err.message, err));

  return response;
});

/* istanbul ignore next */
export const updateAllRealmDailyData = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new StatsService();
  const {start, end} = event;

  let response;
  await service.updateAllRealmDailyData(start, end)
    .then(() => response = formatJSONResponse())
    .catch(err => response = formatErrorResponse(500, err.message, err));

  return response;
});

/* istanbul ignore next */
export const getPriceHistoryForItem = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const {ahId, id, petSpeciesId, bonusIds, onlyHourly} = event.body;
  const {items} = event.body;
  const conn = new DatabaseUtil(false, true);
  const service = new StatsService();

  let response;
  await service.getPriceHistoryFor(items || [{ahId, itemId: id, petSpeciesId, bonusIds}], onlyHourly, conn)
    .then(history => {
      response = formatJSONResponse(history);
    })
    .catch(err => {
      response = formatErrorResponse(500, err.message, err);
    });

  conn.end();
  return response;
});

/* istanbul ignore next */
export const getComparablePricesFor = middyfy(async ({body}): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new StatsService();

  let response;
  await service.getComparablePricesFor(body)
    .then(history => {
      response = formatJSONResponse(history);
    })
    .catch(err => {
      response = formatErrorResponse(500, err.message, err);
    });

  return response;
});

/* istanbul ignore next */
export const updateAll = middyfy(async (): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new AuctionService();

  let response;
  await service.updateAllHouses()
    .then(() => {
      response = formatJSONResponse();
    })
    .catch(err => {
      response = formatErrorResponse(500, err.message, err);
    });

  return response;
});

/* istanbul ignore next */
export const insertStatisticsData = middyfy(async (): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new StatsService();

  let response;
  await service.insertStats()
    .then(() => {
      response = formatJSONResponse();
    })
    .catch(err => {
      response = formatErrorResponse(500, err.message, err);
    });

  return response;
});

/* istanbul ignore next */
export const updateStaticS3Data = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new AuctionService();

  let response;
  await service.updateStaticS3Data(event['Records'])
    .then(() => {
      response = formatJSONResponse();
    })
    .catch(err => {
      response = formatErrorResponse(500, err.message, err);
    });

  return response;
});

/* istanbul ignore next */
export const updateRealmTrends = middyfy(async (): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new StatsService();

  let response;
  await service.updateRealmTrends()
    .then(() => {
      response = formatJSONResponse();
    })
    .catch(err => {
      response = formatErrorResponse(500, err.message, err);
    });

  return response;
});


/**
 * Deletes the hourly data
 */
/* istanbul ignore next */
export const deleteOldPriceForRealmHourly = middyfy(async (): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new StatsService();

  let response;
  await service.deleteOldPriceForRealm(
    'itemPriceHistoryPerHour',
    15,
    'DAY'
  )
    .then(() => {
      response = formatJSONResponse();
    })
    .catch(err => {
      response = formatErrorResponse(500, err.message, err);
    });

  return response;
});

/**
 * Deletes the auction stats that are grouped by day
 */
/* istanbul ignore next */
export const deleteOldPriceForRealmDaily = middyfy(async (): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new StatsService();

  let response;
  await service.deleteOldPriceForRealm(
    'itemPriceHistoryPerDay',
    2,
    'MONTH'
  )
    .then(() => {
      response = formatJSONResponse();
    })
    .catch(err => {
      response = formatErrorResponse(500, err.message, err);
    });

  return response;
});

/* istanbul ignore next */
export const updateNextRealmsDailyPrices = middyfy(async (): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  const service = new StatsService();

  let response;
  await service.updateNextRealmsDailyPrices()
    .then(() => {
      response = formatJSONResponse();
    })
    .catch(err => {
      response = formatErrorResponse(500, err.message, err);
    });

  return response;
});

/* istanbul ignore next */
export const migrate = middyfy(async (): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  let response;
  if (process.env.IS_OFFLINE) {
    await Promise.all([
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
      .then(() => {
        response = formatJSONResponse();
      })
      .catch(err => {
        response = formatErrorResponse(500, err.message, err);
      });
  }

  return response;
});