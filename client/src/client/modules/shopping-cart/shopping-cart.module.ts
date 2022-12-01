import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShoppingCartComponent} from './components/shopping-cart.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import {TableModule} from '../table/table.module';
import {UtilModule} from '../util/util.module';
import {CoreModule} from '../core/core.module';
import {AddonModule} from '../addon/addon.module';
import { CartDialogComponent } from './components/cart-dialog/cart-dialog.component';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
import { SummaryComponent } from './components/cart-dialog/summary/summary.component';

@NgModule({
  declarations: [
    ShoppingCartComponent,
    CartDialogComponent,
    SummaryComponent
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
