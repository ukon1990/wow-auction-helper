import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GoldPipe} from './pipes/gold.pipe';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {ReactiveFormsModule} from '@angular/forms';
import {SelectRealmComponent} from './components/select-realm/select-realm.component';
import {AddonImportComponent} from './components/addon-import/addon-import.component';
import {WowheadDirective} from './wowhead.directive';
import {CloseBtnComponent} from './components/close-btn.component';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {LoadingComponent} from './components/loading.component';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {HighchartsComponent} from './components/highcharts.component';
import {HighchartsChartModule} from 'highcharts-angular';

@NgModule({
  declarations: [
    GoldPipe,
    SelectRealmComponent,
    AddonImportComponent,
    WowheadDirective,
    CloseBtnComponent,
    LoadingComponent,
    HighchartsComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatCardModule,
    MatAutocompleteModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    HighchartsChartModule,
  ],
  exports: [
    GoldPipe,
    SelectRealmComponent,
    AddonImportComponent,
    WowheadDirective,
    CloseBtnComponent,
    LoadingComponent,
    HighchartsComponent
  ]
})
export class UtilModule {
}
