import {Component, Input, OnInit} from '@angular/core';
import {Item} from '../../../../models/item/item';
import {SharedService} from '../../../../services/shared.service';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {Report} from '../../../../utils/report.util';

@Component({
  selector: 'wah-tsm-tab',
  templateUrl: './tsm-tab.component.html',
  styleUrls: ['./tsm-tab.component.scss']
})
export class TsmTabComponent implements OnInit {
  @Input() item: Item;
  @Input() auctionItem: AuctionItem;
  factionId: number;
  personalSaleRate;

  constructor() { }

  ngOnInit() {
    if (this.auctionItem) {
      Report.debug(
        'TsmTabComponent',
        'Item detail view',
        `TSM tab for ${this.auctionItem.itemID} - ${this.auctionItem.name}`);
    }
    this.factionId = SharedService.user.faction;
  }

  setPersonalSaleRate(saleRate: number): void {
    this.personalSaleRate = saleRate;
  }
}
