import {NgModule} from '@angular/core';
import {Route, RouterModule, Routes} from '@angular/router';
import {SetupComponent} from './settings/components/setup/setup.component';
import {CraftingComponent} from './crafting/components/crafting.component';
import {IsRegisteredService} from '../Is-registered.service';
import {DashboardComponent} from './dashboard/components/dashboard.component';
import {UpdateComponent} from './core/components/update/update.component';
import {AuctionsComponent} from './auction/components/auctions/auctions.component';
import {MyAuctionsComponent} from './auction/components/my-auctions/my-auctions.component';
import {TradeVendorsComponent} from './core/components/trade-vendors/trade-vendors.component';
import {WatchlistComponent} from './dashboard/components/manage/watchlist.component';
import {DashboardItemsComponent} from './dashboard/components/dashboard-items/dashboard-items.component';
import {DashboardSellersComponent} from './dashboard/components/dashboard-sellers/dashboard-sellers.component';
import {SellersComponent} from './sellers/components/sellers.component';
import {PetsValueComponent} from './pet/components/pets-value.component';
import {MarketResetComponent} from './market-reset/components/market-reset/market-reset.component';
import {MillingComponent} from './crafting/components/milling/milling.component';
import {DisenchantingComponent} from './crafting/components/disenchanting/disenchanting.component';
import {AhSummaryComponent} from './dashboard/components/ah-summary/ah-summary.component';
import {ReputationsComponent} from './core/components/reputations/reputations.component';
import {TsmAddonDbComponent} from './tsm/components/tsm-addon-db.component';
import {SETTINGS_ROUTE} from './settings/settings.routes';
import {ABOUT_ROUTE} from './about/about.route';
import {ProfitSummaryComponent} from './tsm/components/profit-summary/profit-summary.component';
import {TsmDatasetComponent} from './tsm/components/tsm-dataset/tsm-dataset.component';

const TOOLS_ROUTE: Route = {
  path: 'tools',
  canActivate: [IsRegisteredService],
  children: [
    {path: 'trade-vendor', component: TradeVendorsComponent},
    {path: 'watchlist', redirectTo: '/dashboard/manage-dashboards'},
    {path: 'sellers', component: SellersComponent},
    {path: 'pet-value', component: PetsValueComponent},
    {path: 'market-reset', component: MarketResetComponent},
    {path: 'milling-and-prospecting', component: MillingComponent},
    {path: 'disenchanting', component: DisenchantingComponent},
    {path: 'reputations', component: ReputationsComponent},
    {
      path: 'tsm', component: TsmAddonDbComponent, children: [
        {path: 'summary', component: ProfitSummaryComponent},
        {
          path: 'dataset', component: TsmDatasetComponent, children: [
            {path: ':name', component: TsmDatasetComponent}
          ]
        }
      ]
    }
  ]
};

const DASHBOARD_ROUTE: Route = {
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [IsRegisteredService],
  children: [
    {path: '', component: DashboardItemsComponent},
    {path: 'items', component: DashboardItemsComponent},
    {path: 'sellers', component: DashboardSellersComponent},
    {path: 'ah-summary', component: AhSummaryComponent},
    {path: 'tsm', redirectTo: '/tools/tsm'},
    {path: 'manage-dashboards', component: WatchlistComponent}
  ]
};

const routes: Routes = [
  {path: '', component: SetupComponent},
  DASHBOARD_ROUTE,
  {path: 'crafting', component: CraftingComponent, canActivate: [IsRegisteredService]},
  {path: 'auctions', component: AuctionsComponent, canActivate: [IsRegisteredService]},
  {path: 'my-auctions', component: MyAuctionsComponent, canActivate: [IsRegisteredService]},
  {path: 'trade-vendor', component: TradeVendorsComponent, canActivate: [IsRegisteredService]},
  TOOLS_ROUTE,
  SETTINGS_ROUTE,
  ABOUT_ROUTE,
  {path: 'ud', component: UpdateComponent, canActivate: [IsRegisteredService]},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
