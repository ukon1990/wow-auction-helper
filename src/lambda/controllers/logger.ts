import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {DatabaseUtil} from '../utils/database.util';
import {LogEntry} from '../models/log-entry.model';
import {LogQuery} from '../queries/log.query';

const crypto = require('crypto');

/* istanbul ignore next */
exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  new LogController(event, callback).handleS3AccessLog();
};

/* istanbul ignore next */
exports.clientEvent = (event: APIGatewayEvent, context: Context, callback: Callback) =>
  new LogController(event, callback).clientEvent();

export class LogController {
  detail;
  userId: string;

  constructor(public event: APIGatewayEvent, public callback: Callback) {
    this.detail = event['detail'];
    this.userId = this.generateId();
  }

  handleS3AccessLog(): void {
    const params = this.detail.requestParameters;
    // example: auctions/eu/69/1558442417000.json.gz
    const path = params.key.split('/');

    const requestData = {
      bucketName: params.bucketName,
      type: path[0],
      region: path[1],
      ahId: path[2],
      fileName: path[3],
      ipObfuscated: this.userId
    };
    const sql = LogQuery.s3Event(requestData);
    console.log('S3 accessed event:', requestData, 'sql: ', sql);
    new DatabaseUtil()
      .query(
        sql)
      .then(() => {
      })
      .catch(console.error);
    Response.send({message: 'success'}, this.callback);
  }

  clientEvent(): void {
    try {
      const entry: LogEntry = JSON.parse(this.event.body);
      if (!entry.userId) {
        entry.userId = this.userId;
      }
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

  private generateId() {
    return crypto.createHash('sha256')
      .update(this.detail.sourceIPAddress)
      .digest('base64');
  }
}
