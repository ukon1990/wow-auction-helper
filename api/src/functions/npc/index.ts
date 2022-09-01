import {handlerPath} from '@libs/handler-resolver';

export default {
  npcGetByIds: {
    handler: `${handlerPath(__dirname)}/controller.addNewNPCsByIds`,
    memorySize: 256,
    timeout: 30,
    tags: {
      Function: 'Wah-npcGetByIds',
      Project: 'WAH',
    }
  },
  npcGetAll: {
    handler: `${handlerPath(__dirname)}/controller.getAll`,
    memorySize: 400,
    tags: {
      Function: 'Wah-npcGetAll',
      Project: 'WAH',
    }
  },
  npcGetById: {
    handler: `${handlerPath(__dirname)}/controller.getById`,
    memorySize: 128,
    tags: {
      Function: 'Wah-npcGetById',
      Project: 'WAH',
    }
  },
};