import {Injectable} from '@angular/core';
import {Auth} from '@aws-amplify/auth';
import {AUTH_TYPE, AWSAppSyncClient} from 'aws-appsync';
import {APP_SYNC} from '../../../secrets';
import {GetSettings} from '../graphql/setting.queries';
import {CreateSettingsMutation, DeleteSettingsMutation, UpdateSettingsMutation} from '../graphql/mutations';
import {SharedService} from '../../../services/shared.service';
import {User} from '../../../models/user/user';
import {ShoppingCartService} from '../../shopping-cart/services/shopping-cart.service';

@Injectable({
  providedIn: 'root'
})
export class AppSyncService {
  readonly client: AWSAppSyncClient<any>;

  constructor(private shoppingCartService: ShoppingCartService) {
    this.client = new AWSAppSyncClient({
      url: APP_SYNC.aws_appsync_graphqlEndpoint,
      region: APP_SYNC.aws_project_region,
      auth: {
        type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
        jwtToken: async () => (await Auth.currentSession()).getIdToken().getJwtToken()
      }
    });

    // setTimeout(() => this.createSettings(), 1000);
  }

  createSettings() {
    const mutate = CreateSettingsMutation;
    const user: User = SharedService.user;
    const {recipes, items} = this.shoppingCartService;
    this.client.mutate({
      mutation: mutate,
      variables: {
        input: {
          realm: user.realm,
          region: user.region,
          customPrices: [],
          customProcs: [],
          buyoutLimit: user.buyoutLimit,
          useVendorPriceForCraftingIfAvailable: user.useVendorPriceForCraftingIfAvailable,
          useIntermediateCrafting: user.useIntermediateCrafting,
          shoppingCart: {
            recipes: recipes.value,
            items: items.value,
          },
          craftingStrategy: user.craftingStrategy,
          locale: localStorage.getItem('locale'),
          lastModified: +new Date(),
          created: +new Date(),
        },
      }
    })
      .then(console.log)
      .catch(console.error);
  }

  updateSettings() {
    const mutate = UpdateSettingsMutation;
    this.client.mutate({
      mutation: mutate,
      variables: {
        input: {
          ...SharedService.user,
          lastModified: +new Date()
        },
      }
    })
      .then(console.log)
      .catch(console.error);
  }

  deleteSettings() {
    const mutate = DeleteSettingsMutation;
    this.client.mutate({
      mutation: mutate,
      variables: {
        input: {
          ...SharedService.user,
          lastModified: +new Date()
        },
      }
    })
      .then(console.log)
      .catch(console.error);
  }

  getSettings() {
    return new Promise<any>((resolve, reject) => {
      this.client.query({
        query: GetSettings,
        fetchPolicy: 'network-only'
      })
        .then(result => {
          console.log('Settings are', result),
          resolve(result);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });
  }
}
