import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ItemComponent} from './components/item.component';
import {LineChartComponent} from './components/line-chart/line-chart.component';
import {ItemSellerChartComponent} from './components/item-seller-chart/item-seller-chart.component';
import {TableModule} from '../table/table.module';
import {MarketResetModule} from '../market-reset/market-reset.module';
import {
  MatCardModule,
  MatFormFieldModule,
  MatListModule,
  MatTabsModule,
  MatCheckboxModule,
  MatButtonModule,
  MatTooltipModule, MatSelectModule, MatInputModule
} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';
import {IconModule} from '../icon/icon.module';
import {TsmModule} from '../tsm/tsm.module';
import {UtilModule} from '../util/util.module';
import { AuctionItemDetailsComponent } from './components/auction-item-details/auction-item-details.component';
import { TsmTabComponent } from './components/tsm-tab/tsm-tab.component';
import { SoldByTabComponent } from './components/sold-by-tab/sold-by-tab.component';
import { DroppedByTabComponent } from './components/dropped-by-tab/dropped-by-tab.component';


@NgModule({
  declarations: [
    ItemComponent,
    LineChartComponent,
    ItemSellerChartComponent,
    AuctionItemDetailsComponent,
    TsmTabComponent,
    SoldByTabComponent,
    DroppedByTabComponent
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
    TsmModule,
    UtilModule,
    MatInputModule
  ],
  exports: [
    ItemComponent
  ]
})
export class ItemModule {
}
