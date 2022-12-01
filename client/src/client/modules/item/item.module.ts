import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ItemComponent} from './components/item.component';
import {TableModule} from '../table/table.module';
import {MarketResetModule} from '../market-reset/market-reset.module';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {ReactiveFormsModule} from '@angular/forms';
import {IconModule} from '../icon/icon.module';
import {AddonModule} from '../addon/addon.module';
import {UtilModule} from '../util/util.module';
import {AuctionItemDetailsComponent} from './components/auction-item-details/auction-item-details.component';
import {TsmTabComponent} from './components/tsm-tab/tsm-tab.component';
import {SoldByTabComponent} from './components/sold-by-tab/sold-by-tab.component';
import {DroppedByTabComponent} from './components/dropped-by-tab/dropped-by-tab.component';
import {ContainedInTabComponent} from './components/contained-in-tab/contained-in-tab.component';
import {AuctionsChartComponent} from './components/auctions-chart/auctions-chart.component';
import {ItemPriceHistoryComponent} from './components/item-price-history/item-price-history.component';
import {CraftingModule} from '../crafting/crafting.module';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {CoreModule} from '../core/core.module';
import {HighchartsChartModule} from 'highcharts-angular';
import {AuctionsComponent} from './components/auctions/auctions.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {ItemPriceCompareComponent} from './components/item-price-compare.component';


@NgModule({
  declarations: [
    ItemComponent,
    AuctionItemDetailsComponent,
    TsmTabComponent,
    SoldByTabComponent,
    DroppedByTabComponent,
    ContainedInTabComponent,
    AuctionsChartComponent,
    ItemPriceHistoryComponent,
    AuctionsComponent,
    ItemPriceCompareComponent
  ],
  imports: [
    CommonModule,
    TableModule,
    MatTabsModule,
    MarketResetModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatListModule,
    IconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    AddonModule,
    UtilModule,
    MatInputModule,
    MatProgressSpinnerModule,
    CraftingModule,
    MatDialogModule,
    CoreModule,
    HighchartsChartModule,
    MatDatepickerModule
  ],
  exports: [
    ItemComponent,
    ItemPriceHistoryComponent,
    ItemPriceCompareComponent
  ]
})
export class ItemModule {
}
