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
        path: 'logger/queries',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  }
};