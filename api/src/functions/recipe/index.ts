import {handlerPath} from '@libs/handler-resolver';

export default {
  getAllRecipesAfter: {
    handler: `${handlerPath(__dirname)}/controller.getAfter`,
    memorySize: 300,
    timeout: 30,
    tags: {
      Function: 'Wah-getAllRecipesAfter',
      Project: 'WAH',
      Test: 'asd'
    },
    events: [{
      http: {
        method: 'get',
        path: 'admin/recipes',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  updateRecipeJSONFilesRetail: {
    handler: `${handlerPath(__dirname)}/controller.updateJSONFilesRetail`,
    memorySize: 350,
    timeout: 60,
    tags: {
      Function: 'Wah-updateRecipeJSONFilesRetail',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'get',
        path: 'admin/recipes/update-json',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  updateRecipe: {
    handler: `${handlerPath(__dirname)}/controller.updateRecipe`,
    memorySize: 256,
    timeout: 30,
    tags: {
      Function: 'Wah-updateRecipe',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'patch',
        path: 'admin/recipes',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  getRecipeById: {
    handler: `${handlerPath(__dirname)}/controller.getById`,
    memorySize: 256,
    timeout: 30,
    tags: {
      Function: 'Wah-getRecipeById',
      Project: 'WAH',
    },
  },
  updateRecipes: {
    handler: `${handlerPath(__dirname)}/controller.updateRecipes`,
    memorySize: 256,
    timeout: 30,
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
  getOnUseRecipes: {
    handler: `${handlerPath(__dirname)}/controller.updateOnUse`,
    memorySize: 256,
    timeout: 30,
    tags: {
      Function: 'Wah-updateOnUse',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'get',
        path: 'admin/recipes/update-on-use',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  compareRecipeAPI: {
    handler: `${handlerPath(__dirname)}/controller.compareRecipeAPI`,
    memorySize: 256,
    timeout: 30,
    tags: {
      Function: 'Wah-updateOnUse',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'get',
        path: 'admin/recipes/{id}',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
};