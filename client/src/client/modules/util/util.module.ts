import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GoldPipe} from './pipes/gold.pipe';
import {ChartsComponent} from './components/charts/charts.component';
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
import {ChartsDataSetsComponent} from './components/charts-datasets/charts-data-sets.component';
import {WowheadDirective} from './wowhead.directive';
import {CloseBtnComponent} from './components/close-btn/close-btn.component';
import {MatDialogModule} from '@angular/material/dialog';
import { LoadingComponent } from './components/loading.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    GoldPipe,
    ChartsComponent,
    SelectRealmComponent,
    AddonImportComponent,
    ChartsDataSetsComponent,
    ChartsDataSetsComponent,
    WowheadDirective,
    CloseBtnComponent,
    LoadingComponent
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
  ],
  exports: [
    GoldPipe,
    ChartsComponent,
    SelectRealmComponent,
    AddonImportComponent,
    ChartsDataSetsComponent,
    WowheadDirective,
    CloseBtnComponent,
    LoadingComponent
  ]
})
export class UtilModule {
}
