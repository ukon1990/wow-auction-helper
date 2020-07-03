import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddonComponent} from './components/addon.component';
import {ProfitSummaryComponent} from './components/profit-summary/profit-summary.component';
import {ProfitSummaryCardComponent} from './components/profit-summary-card/profit-summary-card.component';
import {ItemSaleSummaryComponent} from './components/item-sale-summary/item-sale-summary.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import {ReactiveFormsModule} from '@angular/forms';
import {TableModule} from '../table/table.module';
import {UtilModule} from '../util/util.module';
import { AddonDatasetComponent } from './components/addon-dataset/addon-dataset.component';
import {RouterModule} from '@angular/router';
import { ProfitSummaryChartComponent } from './components/profit-summary/profit-summary-chart/profit-summary-chart.component';
import { GoldSummaryChartComponent } from './components/profit-summary/gold-summary-chart/gold-summary-chart.component';

@NgModule({
  declarations: [
    AddonComponent,
    ProfitSummaryComponent,
    ProfitSummaryCardComponent,
    ItemSaleSummaryComponent,
    AddonDatasetComponent,
    ProfitSummaryChartComponent,
    GoldSummaryChartComponent],
  exports: [
    ItemSaleSummaryComponent,
    AddonComponent
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
    RouterModule,
    MatInputModule,
    MatExpansionModule
  ]
})
export class AddonModule { }
