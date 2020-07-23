import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavbarComponent} from './components/navbar/navbar.component';
import {DownloadComponent} from './components/navbar/download/download.component';
import {ItemComponent} from '../item/components/item.component';
import {TradeVendorsComponent} from './components/trade-vendors/trade-vendors.component';
import {FooterComponent} from './components/footer/footer.component';
import {ReputationsComponent} from './components/reputations/reputations.component';
import {CharacterReputationComponent} from './components/reputations/character-reputation/character-reputation.component';
import {AppUpdateComponent} from './components/app-update/app-update.component';
import {MaterialModule} from '../material.module';
import {TableModule} from '../table/table.module';
import {IconModule} from '../icon/icon.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CharacterModule} from '../character/character.module';
import {UtilModule} from '../util/util.module';
import {AddonModule} from '../addon/addon.module';
import {ShoppingCartModule} from '../shopping-cart/shopping-cart.module';
import {AboutModule} from '../about/about.module';
import {MenuComponent} from './components/menu/menu.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import {RealmQuickSelectComponent} from './components/realm-quick-select/realm-quick-select.component';
import {ThemeSelectComponent} from './components/theme-select/theme-select.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {library} from '@fortawesome/fontawesome-svg-core';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {MarketResetModule} from '../market-reset/market-reset.module';
import {MenuItemComponent} from './components/menu/menu-item/menu-item.component';
import {MenuDropdownComponent} from './components/menu/menu-dropdown/menu-dropdown.component';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  declarations: [
    NavbarComponent,
    DownloadComponent,
    TradeVendorsComponent,
    FooterComponent,
    ReputationsComponent,
    CharacterReputationComponent,
    AppUpdateComponent,
    MenuComponent,
    RealmQuickSelectComponent,
    ThemeSelectComponent,
    MenuItemComponent,
    MenuDropdownComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    TableModule,
    CharacterModule,
    IconModule,
    RouterModule,
    UtilModule,
    AddonModule,
    ShoppingCartModule,
    AboutModule,
    MatMenuModule,
    MatGridListModule,
    MatBadgeModule,
    FontAwesomeModule,
    MarketResetModule,
    MatDialogModule
  ],
  exports: [NavbarComponent, FooterComponent, AppUpdateComponent, MenuComponent, ThemeSelectComponent, DownloadComponent]
})
export class CoreModule {
  constructor() {
    library.add(fas);
  }
}
