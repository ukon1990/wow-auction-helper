import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TsmAddonDbComponent} from './components/tsm-addon-db.component';
import {ProfitSummaryComponent} from './components/profit-summary/profit-summary.component';
import {ProfitSummaryCardComponent} from './components/profit-summary-card/profit-summary-card.component';
import {ItemSaleSummaryComponent} from './components/item-sale-summary/item-sale-summary.component';
import {MatButtonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatTabsModule} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';
import {TableModule} from '../table/table.module';
import {UtilModule} from '../util/util.module';
import { TsmDatasetComponent } from './components/tsm-dataset/tsm-dataset.component';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [
    TsmAddonDbComponent,
    ProfitSummaryComponent,
    ProfitSummaryCardComponent,
    ItemSaleSummaryComponent,
    TsmDatasetComponent],
  exports: [
    ItemSaleSummaryComponent,
    TsmAddonDbComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    TableModule,
    UtilModule,
    MatButtonModule,
    RouterModule
  ]
})
export class TsmModule { }
