import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {AdminService} from './admin.service';

export const optimizeTable = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const service = new AdminService();
  service.optimizeTable(event['table'])
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err.message, event, err.code));
};