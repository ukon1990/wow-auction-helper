import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavbarComponent} from './components/navbar/navbar.component';
import {AuctionsComponent} from './components/auctions/auctions.component';
import {UpdateComponent} from './components/update/update.component';
import {DownloadComponent} from './components/navbar/download/download.component';
import {ItemComponent} from './components/item/item.component';
import {LineChartComponent} from './components/item/line-chart/line-chart.component';
import {ResetCalcComponent} from './components/item/reset-calc/reset-calc.component';
import {MyAuctionsComponent} from './components/auctions/my-auctions/my-auctions.component';
import {TradeVendorsComponent} from './components/trade-vendors/trade-vendors.component';
import {MarketResetComponent} from './components/item/market-reset/market-reset.component';
import {ItemSellerChartComponent} from './components/item/item-seller-chart/item-seller-chart.component';
import {FooterComponent} from './components/footer/footer.component';
import {AddItemsComponent} from './components/update/add-items/add-items.component';
import {AddRecipesComponent} from './components/update/add-recipes/add-recipes.component';
import {ReputationsComponent} from './components/reputations/reputations.component';
import {CharacterReputationComponent} from './components/reputations/character-reputation/character-reputation.component';
import {AppUpdateComponent} from './components/update/app-update/app-update.component';
import {MaterialModule} from '../material.module';
import {TableModule} from '../table/table.module';
import {IconModule} from '../icon/icon.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CharacterModule} from '../character/character.module';
import {UtilModule} from '../util/util.module';
import {TsmModule} from '../tsm/tsm.module';
import {ShoppingCartModule} from '../shopping-cart/shopping-cart.module';
import {AboutModule} from '../about/about.module';
import { MenuComponent } from './components/menu/menu.component';
import {MatBadgeModule, MatGridListModule, MatMenuModule} from '@angular/material';
import { CharacterSelectComponent } from './components/menu/character-select/character-select.component';
import { ThemeSelectComponent } from './components/theme-select/theme-select.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {fas} from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [
    NavbarComponent,
    AuctionsComponent,
    UpdateComponent,
    DownloadComponent,
    ItemComponent,
    LineChartComponent,
    ResetCalcComponent,
    MyAuctionsComponent,
    TradeVendorsComponent,
    MarketResetComponent,
    ItemSellerChartComponent,
    FooterComponent,
    AddItemsComponent,
    AddRecipesComponent,
    AddRecipesComponent,
    ReputationsComponent,
    CharacterReputationComponent,
    AppUpdateComponent,
    MenuComponent,
    CharacterSelectComponent,
    ThemeSelectComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    TableModule,
    CharacterModule,
    IconModule,
    RouterModule,
    UtilModule,
    TsmModule,
    ShoppingCartModule,
    AboutModule,
    MatMenuModule,
    MatGridListModule,
    MatBadgeModule,
    FontAwesomeModule
  ],
  exports: [NavbarComponent, FooterComponent, ItemComponent, AppUpdateComponent, MenuComponent]
})
export class CoreModule {
  constructor() {
    library.add(fas);
  }
}
