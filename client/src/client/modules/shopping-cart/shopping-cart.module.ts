import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShoppingCartComponent} from './components/shopping-cart.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import {TableModule} from '../table/table.module';
import {UtilModule} from '../util/util.module';
import {CoreModule} from '../core/core.module';
import {AddonModule} from '../addon/addon.module';
import { CartDialogComponent } from './components/cart-dialog/cart-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';

@NgModule({
  declarations: [
    ShoppingCartComponent,
    CartDialogComponent
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
    AddonModule,
    MatBadgeModule,
    MatDialogModule,
    MatTabsModule
  ],
  exports: [ShoppingCartComponent]
})
export class ShoppingCartModule {
}
