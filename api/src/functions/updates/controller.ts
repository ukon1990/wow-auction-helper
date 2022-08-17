import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../../utils/response.util';
import {UpdatesService} from './service';

exports.syncS3WithTheDatabase = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  UpdatesService.syncS3WithTheDatabase()
    .then(res => {
      Response.send(res, callback);
    })
    .catch(err => {
      Response.error(callback, err, event, 500);
    });
};