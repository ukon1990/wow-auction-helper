import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuctionsComponent} from './components/auctions/auctions.component';
import {MyAuctionsComponent} from './components/my-auctions/my-auctions.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../material.module';
import {TableModule} from '../table/table.module';
import {CharacterModule} from '../character/character.module';
import {IconModule} from '../icon/icon.module';
import {RouterModule} from '@angular/router';
import {UtilModule} from '../util/util.module';
import {TsmModule} from '../tsm/tsm.module';
import {ShoppingCartModule} from '../shopping-cart/shopping-cart.module';
import {AboutModule} from '../about/about.module';
import {MatBadgeModule, MatGridListModule, MatMenuModule} from '@angular/material';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    AuctionsComponent,
    MyAuctionsComponent,
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
    TsmModule,
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
