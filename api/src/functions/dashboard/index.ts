import {handlerPath} from '@libs/handler-resolver';

export default {
  getAllDashboard: {
    handler: `${handlerPath(__dirname)}/controller.getAll`,
    memorySize: 128,
    tags: {
      Function: 'Wah-getAllDashboard',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'get',
        path: 'dashboard',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  saveDashboard: {
    handler: `${handlerPath(__dirname)}/controller.save`,
    memorySize: 128,
    tags: {
      Function: 'Wah-saveDashboard',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'post',
        path: 'dashboard',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  copyDashboard: {
    handler: `${handlerPath(__dirname)}/controller.copy`,
    memorySize: 128,
    tags: {
      Function: 'Wah-copyDashboard',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'get',
        path: 'dashboard/copy/{id}',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  deleteDashboard: {
    handler: `${handlerPath(__dirname)}/controller.deleteDashboard`,
    tags: {
      Function: 'Wah-deleteDashboard',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'delete',
        path: 'dashboard/{id}',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
};