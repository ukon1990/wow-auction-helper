import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddonComponent} from './components/addon.component';
import {ProfitSummaryCardComponent} from './components/profit-summary-card/profit-summary-card.component';
import {ItemSaleSummaryComponent} from './components/item-sale-summary/item-sale-summary.component';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatListModule} from '@angular/material/list';
import {MatTabsModule} from '@angular/material/tabs';
import {ReactiveFormsModule} from '@angular/forms';
import {TableModule} from '../table/table.module';
import {UtilModule} from '../util/util.module';
import {AddonDatasetComponent} from './components/addon-dataset/addon-dataset.component';
import {RouterModule} from '@angular/router';
import {ProfitSummaryComponent} from './components/profit-summary2/profit-summary.component';
import {MatDatepickerModule} from '@angular/material/datepicker';

@NgModule({
  declarations: [
    AddonComponent,
    ProfitSummaryCardComponent,
    ItemSaleSummaryComponent,
    AddonDatasetComponent,
    ProfitSummaryComponent],
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
    MatListModule,
    TableModule,
    UtilModule,
    MatButtonModule,
    RouterModule,
    MatInputModule,
    MatExpansionModule,
    MatDatepickerModule
  ]
})
export class AddonModule {
}
