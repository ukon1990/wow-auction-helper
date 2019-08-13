import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MyPetsComponent} from './components/my-pets.component';
import {MatCardModule, MatPaginatorModule} from '@angular/material';
import {IconModule} from '../icon/icon.module';
import {TableModule} from '../table/table.module';
import {UtilModule} from '../util/util.module';

@NgModule({
  declarations: [
    MyPetsComponent],
  imports: [
    CommonModule,
    MatCardModule,
    IconModule,
    TableModule,
    MatPaginatorModule,
    UtilModule
  ]
})
export class PetModule {
}
