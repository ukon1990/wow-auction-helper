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
  },
  findMissingItemsAndImportManualTrigger: {
    handler: `${handlerPath(__dirname)}/controller.findMissingItemsAndImport`,
    memorySize: 2048,
    timeout: 60,
    tags: {
      Function: 'Wah-findMissingItemsAndImportManualTrigger',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'post',
        path: 'admin/item/find-missing-items',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  }
};