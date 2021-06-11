import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuctionsComponent} from './components/auctions/auctions.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../material.module';
import {TableModule} from '../table/table.module';
import {CharacterModule} from '../character/character.module';
import {IconModule} from '../icon/icon.module';
import {RouterModule} from '@angular/router';
import {UtilModule} from '../util/util.module';
import {AddonModule} from '../addon/addon.module';
import {ShoppingCartModule} from '../shopping-cart/shopping-cart.module';
import {AboutModule} from '../about/about.module';
import { MatBadgeModule } from '@angular/material/badge';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { AuctionComparisonComponent } from './components/auction-comparison/auction-comparison.component';

@NgModule({
  declarations: [
    AuctionsComponent,
    AuctionComparisonComponent
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
    FontAwesomeModule
  ]
})
export class AuctionModule {
}
