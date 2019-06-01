import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataTableComponent} from './components/data-table.component';
import {MaterialsComponent} from './components/materials/materials.component';
import {MatButtonModule, MatCardModule, MatCheckboxModule, MatInputModule, MatPaginatorModule, MatTooltipModule} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SortIconComponent} from './components/sort-icon/sort-icon.component';
import {IconModule} from '../icon/icon.module';
import {UtilModule} from '../util/util.module';

@NgModule({
  declarations: [DataTableComponent, MaterialsComponent, SortIconComponent],
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatCheckboxModule,
    FormsModule,
    MatButtonModule,
    IconModule,
    MatCardModule,
    UtilModule
  ],
  exports: [DataTableComponent, SortIconComponent, MaterialsComponent]
})
export class TableModule {
}
