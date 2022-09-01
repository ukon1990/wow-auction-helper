import {handlerPath} from '@libs/handler-resolver';

export default {
  getAllRecipesAfter: {
    handler: `${handlerPath(__dirname)}/controller.getAfter`,
    memorySize: 128,
    tags: {
      Function: 'Wah-getAllRecipesAfter',
      Project: 'WAH',
    },
  },
  getRecipeById: {
    handler: `${handlerPath(__dirname)}/controller.getById`,
    memorySize: 128,
    tags: {
      Function: 'Wah-getRecipeById',
      Project: 'WAH',
    },
  },
};