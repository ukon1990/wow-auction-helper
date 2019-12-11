import {Route, RouterModule, Routes} from '@angular/router';
import {SettingsComponent} from './components/settings.component';
import {IsRegisteredService} from '../../Is-registered.service';
import {GeneralSettingsComponent} from './components/general-settings/general-settings.component';
import {CraftingSettingsComponent} from './components/crafting-settings/crafting-settings.component';
import {CustomPricesComponent} from './components/crafting-settings/custom-prices/custom-prices.component';
import {CustomProcComponent} from './components/crafting-settings/custom-proc/custom-proc.component';
import {CharactersComponent} from '../character/components/characters.component';
import {NotificationSettingsComponent} from './components/notification-settings/notification-settings.component';
import {TitledRoute} from '../../models/route/titled-route.model';

export const SETTINGS_ROUTE: TitledRoute = {
  path: 'settings',
  component: SettingsComponent,
  canActivate: [IsRegisteredService],
  children: [
    {
      title: 'Settings | General', path: '', component: GeneralSettingsComponent
    },
    {path: 'general', component: GeneralSettingsComponent},
    {
      path: 'crafting', component: CraftingSettingsComponent, children: [
        {
          title: 'Settings | Custom prices', path: '', component: CustomPricesComponent
        },
        {
          title: 'Settings | Custom prices', path: 'custom-prices', component: CustomPricesComponent
        },
        {
          title: 'Settings | Custom proc rates', path: 'custom-proc', component: CustomProcComponent
        }
      ]
    },
    {
      title: 'Settings | Characters', path: 'characters', component: CharactersComponent
    },
    {
      title: 'Settings | Notifications', path: 'notifications', component: NotificationSettingsComponent
    }]
};
