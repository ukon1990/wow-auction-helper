import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ItemComponent} from './components/item.component';
import {LineChartComponent} from './components/line-chart/line-chart.component';
import {TableModule} from '../table/table.module';
import {MarketResetModule} from '../market-reset/market-reset.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {ReactiveFormsModule} from '@angular/forms';
import {IconModule} from '../icon/icon.module';
import {AddonModule} from '../addon/addon.module';
import {UtilModule} from '../util/util.module';
import { AuctionItemDetailsComponent } from './components/auction-item-details/auction-item-details.component';
import { TsmTabComponent } from './components/tsm-tab/tsm-tab.component';
import { SoldByTabComponent } from './components/sold-by-tab/sold-by-tab.component';
import { DroppedByTabComponent } from './components/dropped-by-tab/dropped-by-tab.component';
import { ContainedInTabComponent } from './components/contained-in-tab/contained-in-tab.component';
import { AuctionsChartComponent } from './components/auctions-chart/auctions-chart.component';
import { ItemPriceHistoryComponent } from './components/item-price-history/item-price-history.component';
import {CraftingModule} from '../crafting/crafting.module';
import {MatDialogModule} from '@angular/material/dialog';
import {CoreModule} from '../core/core.module';
import {HighchartsChartModule} from 'highcharts-angular';
import { AuctionsComponent } from './components/auctions/auctions.component';
import {MatDatepickerModule} from '@angular/material/datepicker';


@NgModule({
  declarations: [
    ItemComponent,
    LineChartComponent,
    AuctionItemDetailsComponent,
    TsmTabComponent,
    SoldByTabComponent,
    DroppedByTabComponent,
    ContainedInTabComponent,
    AuctionsChartComponent,
    ItemPriceHistoryComponent,
    AuctionsComponent
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
    ItemPriceHistoryComponent
  ]
})
export class ItemModule {
}
