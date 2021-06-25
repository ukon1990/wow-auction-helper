import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {DatabaseUtil} from '../utils/database.util';
import {LogService} from './log.service';

const connection = new DatabaseUtil(false, true);

/* istanbul ignore next */
exports.clientEvent = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  Response.send({success: true, userId: null}, callback);
  // new LogService(event, callback, connection).clientEvent();
};

/* istanbul ignore next */
exports.clientDelete = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  new LogService(event, connection).deleteClient()
    .then(entry => Response.send({success: true, userId: entry.userId}, callback))
    .catch(error => Response.error(callback, error, event));
};

exports.getLog = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new LogService(event, connection).getLog();
};

exports.getCurrentQueries = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  if (!process.env.IS_OFFLINE) {
    Response.error(callback, new Error('Not authorized'), event, 401);
    return;
  }
  context.callbackWaitsForEmptyEventLoop = false;
  new LogService(event, connection).getCurrentQueries()
    .then((data) => Response.send(data, callback))
    .catch(err => Response.error(callback, err));
};

exports.getTableSize = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  if (!process.env.IS_OFFLINE) {
    Response.error(callback, new Error('Not authorized'), event, 401);
    return;
  }
  context.callbackWaitsForEmptyEventLoop = false;
  new LogService(event, connection).getTableSize()
    .then((data) => Response.send(data, callback))
    .catch(err => Response.error(callback, err));
};

exports.getGlobalStatus = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  if (!process.env.IS_OFFLINE) {
    Response.error(callback, new Error('Not authorized'), event, 401);
    return;
  }
  context.callbackWaitsForEmptyEventLoop = false;
  new LogService(event, connection).getGlobalStatus()
    .then((data) => Response.send(data, callback))
    .catch(err => Response.error(callback, err));
};

exports.processAccessLogs = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new LogService(event, new DatabaseUtil(false))
    .processAccessLogs()
    .then((data) => Response.send(data, callback))
    .catch(err => Response.error(callback, err));
};
