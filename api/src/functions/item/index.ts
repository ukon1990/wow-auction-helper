import {handlerPath} from '@libs/handler-resolver';

export default {
  findMissingItemsAndImport: {
    handler: `${handlerPath(__dirname)}/controller.findMissingItemsAndImport`,
    memorySize: 200,
    timeout: 300,
    tags: {
      Function: 'Wah-findMissingItemsAndImport',
      Project: 'WAH',
    },
  }
};