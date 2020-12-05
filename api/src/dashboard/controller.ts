import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {DashboardService} from './service';
import {Response} from '../utils/response.util';
import {AuthorizationUtil} from '../utils/authorization.util';

exports.getAll = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const token = AuthorizationUtil.isValidToken(event);
  new DashboardService(token).getAll()
    .then(res => Response.send(res, callback))
    .catch(error => Response.error(callback, error));
};

exports.save = (event: APIGatewayEvent, context: Context, callback: Callback) => {  const token = AuthorizationUtil.isValidToken(event);
  if (!token) {
    Response.error(callback, {code: 401, message: 'Not authorized'}, event, 401);
  } else {
    new DashboardService(token).save(JSON.parse(event.body))
      .then(res => Response.send(res, callback))
      .catch(error => Response.error(callback, error));
  }
};

exports.copy = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const token = AuthorizationUtil.isValidToken(event);
  const id = event.pathParameters.id;
  new DashboardService(token).getCopyById(id, token)
    .then(res => Response.send(res, callback))
    .catch(error => Response.error(callback, error));
};

exports.delete = (event: APIGatewayEvent, context: Context, callback: Callback) => {  const token = AuthorizationUtil.isValidToken(event);
  if (!token) {
    Response.error(callback, {code: 401, message: 'Not authorized'}, event, 401);
  } else {
    const id = event.pathParameters.id;
    new DashboardService(token).delete(id)
      .then(res => Response.send(res, callback))
      .catch(error => Response.error(callback, error));
  }
};
