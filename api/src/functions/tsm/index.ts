import {handlerPath} from '@libs/handler-resolver';

export default {
  auctionUpdateLogForRealm: {
    handler: `${handlerPath(__dirname)}/controller.updateTSMData`,
    memorySize: 512,
    tags: {
      Function: 'Wah-updateTSMData',
      Project: 'WAH',
    },
  },
};