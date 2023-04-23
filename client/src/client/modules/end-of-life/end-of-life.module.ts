import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EndOfLifeComponent} from './components/end-of-life.component';
import {MaterialModule} from '../material.module';
import {RouterLink} from "@angular/router";


@NgModule({
  declarations: [
    EndOfLifeComponent,
  ],
  exports: [
    EndOfLifeComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterLink
  ]
})
export class EndOfLifeModule { }