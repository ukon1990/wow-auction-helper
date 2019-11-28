import {APIGatewayEvent, Callback} from 'aws-lambda';
import {GzipUtil} from './gzip.util';

export class Response {
  public static async send(body: any, callback: Callback) {
    new GzipUtil().compress(body)
      .then(obj =>
        callback(null, {
          statusCode: 200,
          body: obj.toString('base64'),
          isBase64Encoded: true,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Content-Encoding': 'gzip',
            'Character-Encoding': 'UTF8'
          }
        }))
      .catch(console.error);
  }

  public static error(callback: Callback, error?, event?: APIGatewayEvent, statusCode?: number): any {
    if (error) {
      console.error(error);
    }
    return Response.send({
      statusCode: statusCode || 500,
      error: this.getErrorMessage(error),
      event: this.getEvent(event)
    }, callback);
  }

  private static getEvent(event: APIGatewayEvent) {
    return event && event.requestContext.stage === 'dev' ? event : undefined;
  }

  private static getErrorMessage(error) {
    if (error) {
      return error.message ? error.message : error;
    }
    return 'Malormed request';
  }
}
