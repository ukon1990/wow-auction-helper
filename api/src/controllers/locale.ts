import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {LocaleHandler} from '../handlers/locale.handler';

/* istanbul ignore next */
exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) =>
  LocaleController.findMissingLocales(event, callback);

export class LocaleController {
  /* istanbul ignore next */
  static findMissingLocales(event: APIGatewayEvent, callback: Callback) {
    if (this.isNotInAWS(event)) {
      new LocaleHandler()
        .findMissingLocales(event, callback);
    }
  }

  /* istanbul ignore next */
  private static isNotInAWS(event: APIGatewayEvent) {
    return event.requestContext.accountId === 'offlineContext_accountId';
  }
}
