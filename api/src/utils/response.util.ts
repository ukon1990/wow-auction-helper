import {APIGatewayEvent, Callback} from 'aws-lambda';
import {GzipUtil} from './gzip.util';

export class Response {
  public static send(body: any, callback: Callback, needsEncoding = true, statusCode: number = 200) {
    try {
      if (!needsEncoding) {
        callback(null, this.getResponse(body, statusCode));
      } else {
        new GzipUtil().compress(body)
          .then(obj =>
            callback(null, this.getResponse(obj, statusCode)))
          .catch(console.error);
      }
    } catch (e) {
      Response.error(callback, e);
    }
  }

  private static getResponse(obj: Buffer, statusCode: number = 200) {
    return {
      statusCode,
      body: obj.toString('base64'),
      isBase64Encoded: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
        'Character-Encoding': 'UTF8'
      }
    };
  }

  public static error(callback: Callback, error?, event?: APIGatewayEvent, statusCode?: number): any {
    if (error) {
      console.error(error);
    }
    Response.send({
      status: statusCode || 500,
      error: this.getErrorMessage(error),
      event: this.getEvent(event)
    }, callback, undefined, statusCode || 500);
  }

  private static getEvent(event: APIGatewayEvent) {
    return event && event.requestContext && event.requestContext.stage === 'dev' ? event : undefined;
  }

  private static getErrorMessage(error) {
    if (error) {
      return error.message ? error.message : error;
    }
    return 'Malormed request';
  }
}