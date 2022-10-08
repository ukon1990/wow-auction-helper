import {middyfy} from '@libs/lambda';
import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {TsmService} from '@functions/tsm/tsm.service';

export const updateTSMData = middyfy(async (
  {apiKey, body, headers }: { headers: any, apiKey: string, body: { apiKey: string } }
): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  let response;
  try {
    await new TsmService(apiKey || body?.apiKey).updateAllRegions();
    response = formatJSONResponse({message: 'Successfully updated'});
  } catch (error) {
    console.error(error);
    response = formatErrorResponse(500, 'Could not update');
  }
  return response;
});