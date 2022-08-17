import {handlerPath} from '@libs/handler-resolver';

export default {
  adminOptimizeTable: {
    handler: `${handlerPath(__dirname)}/controller.optimizeTable`,
    memorySize: 128,
    timeout: 5,
    tags: {
      Function: 'Wah-adminOptimizeTable',
      Project: 'WAH',
    }
  }
};