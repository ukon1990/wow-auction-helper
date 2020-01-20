import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {AuthHandler} from '../handlers/auth.handler';

exports.getAccessToken = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const body = JSON.parse(event.body),
    region = body.region,
    code = body.code,
    redirectURI = body.redirectURI;
  new AuthHandler()
    .getAccessToken(region, code, redirectURI)
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err));
};

exports.checkTokenHandler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const body = JSON.parse(event.body),
    region = body.region,
    token = body.token;
  new AuthHandler()
    .checkToken(region, token)
    .then(res => Response.send(res, callback))
    .catch(err => Response.error(callback, err));
};
