import {Injectable} from '@angular/core';
import {Auth} from '@aws-amplify/auth';
import {AUTH_TYPE, AWSAppSyncClient} from 'aws-appsync';
import {APP_SYNC} from '../../../secrets';
import {BehaviorSubject} from 'rxjs';
import {TextUtil} from '@ukon1990/js-utilities';
import {ErrorReport} from '../../../utils/error-report.util';

@Injectable({
  providedIn: 'root'
})
export class AppSyncService {
  readonly client: AWSAppSyncClient<any>;
  // In case someone starts the dev environment without APP_SYNC configured
  private readonly hasConfig = APP_SYNC && APP_SYNC.aws_appsync_graphqlEndpoint;
  public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    if (!this.hasConfig) {
      console.log('There is no config available for AWS AppSync');
      return;
    }
    this.client = new AWSAppSyncClient({
      url: APP_SYNC.aws_appsync_graphqlEndpoint,
      region: APP_SYNC.aws_project_region,
      offlineConfig: {
        storage: {
          // TODO: Validate if it works
          cacheRootMutation: false
        }
      },
      disableOffline: true,
      auth: {
        type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
        jwtToken: async () => (await Auth.currentSession()).getIdToken().getJwtToken()
      }
    });

    try {
      Object.keys(localStorage)
        .forEach(key => {
          if (TextUtil.contains(key, 'reduxPersist')) {
            localStorage.removeItem(key);
          }
        });
    } catch (error) {
      ErrorReport.sendError('AppSyncService.constructor', error);
    }
  }
}
