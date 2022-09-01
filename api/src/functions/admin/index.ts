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
  },
  adminGetUserList: {
    handler: `${handlerPath(__dirname)}/controller.getUserList`,
    memorySize: 128,
    timeout: 5,
    tags: {
      Function: 'Wah-adminGetUserList',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'get',
        path: 'admin/users',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  adminUser: {
    handler: `${handlerPath(__dirname)}/controller.adminUser`,
    memorySize: 128,
    timeout: 5,
    tags: {
      Function: 'Wah-adminUser',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'delete',
        path: 'admin/users/{username}',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
};