import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {AppSyncService} from '../app-sync.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {UpdateSettingsSubscription} from './subscriptions';
import {UserUtil} from '../../../../utils/user/user.util';
import {UserSettings} from '../../models/settings.model';
import {CreateSettingsMutation, DeleteSettingsMutation, UpdateSettingsMutation} from './mutations';
import {Character} from '../../../character/models/character.model';
import {GetSettings} from './setting.queries';
import {SharedService} from '../../../../services/shared.service';
import {CartItem, CartRecipe} from '../../../shopping-cart/models/shopping-cart-v2.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  hasLoaded = new BehaviorSubject<boolean>(false);
  isLoading = new BehaviorSubject<boolean>(false);
  isUpdatingSettings = new BehaviorSubject<boolean>(false);
  settings = new BehaviorSubject<UserSettings>(new UserSettings());
  realmChange = new BehaviorSubject<{ realm: string, region: string }>(undefined);
  cartChange = new BehaviorSubject<{ recipes: CartRecipe[], items: CartItem[] }>(undefined);
  private sm = new SubscriptionManager();

  constructor(private appSync: AppSyncService) {
    // setTimeout(() => this.createSettings(), 1000);
  }

  init(): void {
    // Object.assign(this.settings.value, SharedService.user);
    this.sm.add(
      this.appSync.client.subscribe({query: UpdateSettingsSubscription}),
      (res) => {
        if (!res) {
          return;
        }
        const {data} = res;
        console.log('Subscription update for settings', data);
        this.handleSettingsUpdate(data.onUpdateWahUserSettings);
      });
    /*
    this.sm.add(
      this.appSync.client.subscribe({query: CreateSettingsSubscription}),
      ({data}) => this.handleSettingsUpdate(data.onCreateWahUserSettings));
    */
  }

  createSettings() {
    if (!this.appSync.client) {
      return;
    }
    const settings = this.settings.value;
    const mutate = CreateSettingsMutation;
    this.appSync.client.mutate({
      mutation: mutate,
      variables: {
        input: {
          realm: settings.realm,
          region: settings.region,
          customPrices: [],
          customProcs: [],
          buyoutLimit: settings.buyoutLimit,
          useVendorPriceForCraftingIfAvailable: settings.useVendorPriceForCraftingIfAvailable,
          useIntermediateCrafting: settings.useIntermediateCrafting,
          characters: settings.characters,
          craftingStrategy: settings.craftingStrategy,
          locale: settings.locale
        },
      }
    })
      .then((res) => {
        if (!res) {
          return;
        }
        const {data} = res;
        this.handleSettingsUpdate(data['createWahUserSettings']);
        this.hasLoaded.next(true);
      })
      .catch(console.error);
  }

  reduceCharacters(characters: Character[]): { characters: { lastModified, slug, name }[] } {
    return {
      characters: characters.map(({lastModified, slug, name}) => ({
        lastModified, slug, name
      }))
    };
  }

  updateSettings(updateData: any) {
    console.log('Updating settings -> ', updateData, this.isUpdatingSettings.value);
    if (this.isUpdatingSettings.value) {
      return;
    }
    this.isUpdatingSettings.next(true);
    const settings = this.settings.value;
    Object.assign(settings, {
      ...updateData,
      characters: this.settings.value.characters,
    });
    this.settings.next(settings);
    if (!this.appSync.client) {
      return;
    }
    // UserUtil.save();

    this.appSync.client.mutate({
      mutation: UpdateSettingsMutation(),
      variables: {
        input: updateData,
      }
    })
      .then(settings => {
        this.isUpdatingSettings.next(false);
      }) // this.handleSettingsUpdate(settings as any)
      .catch(console.error);
  }

  deleteSettings() {
    if (!this.appSync.client) {
      return;
    }
    const mutate = DeleteSettingsMutation;
    this.appSync.client.mutate({
      mutation: mutate,
      variables: {
        input: {},
      }
    })
      .then(console.log)
      .catch(console.error);
  }

  getSettings() {
    if (!this.appSync.client) {
      return;
    }
    return new Promise<any>((resolve, reject) => {
      this.appSync.client.query({
        query: GetSettings,
        fetchPolicy: 'network-only' // network-only
      })
        .then((res) => {
          if (!res) {
            return;
          }
          const {data} = res;
          const settings: UserSettings = data['getWahUserSettings'];
          if (!settings) {
            this.createSettings();
          } else {
            this.handleSettingsUpdate(settings);
          }
          // TODO: Shopping cart sync fix!

          if (!this.hasLoaded.value) {
            this.hasLoaded.next(true);
          }
          resolve(settings);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });
  }

  private handleSettingsUpdate(settings: UserSettings) {
    const previousSettings: UserSettings = this.settings.value;
    console.log('Settings update', settings);

    if (!settings) {
      return;
    }
    Object.assign(SharedService.user, {
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

    if (this.hasLoaded.value && settings &&
      (
        settings.realm !== previousSettings.realm ||
        settings.region !== previousSettings.region
      )
    ) {
      this.realmChange.next({region: settings.region, realm: settings.realm});
    }

    UserUtil.save();
    this.settings.next(settings);
    return undefined;
  }
}
