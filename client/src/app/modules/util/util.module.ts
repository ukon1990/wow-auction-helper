import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {GoldPipe} from './pipes/gold.pipe';
import {ChartsComponent} from './components/charts/charts.component';
import {MatAutocompleteModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';
import {SelectRealmComponent} from './components/select-realm/select-realm.component';

@NgModule({
  declarations: [GoldPipe, ChartsComponent, SelectRealmComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatCardModule,
    MatAutocompleteModule,
    MatInputModule
  ],
  exports: [GoldPipe, ChartsComponent, SelectRealmComponent]
})
export class UtilModule { }
