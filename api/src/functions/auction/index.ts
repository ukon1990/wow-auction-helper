import {handlerPath} from '@libs/handler-resolver';

export default {
  deactivateInactiveHouses: {
    handler: `${handlerPath(__dirname)}/controller.deactivateInactiveHouses`,
    memorySize: 200,
    tags: {
      Function: 'Wah-deactivateInactiveHouses',
      Project: 'WAH',
    }
  },
  auctionsDownloadAndSave: {
    handler: `${handlerPath(__dirname)}/controller.auctionsDownloadAndSave`,
    memorySize: 320,
    timeout: 30,
    tags: {
      Function: 'Wah-auctionsDownloadAndSave',
      Project: 'WAH',
    }
  },
  updateAllRealmDailyData: {
    handler: `${handlerPath(__dirname)}/controller.updateAllRealmDailyData`,
    memorySize: 1024,
    timeout: 300,
    tags: {
      Function: 'Wah-updateAllRealmDailyData',
      Project: 'WAH',
    }
  },
  getPriceHistoryForItem: {
    handler: `${handlerPath(__dirname)}/controller.getPriceHistoryForItem`,
    memorySize: 256,
    tags: {
      Function: 'Wah-item-history',
      Project: 'WAH',
    },
    events: [{
        http: {
          method: 'post',
          path: 'item/history',
          cors: {
            origin: 'http://localhost:4200,https://wah.jonaskf.net',
          }
        },
      }]
  },
  getComparablePricesFor: {
    handler: `${handlerPath(__dirname)}/controller.getComparablePricesFor`,
    memorySize: 256,
    tags: {
      Function: 'Wah-item-getComparablePricesFor',
      Project: 'WAH',
    },
    events: [{
        http: {
          method: 'post',
          path: 'item/history/compare',
          cors: {
            origin: 'http://localhost:4200,https://wah.jonaskf.net',
          }
        },
      }]
  },
  updateAllHouses: {
    handler: `${handlerPath(__dirname)}/controller.updateAll`,
    memorySize: 212,
    timeout: 59,
    tags: {
      Function: 'Wah-updateAllHouses',
      Project: 'WAH',
    },
  },
  auctionsInsertStatisticsData: {
    handler: `${handlerPath(__dirname)}/controller.insertStatisticsData`,
    memorySize: 222,
    timeout: 120,
    tags: {
      Function: 'Wah-auctionsInsertStatisticsData',
      Project: 'WAH',
    },
  },
  auctionsUpdateStaticS3Data: {
    handler: `${handlerPath(__dirname)}/controller.updateStaticS3Data`,
    memorySize: 400,
    timeout: 30,
    tags: {
      Function: 'Wah-auctionsUpdateStaticS3Data',
      Project: 'WAH',
    },
  },
  auctionsUpdateRealmTrends: {
    handler: `${handlerPath(__dirname)}/controller.updateRealmTrends`,
    memorySize: 1344,
    timeout: 300,
    tags: {
      Function: 'Wah-auctionsUpdateRealmTrends',
      Project: 'WAH',
    },
  },
  deleteOldPriceForRealmHourly: {
    handler: `${handlerPath(__dirname)}/controller.deleteOldPriceForRealmHourly`,
    memorySize: 250,
    timeout: 10,
    tags: {
      Function: 'Wah-deleteOldPriceForRealmHourly',
      Project: 'WAH',
    },
  },
  deleteOldPriceForRealmDaily: {
    handler: `${handlerPath(__dirname)}/controller.deleteOldPriceForRealmDaily`,
    memorySize: 250,
    timeout: 120,
    tags: {
      Function: 'Wah-deleteOldPriceForRealmDaily',
      Project: 'WAH',
    },
  },
  // TODO: Remove?
  updateNextRealmsDailyPrices: {
    handler: `${handlerPath(__dirname)}/controller.updateNextRealmsDailyPrices`,
    memorySize: 1024,
    timeout: 60,
    tags: {
      Function: 'Wah-updateNextRealmsDailyPrices',
      Project: 'WAH',
    },
  },
};