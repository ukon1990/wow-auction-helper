import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataTableComponent} from './components/data-table.component';
import {MaterialsComponent} from './components/columns/materials/materials.component';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTooltipModule} from '@angular/material/tooltip';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
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
import { CartCountComponent } from './components/columns/cart-count/cart-count.component';

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
    FontAwesomeModule
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
