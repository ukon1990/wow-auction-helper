import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorComponent } from './components/vendor/vendor.component';
import { VendorDetailComponent } from './components/vendor-detail/vendor-detail.component';
import {TradeVendorsComponent} from './components/trade-vendors/trade-vendors.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatCardModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatTooltipModule} from '@angular/material';
import {UtilModule} from '../util/util.module';
import {TableModule} from '../table/table.module';



@NgModule({
  declarations: [VendorComponent, VendorDetailComponent, TradeVendorsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatCardModule,
    UtilModule,
    TableModule
  ]
})
export class NpcModule { }
