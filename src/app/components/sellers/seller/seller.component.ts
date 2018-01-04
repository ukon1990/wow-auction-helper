import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { Seller } from '../../../models/seller';
import { ColumnDescription } from '../../../models/column-description';

@Component({
  selector: 'wah-seller',
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.scss']
})
export class SellerComponent implements OnInit {
  columns: Array<ColumnDescription> = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'timeLeft', title: 'Time left', dataType: 'time-left' },
    { key: 'buyout', title: 'Buyout/item', dataType: 'gold-per-item' },
    { key: 'buyout', title: 'Buyout', dataType: 'gold' },
    { key: 'bid', title: 'Bid/item', dataType: 'gold-per-item' },
    { key: 'bid', title: 'Bid', dataType: 'gold' },
    { key: 'quantity', title: 'Size', dataType: '' },
    { key: 'owner', title: 'Owner', dataType: '' }
  ];
  constructor() { }

  /* istanbul ignore next */
  ngOnInit() {
    if (SharedService.selectedSeller) {
      return;
    }
  }

  /* istanbul ignore next */
  close(): void {
    SharedService.selectedSeller = undefined;
  }

  getSeller(): Seller {
    return SharedService.sellersMap[SharedService.selectedSeller];
  }
}
