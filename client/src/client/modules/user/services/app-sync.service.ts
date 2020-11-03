import {Injectable} from '@angular/core';
import {Auth} from '@aws-amplify/auth';
import {AUTH_TYPE, AWSAppSyncClient} from 'aws-appsync';
import {APP_SYNC} from '../../../secrets';
import {GetSettings} from '../graphql/setting.queries';
import {CreateSettingsMutation, DeleteSettingsMutation, UpdateSettingsMutation} from '../graphql/mutations';
import {User} from '../../../models/user/user';
import {UserUtil} from '../../../utils/user/user.util';
import {Character} from '../../character/models/character.model';
import {ShoppingCartService} from '../../shopping-cart/services/shopping-cart.service';
import {BehaviorSubject} from 'rxjs';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {CreateSettingsSubscription, UpdateSettingsSubscription} from '../graphql/subscriptions';

@Injectable({
  providedIn: 'root'
})
export class AppSyncService {
  settings: BehaviorSubject<User> = new BehaviorSubject<User>(undefined);
  realmChange: BehaviorSubject<{realm: string, region: string}> = new BehaviorSubject(undefined);
  private readonly client: AWSAppSyncClient<any>;
  // In case someone starts the dev environment without APP_SYNC configured
  private readonly hasConfig = APP_SYNC && APP_SYNC.aws_appsync_graphqlEndpoint;
  private user: User;
  private shoppingCartService: ShoppingCartService;
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

    /*
    this.sm.add(
      this.client.subscribe({query: CreateSettingsSubscription}),
      ({data}) => this.handleSettingsUpdate(data.onCreateWahUserSettings));
    */
    this.sm.add(
      this.client.subscribe({query: UpdateSettingsSubscription}),
      ({data}) => this.handleSettingsUpdate(data.onUpdateWahUserSettings));
    setTimeout(() => this.createSettings(), 1000);
  }

  setInitial(user: User, shoppingCartService: ShoppingCartService) {
    this.user = user;
    this.shoppingCartService = shoppingCartService;

    // UserUtil.restore();
    // SharedService.user.shoppingCart = new ShoppingCart(this.auctionService);
    // ProspectingAndMillingUtil.restore();
  }

  createSettings() {
    if (!this.client) {
      return;
    }
    const mutate = CreateSettingsMutation;
    const user: User = this.user;
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
      .then(settings =>
        this.handleSettingsUpdate(settings as any))
      .catch(console.error);
  }

  reduceCharacters(characters: Character[]): {characters: {lastModified, slug, name}[]} {
    return {
      characters: characters.map(({lastModified, slug, name}) => ({
        lastModified, slug, name
      }))
    };
  }

  updateSettings(updateData: any) {
    Object.assign(this.user, {
      ...updateData,
      characters: this.user.characters,
    });
    UserUtil.save();
    if (!this.client) {
      return;
    }

    this.client.mutate({
      mutation: UpdateSettingsMutation(Object.keys(updateData)),
      variables: {
        input: updateData,
      }
    })
      .then(settings => this.handleSettingsUpdate(settings as any))
      .catch(console.error);
  }

  deleteSettings() {
    if (!this.client) {
      return;
    }
    const mutate = DeleteSettingsMutation;
    this.client.mutate({
      mutation: mutate,
      variables: {
        input: {},
      }
    })
      .then(console.log)
      .catch(console.error);
  }

  getSettings() {
    if (!this.client) {
      return;
    }
    return new Promise<any>((resolve, reject) => {
      this.client.query({
        query: GetSettings,
        fetchPolicy: 'network-only'
      })
        .then(({data}) => {
          this.handleSettingsUpdate(data['getWahUserSettings'] as User);
          // TODO: Shopping cart sync fix!
          resolve();
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });
  }

  private handleSettingsUpdate(settings: User) {
    console.log('Settings update', settings);

    if (!settings) {
      return;
    }
    if (settings && (settings.realm !== this.user.realm || settings.region !== this.user.region)) {
      this.realmChange.next({region: settings.region, realm: settings.realm});
    }
    Object.assign(this.user, {
      locale: settings.locale,
      faction: settings.faction,
      region: settings.region,
      realm: settings.realm,
      customPrices: settings.customPrices,
      customProcs: settings.customProcs,
      buyoutLimit: settings.buyoutLimit,
      useVendorPriceForCraftingIfAvailable: settings.useVendorPriceForCraftingIfAvailable,
      useIntermediateCrafting: settings.useIntermediateCrafting,
      craftingStrategy: settings.craftingStrategy,
    });
    UserUtil.save();
    this.settings.next(settings);
    return undefined;
  }
}
