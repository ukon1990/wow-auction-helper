import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {UpdatesService} from './service';

export const update = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  UpdatesService.init()
    .then(res => {
      Response.send(res, callback);
    })
    .catch(err => {
      Response.error(callback, err, event, 500);
    });
};
