import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShoppingCartComponent} from './components/shopping-cart.component';
import {
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatInputModule,
  MatListModule,
  MatTooltipModule
} from '@angular/material';
import {TableModule} from '../table/table.module';
import {UtilModule} from '../util/util.module';
import {CoreModule} from '../core/core.module';
import {TsmModule} from '../tsm/tsm.module';

@NgModule({
  declarations: [
    ShoppingCartComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    TableModule,
    UtilModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatListModule,
    MatButtonModule,
    MatTooltipModule,
    TsmModule,
    MatBadgeModule
  ],
  exports: [ShoppingCartComponent]
})
export class ShoppingCartModule {
}
