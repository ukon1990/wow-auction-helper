/* istanbul ignore next */
import {RealmService} from './service';
import {middyfy} from '@libs/lambda';
import {formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {AuthService} from '@shared/services/auth.service';

interface CloudTrailS3Event {
  detail: {
    requestParameters: {
      bucketName: string;
      Host: string;
      key: string;
    };
  };
}

export const updateActiveRealms = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  let response;
  const authService = new AuthService(event.headers);
  const isAdmin = await authService.isAdmin();

  if (isAdmin) {
    await new RealmService().updateActiveRealms()
      .then((data) => response = formatJSONResponse(data as any))
      .catch(err => response = formatErrorResponse(err.code, err.message, err));

  } else {
    response = authService.getUnauthorizedResponse();
  }

  return response;
});

export const addMissingRealms = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  let response;
  const authService = new AuthService(event.headers);
  const isAdmin = await authService.isAdmin();

  if (isAdmin) {
    await new RealmService().addMissingRealms()
      .then((data) => response = formatJSONResponse(data as any))
      .catch(err => response = formatErrorResponse(err.code, err.message, err));

  } else {
    response = authService.getUnauthorizedResponse();
  }

  return response;
});

export const getAllAuctionHouses = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  let response;
  const authService = new AuthService(event.headers);
  const isAdmin = await authService.isAdmin();

  if (isAdmin) {
    await new RealmService().getAll()
      .then((data) => response = formatJSONResponse(data as any))
      .catch(err => response = formatErrorResponse(err.code, err.message, err));

  } else {
    response = authService.getUnauthorizedResponse();
  }

  return response;
});

export const getUpdateLogForRealm = middyfy(async (event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  let response;

  const id = +event.pathParameters.id;
  await new RealmService().getUpdateLog(id, 24 * 7)
    .then((data) => response = formatJSONResponse(data as any))
    .catch(err => response = formatErrorResponse(err.code, err.message, err));

  return response;
});

/**
 * This function is used to make sure that realms that are actively used, does not get "deactivated" for hourly updates.
 * @param event
 * @param context
 * @param callback
 */
export const updateLastRequested = middyfy(async (event: CloudTrailS3Event): Promise<ValidatedEventAPIGatewayProxyEvent<any>> => {
  let response;

  const key = event.detail.requestParameters.key;
  const statusRegex = /status\/[a-z]{1,4}\/[0-9\-]{1,128}.json.gz/gi;
  const isAuctionFile = key.indexOf('auctions') > -1;
  const isStatusFile = statusRegex.exec(key) && key.indexOf('status') === 0;
  const isCommodity = key.indexOf('auctions/commodity/') > -1;

  if (!isAuctionFile && isStatusFile || isCommodity) {
    console.log('File event triggered for', key);
    const path = key.split('/');
    const id = isCommodity ? path[3] : path[2];

    console.log('Updating last requested for AH', id);
    await new RealmService().updateLastRequested(
      +id.replace('.json.gz', '')
    )
      .then((data) => response = formatJSONResponse(data as any))
      .catch(err => response = formatErrorResponse(err.code, err.message, err));
  } else {
    response = formatJSONResponse({message: 'Hello'} as any);
  }

  return response;
});