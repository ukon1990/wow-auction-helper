import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {AuthorizationUtil} from '../utils/authorization.util';
import {DashboardService} from '../dashboard/service';
import {Response} from '../utils/response.util';

exports.getServiceMessage = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const token = AuthorizationUtil.isValidToken(event);
  new DashboardService(token).getAll()
    .then(res => Response.send(res, callback))
    .catch(error => Response.error(callback, error));
};
