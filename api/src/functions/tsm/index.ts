import {handlerPath} from '@libs/handler-resolver';

export default {
  updateTSMData: {
    handler: `${handlerPath(__dirname)}/controller.updateTSMData`,
    memorySize: 512,
    timeout: 60,
    tags: {
      Function: 'Wah-updateTSMData',
      Project: 'WAH',
    },
    /*
    events: [{
      http: {
        method: 'post',
        path: 'test',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]*/
  },
};