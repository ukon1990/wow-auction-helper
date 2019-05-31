import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SellersComponent} from './components/sellers.component';
import {SellerComponent} from './components/seller/seller.component';
import {SellerChartComponent} from './components/seller-chart/seller-chart.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule, MatSelectModule} from '@angular/material';
import {TableModule} from '../table/table.module';

@NgModule({
  declarations: [
    SellersComponent,
    SellerComponent,
    SellerChartComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TableModule,
    MatSelectModule
  ]
})
export class SellersModule { }
