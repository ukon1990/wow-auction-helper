import {handlerPath} from '@libs/handler-resolver';

export default {
  getProfessions: {
    handler: `${handlerPath(__dirname)}/controller.getProfessions`,
    memorySize: 128,
    tags: {
      Function: 'Wah-getProfessions',
      Project: 'WAH',
    },
  },
};