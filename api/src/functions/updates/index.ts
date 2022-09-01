import {handlerPath} from '@libs/handler-resolver';

export default {
  syncS3WithTheDatabase: {
    handler: `${handlerPath(__dirname)}/controller.syncS3WithTheDatabase`,
    memorySize: 1024,
    timeout: 600,
    tags: {
      Function: 'Wah-syncS3WithTheDatabase',
      Project: 'WAH',
    },
  },
};