import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorComponent } from './components/vendor/vendor.component';
import { VendorDetailComponent } from './components/vendor-detail/vendor-detail.component';



@NgModule({
  declarations: [VendorComponent, VendorDetailComponent],
  imports: [
    CommonModule
  ]
})
export class VendorModule { }
