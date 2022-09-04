import {handlerPath} from '@libs/handler-resolver';

export default {
  loggerQueries: {
    handler: `${handlerPath(__dirname)}/controller.getCurrentQueries`,
    memorySize: 128,
    tags: {
      Function: 'Wah-loggerGetCurrentQueries',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'get',
        path: 'admin/database/queries',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  loggerGetTableSize: {
    handler: `${handlerPath(__dirname)}/controller.getTableSize`,
    memorySize: 128,
    tags: {
      Function: 'Wah-loggerGetTableSize',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'get',
        path: 'admin/database/tables',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  loggerGetGlobalStatus: {
    handler: `${handlerPath(__dirname)}/controller.getGlobalStatus`,
    memorySize: 128,
    tags: {
      Function: 'Wah-loggerGetGlobalStatus',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'get',
        path: 'admin/database/global-status',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  loggerProcessAccessLogs: {
    handler: `${handlerPath(__dirname)}/controller.processAccessLogs`,
    memorySize: 128,
    timeout: 90,
    tags: {
      Function: 'Wah-loggerProcessAccessLogs',
      Project: 'WAH',
    },
  },
};