import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {DatabaseUtil} from '../utils/database.util';
import {LogEntry} from '../models/log-entry.model';
import {LogQuery} from '../queries/log.query';

const crypto = require('crypto');
const connection = new DatabaseUtil(false);

/* istanbul ignore next */
exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  new LogController(event, callback, connection).handleS3AccessLog();
};

/* istanbul ignore next */
exports.clientEvent = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  new LogController(event, callback, connection).clientEvent();
};


/* istanbul ignore next */
exports.clientDelete = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  new LogController(event, callback, connection).deleteClient();
};

exports.getLog = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new LogController(event, callback, connection).getLog();
};

export class LogController {
  detail;
  userId: string;

  constructor(public event: APIGatewayEvent, public callback: Callback, private conn: DatabaseUtil) {
    console.log(this.event, this.event['identity']);
    if (this.event.requestContext && this.event.requestContext['identity']) {
      this.detail = this.event.requestContext['identity'];
    } else if (this.event['detail']) {
      this.detail = this.event['detail'];
    }
    this.userId = this.generateId();
  }

  handleS3AccessLog(): void {
    const params = this.detail.requestParameters;
    const path = params.key.split('/');

    const requestData = {
      bucketName: params.bucketName,
      type: path[0],
      region: path[1],
      ahId: isNaN(path[2]) ? null : path[2],
      fileName: path[path.length - 1],
      ipObfuscated: this.userId
    };
    const sql = LogQuery.s3Event(requestData);
    /*
    console.log('S3 accessed event:', {
      requestData, sql, params, event: this.detail
    });*/
    this.conn
      .query(sql)
      .then(() => {
        Response.send({message: 'success'}, this.callback);
      })
      .catch(err => {
        console.error(err);
        Response.error(this.callback, {message: 'error'});
      });
  }

  clientEvent(): void {
    try {
      const entry: LogEntry = JSON.parse(this.event.body);
      if (!entry.userId) {
        entry.userId = this.userId;
      }
      console.log(LogQuery.userEvent(entry));
      new DatabaseUtil()
        .query(LogQuery.userEvent(entry))
        .then(r =>
          Response.send({success: true, userId: entry.userId}, this.callback))
        .catch(e =>
          Response.error(this.callback, e, this.event));
    } catch (e) {
      Response.error(this.callback, e, this.event);
    }
  }

  deleteClient(): void {
    try {
      const entry: LogEntry = JSON.parse(this.event.body);
      if (!entry.userId) {
        entry.userId = this.userId;
      }
      new DatabaseUtil()
        .query(LogQuery.deleteUser(entry))
        .then(r =>
          Response.send({success: true, userId: entry.userId}, this.callback))
        .catch(e =>
          Response.error(this.callback, e, this.event));
    } catch (e) {
      Response.error(this.callback, e, this.event);
    }
  }

  private generateId() {
    return crypto.createHash('sha256')
      .update(this.detail.sourceIp || this.detail.sourceIPAddress)
      .digest('base64');
  }

  getLog() {
    // connection.query(LogQuery)
  }
}
