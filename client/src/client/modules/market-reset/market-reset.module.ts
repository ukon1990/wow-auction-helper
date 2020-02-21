import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MarketResetComponent} from './components/market-reset/market-reset.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../material.module';
import {TableModule} from '../table/table.module';
import {IconModule} from '../icon/icon.module';
import {UtilModule} from '../util/util.module';
import {ResetCalcComponent} from './components/reset-calc/reset-calc.component';
import { ResetChartsComponent } from './components/reset-charts/reset-charts.component';


@NgModule({
  declarations: [
    MarketResetComponent,
    ResetCalcComponent,
    ResetChartsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    TableModule,
    IconModule,
    UtilModule
  ],
  exports: [
    ResetCalcComponent
  ]
})
export class MarketResetModule {
}
