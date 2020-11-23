import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {DashboardService} from './service';
import {Response} from '../utils/response.util';
import {AuthorizationUtil} from '../utils/authorization.util';

exports.getAll = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const token = AuthorizationUtil.isValidToken(event);
  if (!token) {
    Response.error(callback, {code: 401, message: 'Not authorized'}, event, 401);
  } else {
    new DashboardService().getAll(token.sub)
      .then(res => Response.send(res, callback))
      .catch(error => Response.error(callback, error));
  }
};

exports.save = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new DashboardService().save('event', JSON.parse(event.body))
    .then(res => Response.send(res, callback))
    .catch(error => Response.error(callback, error));
};
