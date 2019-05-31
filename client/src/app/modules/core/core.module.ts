import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IconComponent} from '../icon/icon.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {MenuComponent} from './components/navbar/menu/menu.component';
import {CraftingComponent} from './components/crafting/crafting.component';
import {GoldPipe} from '../../pipes/gold.pipe';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {DashboardItemComponent} from './components/dashboard/dashboard-item/dashboard-item.component';
import {AuctionsComponent} from './components/auctions/auctions.component';
import {UpdateComponent} from './components/update/update.component';
import {DownloadComponent} from './components/navbar/download/download.component';
import {ShoppingCartComponent} from './components/navbar/shopping-cart/shopping-cart.component';
import {ItemComponent} from './components/item/item.component';
import {LineChartComponent} from './components/item/line-chart/line-chart.component';
import {ResetCalcComponent} from './components/item/reset-calc/reset-calc.component';
import {MyAuctionsComponent} from './components/auctions/my-auctions/my-auctions.component';
import {TradeVendorsComponent} from './components/trade-vendors/trade-vendors.component';
import {WatchlistComponent} from './components/watchlist/watchlist.component';
import {WatchlistItemComponent} from './components/watchlist/watchlist-item/watchlist-item.component';
import {WatchlistManagerComponent} from './components/watchlist/watchlist-manager/watchlist-manager.component';
import {DashboardItemsComponent} from './components/dashboard/dashboard-items/dashboard-items.component';
import {DashboardSellersComponent} from './components/dashboard/dashboard-sellers/dashboard-sellers.component';
import {WatchlistItemManagerComponent} from './components/watchlist/watchlist-item-manager/watchlist-item-manager.component';
import {MyPetsComponent} from './components/my-pets/my-pets.component';
import {MarketResetComponent} from './components/item/market-reset/market-reset.component';
import {ItemSellerChartComponent} from './components/item/item-seller-chart/item-seller-chart.component';
import {WatchlistItemBatchComponent} from './components/watchlist/watchlist-item-batch/watchlist-item-batch.component';
import {MillingComponent} from './components/crafting/milling/milling.component';
import {DisenchantingComponent} from './components/crafting/disenchanting/disenchanting.component';
import {DataBoardsComponent} from './components/crafting/data-boards/data-boards.component';
import {ShuffleItemManageComponent} from './components/crafting/shuffle-item-manage/shuffle-item-manage.component';
import {ManageItemsBuiltInComponent} from './components/dashboard/manage-items-built-in/manage-items-built-in.component';
import {ManageItemsBuiltInItemComponent} from './components/dashboard/manage-items-built-in-item/manage-items-built-in-item.component';
import {FooterComponent} from './components/footer/footer.component';
import {AddItemsComponent} from './components/update/add-items/add-items.component';
import {AddRecipesComponent} from './components/update/add-recipes/add-recipes.component';
import {AhSummaryComponent} from './components/dashboard/ah-summary/ah-summary.component';
import {ChartsComponent} from './components/charts/charts.component';
import {SummaryCardComponent} from './components/dashboard/ah-summary/summary-card/summary-card.component';
import {ReputationsComponent} from './components/reputations/reputations.component';
import {CharacterReputationComponent} from './components/reputations/character-reputation/character-reputation.component';
import {TsmAddonDbComponent} from './components/tsm-addon-db/tsm-addon-db.component';
import {ProfitSummaryComponent} from './components/tsm-addon-db/profit-summary/profit-summary.component';
import {ProfitSummaryCardComponent} from './components/tsm-addon-db/profit-summary-card/profit-summary-card.component';
import {ItemSaleSummaryComponent} from './components/tsm-addon-db/item-sale-summary/item-sale-summary.component';
import {AppUpdateComponent} from './components/update/app-update/app-update.component';
import {MaterialModule} from '../material.module';
import {TableModule} from '../table/table.module';
import {IconModule} from '../icon/icon.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SettingsModule} from '../settings/settings.module';

@NgModule({
  declarations: [
    NavbarComponent,
    MenuComponent,
    CraftingComponent,
    GoldPipe,
    DashboardComponent,
    DashboardItemComponent,
    AuctionsComponent,
    UpdateComponent,
    DownloadComponent,
    ShoppingCartComponent,
    ItemComponent,
    LineChartComponent,
    ResetCalcComponent,
    MyAuctionsComponent,
    TradeVendorsComponent,
    WatchlistComponent,
    WatchlistItemComponent,
    WatchlistManagerComponent,
    DashboardItemsComponent,
    DashboardSellersComponent,
    WatchlistItemManagerComponent,
    MyPetsComponent,
    MarketResetComponent,
    ItemSellerChartComponent,
    WatchlistItemBatchComponent,
    MillingComponent,
    DisenchantingComponent,
    DataBoardsComponent,
    ShuffleItemManageComponent,
    ManageItemsBuiltInComponent,
    ManageItemsBuiltInItemComponent,
    FooterComponent,
    AddItemsComponent,
    AddRecipesComponent,
    AhSummaryComponent,
    ChartsComponent,
    SummaryCardComponent,
    AddRecipesComponent,
    ReputationsComponent,
    CharacterReputationComponent,
    TsmAddonDbComponent,
    ProfitSummaryComponent,
    ProfitSummaryCardComponent,
    ItemSaleSummaryComponent,
    AppUpdateComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    TableModule,
    IconModule,
    SettingsModule
  ],
  exports: [GoldPipe]
})
export class CoreModule {
}
