import {handlerPath} from '@libs/handler-resolver';

export default {
  auctionUpdateLogForRealm: {
    handler: `${handlerPath(__dirname)}/controller.getUpdateLogForRealm`,
    memorySize: 200,
    tags: {
      Function: 'Wah-auctionUpdateLogForRealm',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'get',
        path: 'auction/log/{id}',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  updateLastRequested: {
    handler: `${handlerPath(__dirname)}/controller.updateLastRequested`,
    memorySize: 200,
    timeout: 5,
    tags: {
      Function: 'Wah-updateLastRequested',
      Project: 'WAH',
    },
  },
  updateActiveRealms: {
    handler: `${handlerPath(__dirname)}/controller.updateActiveRealms`,
    memorySize: 128,
    timeout: 10,
    tags: {
      Function: 'Wah-updateActiveRealms',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'get',
        path: 'admin/realm/statuses',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  getAllAuctionHouses: {
    handler: `${handlerPath(__dirname)}/controller.getAllAuctionHouses`,
    memorySize: 128,
    timeout: 10,
    tags: {
      Function: 'Wah-getAllAuctionHouses',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'get',
        path: 'admin/realm',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
};