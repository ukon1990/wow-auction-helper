import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {GoldPipe} from './pipes/gold.pipe';
import {ChartsComponent} from './components/charts/charts.component';

@NgModule({
  declarations: [GoldPipe, ChartsComponent],
  imports: [
    CommonModule
  ],
  exports: [GoldPipe, ChartsComponent]
})
export class UtilModule { }
