import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SetupComponent } from '../components/settings/setup/setup.component';
import { CraftingComponent } from '../components/crafting/crafting.component';
import { SettingsComponent } from '../components/settings/settings.component';
import { IsRegisteredService } from '../Is-registered.service';
import { DashboardComponent } from '../components/dashboard/dashboard.component';
import { UpdateComponent } from '../components/update/update.component';
import { AuctionsComponent } from '../components/auctions/auctions.component';
import { AboutComponent } from '../components/about/about.component';
import { MyAuctionsComponent } from '../components/auctions/my-auctions/my-auctions.component';
import { TradeVendorsComponent } from '../components/trade-vendors/trade-vendors.component';
import { WatchlistComponent } from '../components/watchlist/watchlist.component';
import { GeneralSettingsComponent } from '../components/settings/general-settings/general-settings.component';
import { CraftingSettingsComponent } from '../components/settings/crafting-settings/crafting-settings.component';
import { CharactersComponent } from '../components/settings/characters/characters.component';
import { NotificationSettingsComponent } from '../components/settings/notification-settings/notification-settings.component';
import { AboutCraftingComponent } from '../components/about/about-crafting/about-crafting.component';
import { AboutPrivacyComponent } from '../components/about/about-privacy/about-privacy.component';
import { AboutDataComponent } from '../components/about/about-data/about-data.component';
import { AboutWhatIsComponent } from '../components/about/about-what-is/about-what-is.component';
import { DashboardItemsComponent } from '../components/dashboard/dashboard-items/dashboard-items.component';
import { DashboardSellersComponent } from '../components/dashboard/dashboard-sellers/dashboard-sellers.component';

const routes: Routes = [
  { path: '', component: SetupComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [ IsRegisteredService ],
    children: [
      { path: '', component: DashboardItemsComponent },
      { path: 'items', component: DashboardItemsComponent },
      { path: 'sellers', component: DashboardSellersComponent }
    ]
  },
  { path: 'crafting', component: CraftingComponent, canActivate: [ IsRegisteredService ] },
  { path: 'auctions', component: AuctionsComponent, canActivate: [ IsRegisteredService ] },
  { path: 'my-auctions', component: MyAuctionsComponent, canActivate: [ IsRegisteredService ] },
  { path: 'watchlist', component: WatchlistComponent, canActivate: [ IsRegisteredService ] },
  { path: 'trade-vendor', component: TradeVendorsComponent, canActivate: [ IsRegisteredService ] },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate:  [ IsRegisteredService ],
    children: [
      { path: '', component: GeneralSettingsComponent },
      { path: 'general', component: GeneralSettingsComponent },
      { path: 'crafting', component: CraftingSettingsComponent },
      { path: 'characters', component: CharactersComponent },
      { path: 'notifications', component: NotificationSettingsComponent }
    ]
  },
  {
    path: 'about',
    component: AboutComponent,
    children: [
      { path: '', component: AboutWhatIsComponent },
      { path: 'what-is', component: AboutWhatIsComponent },
      { path: 'crafting', component: AboutCraftingComponent },
      { path: 'where-is-the-data-from', component: AboutDataComponent },
      { path: 'privacy', component: AboutPrivacyComponent }
    ]
  },
  { path: 'ud', component: UpdateComponent, canActivate: [ IsRegisteredService ] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
