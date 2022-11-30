import {ItemServiceV2} from './service';
import {middyfy} from '@libs/lambda';
import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {AuthService} from '../../shared/services/auth.service';
import {BLIZZARD} from '../../secrets';

export const findMissingItemsAndImport = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  // If it is a CloudEvent then the parameters are set directly onto the event. If not it is in the body
  let clientId = event['clientId'];
  let clientSecret = event['clientSecret'];
  const isClassic = event['isClassic'] || event.body?.isClassic || false;
  const service = new ItemServiceV2(isClassic);
  const authService = new AuthService(event.headers);
  const isAdmin = await authService.isAdmin();
  let response;

  if (event.body && !isAdmin) {
    response = authService.getUnauthorizedResponse();
  } else {
    if (isAdmin) {
      clientId = BLIZZARD.CLIENT_ID;
      clientSecret = BLIZZARD.CLIENT_SECRET;
    }

    await service.findMissingItemsAndImport(clientId, clientSecret)
      .then((result) => response = formatJSONResponse(result as any))
      .catch(err => response = formatErrorResponse(err.code, err.message, err));
  }

  return response;
});