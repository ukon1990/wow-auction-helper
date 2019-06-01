import {Route, RouterModule} from '@angular/router';
import {SettingsComponent} from './components/settings.component';
import {IsRegisteredService} from '../../Is-registered.service';
import {GeneralSettingsComponent} from './components/general-settings/general-settings.component';
import {CraftingSettingsComponent} from './components/crafting-settings/crafting-settings.component';
import {CustomPricesComponent} from './components/crafting-settings/custom-prices/custom-prices.component';
import {CustomProcComponent} from './components/crafting-settings/custom-proc/custom-proc.component';
import {CharactersComponent} from '../character/components/characters.component';
import {NotificationSettingsComponent} from './components/notification-settings/notification-settings.component';
import {NgModule} from '@angular/core';

const routes: Route[] = [{
  path: 'settings',
  component: SettingsComponent,
  canActivate: [IsRegisteredService],
  children: [
    {path: '', component: GeneralSettingsComponent},
    {path: 'general', component: GeneralSettingsComponent},
    {
      path: 'crafting', component: CraftingSettingsComponent, children: [
        {path: '', component: CustomPricesComponent},
        {path: 'custom-prices', component: CustomPricesComponent},
        {path: 'custom-proc', component: CustomProcComponent}
      ]
    },
    {path: 'characters', component: CharactersComponent},
    {path: 'notifications', component: NotificationSettingsComponent}
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRouteModule {
}
