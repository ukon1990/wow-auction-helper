import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IconComponent} from './components/item/icon/icon.component';
import {NavbarComponent} from './components_/navbar/navbar.component';
import {MenuComponent} from './components_/navbar/menu/menu.component';
import {CraftingComponent} from './components_/crafting/crafting.component';
import {GoldPipe} from '../../pipes/gold.pipe';
import {DashboardComponent} from './components_/dashboard/dashboard.component';
import {DashboardItemComponent} from './components_/dashboard/dashboard-item/dashboard-item.component';
import {AuctionsComponent} from './components_/auctions/auctions.component';
import {UpdateComponent} from './components_/update/update.component';
import {DownloadComponent} from './components_/navbar/download/download.component';
import {ShoppingCartComponent} from './components_/navbar/shopping-cart/shopping-cart.component';
import {ItemComponent} from './components_/item/item.component';
import {LineChartComponent} from './components_/item/line-chart/line-chart.component';
import {ResetCalcComponent} from './components_/item/reset-calc/reset-calc.component';
import {MyAuctionsComponent} from './components_/auctions/my-auctions/my-auctions.component';
import {TradeVendorsComponent} from './components_/trade-vendors/trade-vendors.component';
import {WatchlistComponent} from './components_/watchlist/watchlist.component';
import {WatchlistItemComponent} from './components_/watchlist/watchlist-item/watchlist-item.component';
import {WatchlistManagerComponent} from './components_/watchlist/watchlist-manager/watchlist-manager.component';
import {DashboardItemsComponent} from './components_/dashboard/dashboard-items/dashboard-items.component';
import {DashboardSellersComponent} from './components_/dashboard/dashboard-sellers/dashboard-sellers.component';
import {WatchlistItemManagerComponent} from './components_/watchlist/watchlist-item-manager/watchlist-item-manager.component';
import {MyPetsComponent} from './components_/my-pets/my-pets.component';
import {MarketResetComponent} from './components_/item/market-reset/market-reset.component';
import {ItemSellerChartComponent} from './components_/item/item-seller-chart/item-seller-chart.component';
import {WatchlistItemBatchComponent} from './components_/watchlist/watchlist-item-batch/watchlist-item-batch.component';
import {MillingComponent} from './components_/crafting/milling/milling.component';
import {DisenchantingComponent} from './components_/crafting/disenchanting/disenchanting.component';
import {DataBoardsComponent} from './components_/crafting/data-boards/data-boards.component';
import {ShuffleItemManageComponent} from './components_/crafting/shuffle-item-manage/shuffle-item-manage.component';
import {ManageItemsBuiltInComponent} from './components_/dashboard/manage-items-built-in/manage-items-built-in.component';
import {ManageItemsBuiltInItemComponent} from './components_/dashboard/manage-items-built-in-item/manage-items-built-in-item.component';
import {FooterComponent} from './components_/footer/footer.component';
import {AddItemsComponent} from './components_/update/add-items/add-items.component';
import {AddRecipesComponent} from './components_/update/add-recipes/add-recipes.component';
import {AhSummaryComponent} from './components_/dashboard/ah-summary/ah-summary.component';
import {ChartsComponent} from './components_/charts/charts.component';
import {SummaryCardComponent} from './components_/dashboard/ah-summary/summary-card/summary-card.component';
import {ReputationsComponent} from './components_/reputations/reputations.component';
import {CharacterReputationComponent} from './components_/reputations/character-reputation/character-reputation.component';
import {TsmAddonDbComponent} from './components_/tsm-addon-db/tsm-addon-db.component';
import {ProfitSummaryComponent} from './components_/tsm-addon-db/profit-summary/profit-summary.component';
import {ProfitSummaryCardComponent} from './components_/tsm-addon-db/profit-summary-card/profit-summary-card.component';
import {ItemSaleSummaryComponent} from './components_/tsm-addon-db/item-sale-summary/item-sale-summary.component';
import {AppUpdateComponent} from './components_/update/app-update/app-update.component';

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
    AppUpdateComponent,
    IconComponent],
  imports: [
    CommonModule
  ],
  exports: [IconComponent]
})
export class CoreModule {
}
