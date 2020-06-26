import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataTableComponent} from './components/data-table.component';
import {MaterialsComponent} from './components/materials/materials.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SortIconComponent} from './components/sort-icon/sort-icon.component';
import {IconModule} from '../icon/icon.module';
import {UtilModule} from '../util/util.module';
import {RouterModule} from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

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
    UtilModule,
    RouterModule,
    FontAwesomeModule
  ],
  exports: [DataTableComponent, SortIconComponent, MaterialsComponent]
})
export class TableModule {
}
