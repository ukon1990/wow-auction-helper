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

  getItemValue(itemID: number, count: number) {
    if (SharedService.customPricesMap && SharedService.customPricesMap[itemID]) {
      return SharedService.customPricesMap[itemID].price;
    } else if (SharedService.tradeVendorItemMap[itemID]) {
      return SharedService.tradeVendorItemMap[itemID].value;
    } else if (this.getAtAHCount(itemID) > 0) {
      return SharedService.auctionItemsMap[itemID].buyout;
    } else if (SharedService.user.apiToUse === 'tsm' && SharedService.tsm[itemID]) {
      return SharedService.tsm[itemID].MarketValue;
    }
    return 0;
  }

  isEnoughAtAH(itemID: number, count): boolean {
    if (this.getAtAHCount(itemID) >= count) {
      return true;
    }
    return false;
  }

  getAtAHCount(itemID: number): number {
    return SharedService.auctionItemsMap[itemID] ? SharedService.auctionItemsMap[itemID].quantityTotal : 0;
  }

  setSelectedItem(reagent: Reagent): void {
    SharedService.selectedItemId = reagent.itemID;
  }
}
