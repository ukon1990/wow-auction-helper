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
  updateRecipes: {
    handler: `${handlerPath(__dirname)}/controller.updateRecipes`,
    memorySize: 256,
    tags: {
      Function: 'Wah-updateRecipes',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'post',
        path: 'admin/recipes/update-all',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
};