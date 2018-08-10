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
import { SellersComponent } from '../components/sellers/sellers.component';
import { TechnologyComponent } from '../components/about/technology/technology.component';
import { CustomProcComponent } from '../components/settings/crafting-settings/custom-proc/custom-proc.component';
import { CustomPricesComponent } from '../components/settings/crafting-settings/custom-prices/custom-prices.component';
import { MyPetsComponent } from '../components/my-pets/my-pets.component';
import { MarketResetComponent } from '../components/item/market-reset/market-reset.component';
import { ContributorsComponent } from '../components/about/contributors/contributors.component';
import { IssuesComponent } from '../components/about/issues/issues.component';
import { ChangelogComponent } from '../components/about/changelog/changelog.component';
import { MillingComponent } from '../components/crafting/milling/milling.component';
import { DisenchantingComponent } from '../components/crafting/disenchanting/disenchanting.component';

const routes: Routes = [
  { path: '', component: SetupComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [IsRegisteredService],
    children: [
      { path: '', component: DashboardItemsComponent },
      { path: 'items', component: DashboardItemsComponent },
      { path: 'sellers', component: DashboardSellersComponent },
      { path: 'manage-dashboards', component: WatchlistComponent }
    ]
  },
  { path: 'crafting', component: CraftingComponent, canActivate: [IsRegisteredService] },
  { path: 'auctions', component: AuctionsComponent, canActivate: [IsRegisteredService] },
  { path: 'my-auctions', component: MyAuctionsComponent, canActivate: [IsRegisteredService] },
  { path: 'watchlist', redirectTo: '/dashboard/manage-dashboards', canActivate: [IsRegisteredService] },
  { path: 'trade-vendor', component: TradeVendorsComponent, canActivate: [IsRegisteredService] },
  {
    path: 'tools', canActivate: [IsRegisteredService], children: [
      { path: 'trade-vendor', component: TradeVendorsComponent },
      { path: 'watchlist', redirectTo: '/dashboard/manage-dashboards' },
      { path: 'sellers', component: SellersComponent },
      { path: 'my-pets', component: MyPetsComponent },
      { path: 'market-reset', component: MarketResetComponent },
      { path: 'milling-and-prospecting', component: MillingComponent },
      { path: 'disenchanting', component: DisenchantingComponent }
    ]
  },
  { path: 'sellers', component: SellersComponent, canActivate: [IsRegisteredService] },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [IsRegisteredService],
    children: [
      { path: '', component: GeneralSettingsComponent },
      { path: 'general', component: GeneralSettingsComponent },
      {
        path: 'crafting', component: CraftingSettingsComponent, children: [
          { path: '', component: CustomPricesComponent },
          { path: 'custom-prices', component: CustomPricesComponent },
          { path: 'custom-proc', component: CustomProcComponent }
        ]
      },
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
      { path: 'privacy', component: AboutPrivacyComponent },
      { path: 'technology', component: TechnologyComponent },
      { path: 'contributors', component: ContributorsComponent },
      { path: 'issues', component: IssuesComponent },
      { path: 'changelog', component: ChangelogComponent }
    ]
  },
  { path: 'ud', component: UpdateComponent, canActivate: [IsRegisteredService] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
