import { Component, Input, OnInit } from '@angular/core';
import { Reagent } from '../../../models/crafting/reagent';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'wah-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss']
})
export class MaterialsComponent implements OnInit {
  @Input() reagents: Array<Reagent>;

  constructor() { }

  ngOnInit() {
  }

  getItemValue(itemID: number) {
    if (SharedService.user.customPrices[itemID]) {
      return SharedService.user.customPrices[itemID];
    } else if (this.isAtAH(itemID)) {
      return SharedService.auctionItemsMap[itemID].buyout;
    } else if (SharedService.user.apiToUse === 'tsm' && SharedService.tsm[itemID]) {
      return SharedService.tsm[itemID].MarketValue;
    }
    return 0;
  }

  isAtAH(itemID: number): boolean {
    return SharedService.auctionItemsMap[itemID] ? true : false;
  }
}
