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
import { Watchlist } from '../models/user/watchlist';

const routes: Routes = [
  { path: '', component: SetupComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [ IsRegisteredService ]},
  { path: 'crafting', component: CraftingComponent, canActivate: [ IsRegisteredService ] },
  { path: 'auctions', component: AuctionsComponent, canActivate: [ IsRegisteredService ] },
  { path: 'my-auctions', component: MyAuctionsComponent, canActivate: [ IsRegisteredService ] },
  { path: 'watchlist', component: Watchlist, canActivate: [ IsRegisteredService ] },
  { path: 'trade-vendor', component: TradeVendorsComponent, canActivate: [ IsRegisteredService ] },
  { path: 'settings', component: SettingsComponent, canActivate:  [ IsRegisteredService ] },
  { path: 'about', component: AboutComponent },
  { path: 'ud', component: UpdateComponent, canActivate: [ IsRegisteredService ] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
