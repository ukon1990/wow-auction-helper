import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SellersComponent} from './components/sellers.component';
import {SellerComponent} from './components/seller/seller.component';
import {SellerChartComponent} from './components/seller-chart/seller-chart.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatTabsModule, MatTooltipModule} from '@angular/material';
import {TableModule} from '../table/table.module';
import {SettingsModule} from '../settings/settings.module';
import {CharacterModule} from '../character/character.module';

@NgModule({
  declarations: [
    SellersComponent,
    SellerComponent,
    SellerChartComponent
  ],
  exports: [
    SellerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TableModule,
    CharacterModule,
    MatSelectModule,
    SettingsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class SellersModule { }
