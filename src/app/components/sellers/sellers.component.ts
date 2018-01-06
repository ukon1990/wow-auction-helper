import { Component, OnInit } from '@angular/core';
import { Seller } from '../../models/seller';
import { SharedService } from '../../services/shared.service';
import { ColumnDescription } from '../../models/column-description';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'wah-sellers',
  templateUrl: './sellers.component.html',
  styleUrls: ['./sellers.component.scss']
})
export class SellersComponent implements OnInit {

  searchForm: FormGroup;
  searchFormChanges: Subscription;
  columns: Array<ColumnDescription> = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'liquidity', title: 'Liquidity', dataType: 'gold' },
    { key: 'volume', title: 'Volume', dataType: 'number' },
    { key: 'numOfAuctions', title: 'Auctions', dataType: 'number' }
  ];

  constructor(private _formBuilder: FormBuilder) {
    this.searchForm = this._formBuilder.group({
      name: '',
      liquidity: 0,
      volume: 0,
      numOfAuctions: 0
    });
  }

  ngOnInit() {
  }

  getSellers(): Array<Seller> {
    return SharedService.sellers.filter(i => this.isMatch(i));
  }
  isMatch(seller: Seller): boolean {
    return seller.name.toLowerCase().indexOf(this.searchForm.value.name) > -1;
  }
}
