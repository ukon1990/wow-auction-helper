import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../../utils/response.util';
import {CurrencyUtil} from '../../utils/currency.util';

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  CurrencyUtil.getList()
    .then(result => Response.send(result, callback))
    .catch(error => Response.error(callback, error, event, 500));
};