import { Component, Input, OnInit } from '@angular/core';
import { Reagent } from '../../../models/crafting/reagent';
import { SharedService } from '../../../services/shared.service';
import { Crafting } from '../../../models/crafting/crafting';

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
    return Crafting.getCost(itemID, 1);
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

  getRecipeForItem(itemID: number): Array<Reagent> {
    return SharedService.itemRecipeMap[itemID] ?
      SharedService.itemRecipeMap[itemID]
        .sort( (a, b) => a.cost - b.cost)[0] : undefined;
  }
}
