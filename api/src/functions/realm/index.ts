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
};