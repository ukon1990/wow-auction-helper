import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddonComponent} from './components/addon.component';
import {ProfitSummaryCardComponent} from './components/profit-summary-card/profit-summary-card.component';
import {ItemSaleSummaryComponent} from './components/item-sale-summary/item-sale-summary.component';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
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
