import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SetupComponent} from './settings/components/setup/setup.component';
import {CraftingComponent} from './core/components_/crafting/crafting.component';
import {IsRegisteredService} from '../Is-registered.service';
import {DashboardComponent} from './core/components_/dashboard/dashboard.component';
import {UpdateComponent} from './core/components_/update/update.component';
import {AuctionsComponent} from './core/components_/auctions/auctions.component';
import {AboutComponent} from './about/components/about.component';
import {MyAuctionsComponent} from './core/components_/auctions/my-auctions/my-auctions.component';
import {TradeVendorsComponent} from './core/components_/trade-vendors/trade-vendors.component';
import {WatchlistComponent} from './core/components_/watchlist/watchlist.component';
import {AboutCraftingComponent} from './about/components/about-crafting/about-crafting.component';
import {AboutPrivacyComponent} from './about/components/about-privacy/about-privacy.component';
import {AboutDataComponent} from './about/components/about-data/about-data.component';
import {AboutWhatIsComponent} from './about/components/about-what-is/about-what-is.component';
import {DashboardItemsComponent} from './core/components_/dashboard/dashboard-items/dashboard-items.component';
import {DashboardSellersComponent} from './core/components_/dashboard/dashboard-sellers/dashboard-sellers.component';
import {SellersComponent} from './sellers/components/sellers.component';
import {TechnologyComponent} from './about/components/technology/technology.component';
import {MyPetsComponent} from './core/components_/my-pets/my-pets.component';
import {MarketResetComponent} from './core/components_/item/market-reset/market-reset.component';
import {ContributorsComponent} from './about/components/contributors/contributors.component';
import {IssuesComponent} from './about/components/issues/issues.component';
import {ChangelogComponent} from './about/components/changelog/changelog.component';
import {MillingComponent} from './core/components_/crafting/milling/milling.component';
import {DisenchantingComponent} from './core/components_/crafting/disenchanting/disenchanting.component';
import {AhSummaryComponent} from './core/components_/dashboard/ah-summary/ah-summary.component';
import {ReputationsComponent} from './core/components_/reputations/reputations.component';
import {TsmAddonDbComponent} from './core/components_/tsm-addon-db/tsm-addon-db.component';

const routes: Routes = [
  {path: '', component: SetupComponent},
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [IsRegisteredService],
    children: [
      {path: '', component: DashboardItemsComponent},
      {path: 'items', component: DashboardItemsComponent},
      {path: 'sellers', component: DashboardSellersComponent},
      {path: 'ah-summary', component: AhSummaryComponent},
      {path: 'tsm', component: TsmAddonDbComponent},
      {path: 'manage-dashboards', component: WatchlistComponent}
    ]
  },
  {path: 'crafting', component: CraftingComponent, canActivate: [IsRegisteredService]},
  {path: 'auctions', component: AuctionsComponent, canActivate: [IsRegisteredService]},
  {path: 'my-auctions', component: MyAuctionsComponent, canActivate: [IsRegisteredService]},
  {path: 'watchlist', redirectTo: '/dashboard/manage-dashboards', canActivate: [IsRegisteredService]},
  {path: 'trade-vendor', component: TradeVendorsComponent, canActivate: [IsRegisteredService]},
  {
    path: 'tools', canActivate: [IsRegisteredService], children: [
      {path: 'trade-vendor', component: TradeVendorsComponent},
      {path: 'watchlist', redirectTo: '/dashboard/manage-dashboards'},
      {path: 'sellers', component: SellersComponent},
      {path: 'my-pets', component: MyPetsComponent},
      {path: 'market-reset', component: MarketResetComponent},
      {path: 'milling-and-prospecting', component: MillingComponent},
      {path: 'disenchanting', component: DisenchantingComponent},
      {path: 'reputations', component: ReputationsComponent}
    ]
  },
  {path: 'sellers', component: SellersComponent, canActivate: [IsRegisteredService]},
  {
    path: 'about',
    component: AboutComponent,
    children: [
      {path: '', component: AboutWhatIsComponent},
      {path: 'what-is', component: AboutWhatIsComponent},
      {path: 'crafting', component: AboutCraftingComponent},
      {path: 'where-is-the-data-from', component: AboutDataComponent},
      {path: 'privacy', component: AboutPrivacyComponent},
      {path: 'technology', component: TechnologyComponent},
      {path: 'contributors', component: ContributorsComponent},
      {path: 'issues', component: IssuesComponent},
      {path: 'changelog', component: ChangelogComponent}
    ]
  },
  {path: 'ud', component: UpdateComponent, canActivate: [IsRegisteredService]},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
