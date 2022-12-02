import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataTableComponent} from './components/data-table.component';
import {MaterialsComponent} from './components/columns/materials/materials.component';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyPaginatorModule as MatPaginatorModule} from '@angular/material/legacy-paginator';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SortIconComponent} from './components/sort-icon/sort-icon.component';
import {IconModule} from '../icon/icon.module';
import {UtilModule} from '../util/util.module';
import {RouterModule} from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {ItemCurrencyComponent} from './components/columns/item-currency.component';
import {InputComponent} from './components/columns/input.component';
import {InputGoldComponent} from './components/columns/input-gold.component';
import {RowActionsComponent} from './components/columns/row-actions.component';
import {BaseActionsComponent} from './components/columns/base-actions.component';
import {GoldComponent} from './components/columns/gold/gold.component';
import {NameComponent} from './components/columns/name/name.component';
import {BaseComponent} from './components/columns/base.component';
import {CartCountComponent} from './components/columns/cart-count/cart-count.component';
import {
  FormControllerColumnComponent
} from './components/columns/form-controller-column/form-controller-column.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

@NgModule({
  declarations: [
    DataTableComponent,
    MaterialsComponent,
    SortIconComponent,
    ItemCurrencyComponent,
    InputComponent,
    InputGoldComponent,
    RowActionsComponent,
    BaseActionsComponent,
    GoldComponent,
    NameComponent,
    BaseComponent,
    CartCountComponent,
    FormControllerColumnComponent,
  ],
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
    FontAwesomeModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule
  ],
  exports: [
    DataTableComponent,
    SortIconComponent,
    MaterialsComponent,
    NameComponent
  ]
})
export class TableModule {
}