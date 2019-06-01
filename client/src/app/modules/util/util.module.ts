import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {GoldPipe} from './pipes/gold.pipe';

@NgModule({
  declarations: [GoldPipe],
  imports: [
    CommonModule
  ],
  exports: [GoldPipe]
})
export class UtilModule { }
