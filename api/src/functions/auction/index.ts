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
  auctionsDownloadAndSaveCommodity: {
    handler: `${handlerPath(__dirname)}/controller.auctionsDownloadAndSave`,
    memorySize: 1024,
    timeout: 600,
    tags: {
      Function: 'Wah-auctionsDownloadAndSaveCommodity',
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
    events: [{
      http: {
        method: 'post',
        path: 'admin/auctions/s3-trigger/manual',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  adminAuctionsRestoreHourlyHistoricalDataFromS3: {
    handler: `${handlerPath(__dirname)}/controller.adminAuctionsRestoreHourlyHistoricalDataFromS3`,
    memorySize: 1024,
    timeout: 600,
    tags: {
      Function: 'Wah-adminAuctionsRestoreHourlyHistoricalDataFromS3',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'post',
        path: 'admin/auctions/history-restore',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
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
  adminManualUpdateHouse: {
    handler: `${handlerPath(__dirname)}/controller.adminManualUpdateHouse`,
    memorySize: 1344,
    timeout: 300,
    tags: {
      Function: 'Wah-adminManualUpdateHouse',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'post',
        path: 'admin/auction-house/realm/update',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  adminManualUpdateHouseStats: {
    handler: `${handlerPath(__dirname)}/controller.adminManualUpdateHouseStats`,
    memorySize: 1344,
    timeout: 300,
    tags: {
      Function: 'Wah-adminManualUpdateHouseStats',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'post',
        path: 'admin/auction-house/realm/stats/update',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
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