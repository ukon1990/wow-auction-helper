import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MyPetsComponent} from './components/my-pets.component';
import {MatCardModule} from '@angular/material';
import {IconModule} from '../icon/icon.module';
import {TableModule} from '../table/table.module';

@NgModule({
  declarations: [
    MyPetsComponent],
  imports: [
    CommonModule,
    MatCardModule,
    IconModule,
    TableModule
  ]
})
export class PetModule {
}
