import {handlerPath} from '@libs/handler-resolver';

export default {
  character: {
    handler: `${handlerPath(__dirname)}/controller.getCharacter`,
    memorySize: 128,
    tags: {
      Function: 'Wah-character',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'post',
        path: 'character',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  }
};