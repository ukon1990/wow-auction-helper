import {Component, Input, OnInit} from '@angular/core';
import {Vendor} from '../../models/vendor.model';
import {ColumnDescription} from '../../../table/models/column-description';

@Component({
  selector: 'wah-vendor-detail',
  templateUrl: './vendor-detail.component.html',
  styleUrls: ['./vendor-detail.component.scss']
})
export class VendorDetailComponent implements OnInit {
  @Input() vendor: Vendor;
  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'cost', title: 'Buy price', dataType: 'gold'},
    {key: 'profit', title: 'Profit', dataType: 'gold'},
    {key: 'stock', title: 'Stock', dataType: 'number'},
    {key: 'currency', title: 'Currency', dataType: 'number'},
  ];

  constructor() { }

  ngOnInit() {
  }

}
