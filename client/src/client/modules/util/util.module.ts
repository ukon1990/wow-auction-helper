import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GoldPipe} from './pipes/gold.pipe';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ReactiveFormsModule} from '@angular/forms';
import {SelectRealmComponent} from './components/select-realm/select-realm.component';
import {AddonImportComponent} from './components/addon-import/addon-import.component';
import {WowheadDirective} from './wowhead.directive';
import {CloseBtnComponent} from './components/close-btn.component';
import {MatDialogModule} from '@angular/material/dialog';
import {LoadingComponent} from './components/loading.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
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
