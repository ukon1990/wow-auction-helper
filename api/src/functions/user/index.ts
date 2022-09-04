import {handlerPath} from '@libs/handler-resolver';

export default {
  userUpdateEmail: {
    handler: `${handlerPath(__dirname)}/controller.updateEmail`,
    memorySize: 128,
    timeout: 5,
    tags: {
      Function: 'Wah-userUpdateEmail',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'post',
        path: 'user/update-email',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
  userChangePassword: {
    handler: `${handlerPath(__dirname)}/controller.changePassword`,
    memorySize: 128,
    timeout: 5,
    tags: {
      Function: 'Wah-userChangePassword',
      Project: 'WAH',
    },
    events: [{
      http: {
        method: 'post',
        path: 'user/change-password',
        cors: {
          origin: 'http://localhost:4200,https://wah.jonaskf.net',
        }
      },
    }]
  },
};