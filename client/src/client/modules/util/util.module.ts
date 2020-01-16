import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {GoldPipe} from './pipes/gold.pipe';
import {ChartsComponent} from './components/charts/charts.component';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule, MatTooltipModule
} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';
import {SelectRealmComponent} from './components/select-realm/select-realm.component';
import { AddonImportComponent } from './components/addon-import/addon-import.component';

@NgModule({
  declarations: [GoldPipe, ChartsComponent, SelectRealmComponent, AddonImportComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatCardModule,
    MatAutocompleteModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule
  ],
  exports: [GoldPipe, ChartsComponent, SelectRealmComponent, AddonImportComponent]
})
export class UtilModule { }
