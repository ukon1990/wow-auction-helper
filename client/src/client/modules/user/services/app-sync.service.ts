import {Injectable} from '@angular/core';
import {Auth} from '@aws-amplify/auth';
import {AUTH_TYPE, AWSAppSyncClient} from 'aws-appsync';
import {APP_SYNC} from '../../../secrets';
import {GetSettings} from './settings/setting.queries';
import {CreateSettingsMutation, DeleteSettingsMutation, UpdateSettingsMutation} from './settings/mutations';
import {User} from '../../../models/user/user';
import {UserUtil} from '../../../utils/user/user.util';
import {Character} from '../../character/models/character.model';
import {ShoppingCartService} from '../../shopping-cart/services/shopping-cart.service';
import {BehaviorSubject} from 'rxjs';
import {SubscriptionManager} from '@ukon1990/subscription-manager';

@Injectable({
  providedIn: 'root'
})
export class AppSyncService {
  readonly client: AWSAppSyncClient<any>;
  // In case someone starts the dev environment without APP_SYNC configured
  private readonly hasConfig = APP_SYNC && APP_SYNC.aws_appsync_graphqlEndpoint;
  private sm = new SubscriptionManager();

  constructor() {
    if (!this.hasConfig) {
      console.log('There is no config available for AWS AppSync');
      return;
    }
    this.client = new AWSAppSyncClient({
      url: APP_SYNC.aws_appsync_graphqlEndpoint,
      region: APP_SYNC.aws_project_region,
      auth: {
        type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
        jwtToken: async () => (await Auth.currentSession()).getIdToken().getJwtToken()
      }
    });
  }

  setInitial(shoppingCartService: ShoppingCartService) {
    // this.shoppingCartService = shoppingCartService;

    // UserUtil.restore();
    // SharedService.user.shoppingCart = new ShoppingCart(this.auctionService);
    // ProspectingAndMillingUtil.restore();
  }
}
