import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataTableComponent} from './components/data-table.component';
import {MaterialsComponent} from './components/materials/materials.component';
import {MatButtonModule, MatCheckboxModule, MatInputModule, MatPaginatorModule, MatTooltipModule} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SortIconComponent} from './components/sort-icon/sort-icon.component';
import {CoreModule} from '../core/core.module';

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
    CoreModule
  ],
  exports: [DataTableComponent, SortIconComponent]
})
export class TableModule {
}
