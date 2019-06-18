import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {GoldPipe} from './pipes/gold.pipe';
import {ChartsComponent} from './components/charts/charts.component';
import {MatFormFieldModule, MatSelectModule} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [GoldPipe, ChartsComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  exports: [GoldPipe, ChartsComponent]
})
export class UtilModule { }
