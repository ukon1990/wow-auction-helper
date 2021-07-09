import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {AppSyncService} from '../app-sync.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {UserUtil} from '../../../../utils/user/user.util';
import {UserSettings} from '../../models/settings.model';
import {CreateSettingsMutation, DeleteSettingsMutation, UpdateSettingsMutation} from './mutations';
import {Character, SettingsCharacter} from '../../../character/models/character.model';
import {GetSettings} from './setting.queries';
import {SharedService} from '../../../../services/shared.service';
import {CartItem, CartRecipe} from '../../../shopping-cart/models/shopping-cart-v2.model';
import {Report} from '../../../../utils/report.util';
import {DashboardV2} from '../../../dashboard/models/dashboard-v2.model';
import {DashboardAppsyncUtil} from '../../../dashboard/utils/dashboard-appsync.util';
import {ErrorReport} from '../../../../utils/error-report.util';
import {DatabaseService} from '../../../../services/database.service';
import {BaseCraftingUtil} from '../../../crafting/utils/base-crafting.util';

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
  dashboards = new BehaviorSubject<DashboardV2[]>([]);
  private sm = new SubscriptionManager();

  constructor(private appSync: AppSyncService,
              private db: DatabaseService) {
    // setTimeout(() => this.createSettings(), 1000);
  }

  init(): void {
    // Object.assign(this.settings.value, SharedService.user);
    /* Will interfere with other users, so might as well not have it unless it should be globally synced
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
    */
    /*
    this.sm.add(
      this.appSync.client.subscribe({query: CreateSettingsSubscription}),
      ({data}) => this.handleSettingsUpdate(data.onCreateWahUserSettings));
    */
  }

  createSettings(settings = this.settings.value) {
    Report.debug('createSettings', settings);
    return new Promise(async (resolve, reject) => {
      if (!this.appSync.client || !this.appSync.isAuthenticated.value) {
        resolve();
        return;
      }
      if (!settings || !settings.realm || !settings.region) {
        reject();
        return;
      }
      let dashboards: DashboardV2[];
      await this.db.getDashboards()
        .then(boards => dashboards = boards)
        .catch(console.error);

      this.appSync.client.mutate({
        mutation: CreateSettingsMutation,
        variables: {
          input: {
            realm: settings.realm,
            ahId: settings.ahId,
            region: settings.region,
            locale: settings.locale || localStorage.getItem('locale') || 'en_GB',
            customPrices: JSON.stringify(settings.customPrices || []),
            customProcs: JSON.stringify(settings.customProcs || []),
            buyoutLimit: settings.buyoutLimit,
            useVendorPriceForCraftingIfAvailable: settings.useVendorPriceForCraftingIfAvailable,
            useIntermediateCrafting: settings.useIntermediateCrafting,
            characters: settings.characters ?
              this.reduceCharacters(settings.characters as Character[]).characters : [],
            dashboards: dashboards ?
              DashboardAppsyncUtil.reduce(dashboards) : [],
            craftingStrategy: settings.craftingStrategy || BaseCraftingUtil.STRATEGY.NEEDED,
          },
        }
      })
        .then((res) => {
          if (!res) {
            resolve();
            return;
          }
          const {data} = res;
          this.handleSettingsUpdate(data['createWahUserSettings']);
          this.hasLoaded.next(true);
          Report.debug('Successfully created settings');
          resolve();
        })
        .catch(error => {
          ErrorReport.sendError('SettingsService.createSettings', error);
          reject(error);
        });
    });
  }

  reduceCharacters(characters: Character[]): { characters: SettingsCharacter[] } {
    return {
      characters: characters.map(({lastModified, slug, name, faction}) => ({
        lastModified, slug, name, faction
      }))
    };
  }

  updateSettings(updateData: any) {
    Report.debug('updateSettings', updateData);
    if (this.isUpdatingSettings.value || !this.hasLoaded.value || !this.settings.value.realm) {
      return;
    }
    this.isUpdatingSettings.next(true);
    const settings = this.settings.value;
    Object.assign(settings, {
      ...updateData,
      characters: this.settings.value.characters,
    });
    this.settings.next(settings);
    if (!this.appSync.client || !this.appSync.isAuthenticated.value) {
      return;
    }
    // UserUtil.save();

    this.appSync.client.mutate({
      mutation: UpdateSettingsMutation(),
      variables: {
        input: updateData,
      }
    })
      .then(updatedSettings => {
        const {data} = updatedSettings;
        this.isUpdatingSettings.next(false);
        this.handleSettingsUpdate(data['updateWahUserSettings'] as any);
      })
      .catch(error =>
          ErrorReport.sendError('SettingsService.updateSettings', error));
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
      .catch(error =>
        ErrorReport.sendError('SettingsService.deleteSettings', error));
  }

  getSettings() {
    return new Promise<any>((resolve, reject) => {
      if (!this.appSync.client || !this.appSync.isAuthenticated.value) {
        resolve();
        return;
      }

      this.appSync.client.query({
        query: GetSettings,
        fetchPolicy: 'network-only' // network-only
      })
        .then(async (res) => {
          if (!res) {
            resolve();
            return;
          }
          const {data} = res;
          const settings: UserSettings = data['getWahUserSettings'];
          if (!settings) {
            try {
              const newSettings = new UserSettings();
              Object.assign(newSettings, UserUtil.getSettings());
              await this.createSettings(newSettings)
                .then(() => location.reload())
                .catch(console.error);
            } catch (error) {
              ErrorReport.sendError('SettingsService.getSettings', error);
            }
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
          ErrorReport.sendError('SettingsService.getSettings', error);
          reject(error);
        });
    });
  }

  /**
   * For removing __typename from the settings.
   * Doing this because I don't want to deal with modeling it out for everything
   * @param settings
   * @private
   */
  private removeTypeName(settings: any): void {
    const varName = '__typename';
    if (!settings) {
      return;
    }
    Object.keys(settings)
      .forEach(key => {
        if (typeof settings[key] === 'object') {
          this.removeTypeName(settings[key]);
        } else if (key === varName) {
          delete settings[key];
        }

        if (!settings[key] && settings[key] !== false) {
          delete settings[key];
        }
      });
  }

  private handleSettingsUpdate(settings: UserSettings) {
    const previousSettings: UserSettings = this.settings.value;

    if (!settings) {
      return;
    }
    try {
      if (typeof settings.customPrices === 'string') {
        try {
          settings.customPrices = JSON.parse(settings.customPrices);
        } catch (e) {}
      }
      if (typeof settings.customProcs === 'string') {
        try {
          settings.customProcs = JSON.parse(settings.customProcs);
        } catch (e) {}
      }
    } catch (error) {}

    this.removeTypeName(settings);
    Object.assign(SharedService.user, {
      locale: settings.locale,
      ahTypeId: settings.ahTypeId,
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

    if (
      settings.realm !== previousSettings.realm ||
      settings.region !== previousSettings.region
    ) {
      this.realmChange.next({region: settings.region, realm: settings.realm});
    }

    this.cartChange.next(settings.shoppingCart);

    this.dashboards.next(DashboardAppsyncUtil.unParseJSON(settings.dashboards));

    this.settings.next(settings);
    return undefined;
  }
}
