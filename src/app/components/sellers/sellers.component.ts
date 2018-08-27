import { Component, OnInit } from '@angular/core';
import { Seller } from '../../models/seller';
import { SharedService } from '../../services/shared.service';
import { ColumnDescription } from '../../models/column-description';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';

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

  constructor(private _formBuilder: FormBuilder, private _title: Title) {
    this.searchForm = this._formBuilder.group({
      name: '',
      liquidity: 0,
      volume: 0,
      numOfAuctions: 0
    });
    this._title.setTitle('WAH - Sellers');
  }

  ngOnInit() {
  }

  getSellers(): Array<Seller> {
    return SharedService.sellers.filter(i => this.isMatch(i));
  }
  isMatch(seller: Seller): boolean {
    return this.isNameMatch(seller) && this.isLiquidityMatch(seller) &&
      this.isVolumeMatch(seller) && this.isNumOfAuctionsMatch(seller);
  }

  isNameMatch(seller: Seller): boolean {
    return this.searchForm.value.name === null || seller.name.toLowerCase().indexOf(this.searchForm.value.name.toLowerCase()) > -1;
  }

  isLiquidityMatch(seller: Seller): boolean {
    return this.searchForm.value.liquidity === null || seller.liquidity >= this.searchForm.value.liquidity * 10000;
  }

  isVolumeMatch(seller: Seller): boolean {
    return this.searchForm.value.volume === null || seller.volume >= this.searchForm.value.volume;
  }
  isNumOfAuctionsMatch(seller: Seller): boolean {
    return this.searchForm.value.numOfAuctions === null || seller.numOfAuctions >= this.searchForm.value.numOfAuctions;
  }
}
