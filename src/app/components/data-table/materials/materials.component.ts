import { Component, Input, OnInit } from '@angular/core';
import { Reagent } from '../../../models/crafting/reagent';
import { SharedService } from '../../../services/shared.service';
import { Crafting } from '../../../models/crafting/crafting';
import { Recipe } from '../../../models/crafting/recipe';
import { CustomProc, CustomProcs } from '../../../models/crafting/custom-proc';
import { ItemService } from '../../../services/item.service';

@Component({
  selector: 'wah-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss']
})
export class MaterialsComponent implements OnInit {
  @Input() recipe: Recipe;
  vendorTooltip = 'This item is sold by a vendor, and it is currently cheaper source than from the AH.';

  constructor() { }

  ngOnInit() {
  }

  getItemValue(itemID: number) {
    return Crafting.getCost(itemID, 1);
  }

  getItemName(itemID): string {
    return SharedService.items[itemID] ? SharedService.items[itemID].name : '';
  }

  isEnoughAtAH(itemID: number, count): boolean {
    if (this.getAtAHCount(itemID) >= count) {
      return true;
    }
    return false;
  }

  useIntermediateCrafting(): boolean {
    return SharedService.user && SharedService.user.useIntermediateCrafting;
  }

  getAtAHCount(itemID: number): number {
    return SharedService.auctionItemsMap[itemID] ? SharedService.auctionItemsMap[itemID].quantityTotal : 0;
  }

  setSelectedItem(reagent: Reagent): void {
    SharedService.selectedItemId = reagent.itemID;
    ItemService.itemSelection.emit(reagent.itemID);
  }

  getRecipeForItem(itemID: number): Array<Reagent> {
    if (SharedService.recipesMapPerItemKnown[itemID] && !SharedService.auctionItemsMap[itemID]) {
      return SharedService.recipesMapPerItemKnown[itemID];
    } else if (SharedService.recipesMapPerItemKnown[itemID] && SharedService.auctionItemsMap[itemID] &&
        SharedService.recipesMapPerItemKnown[itemID].cost < SharedService.auctionItemsMap[itemID].buyout) {
      return SharedService.recipesMapPerItemKnown[itemID];
    }
    return undefined;
  }

  getMinCount(recipe: Recipe): number {
    return CustomProcs.get(recipe);
  }

  usingVendor(reagent: Reagent): boolean {
    return Crafting.isVendorCheaperThanAH(reagent.itemID) ? true : false;
  }

  getReagentFromVendorString(reagent: Reagent): string {
    return this.usingVendor(reagent) ? '(V)' : '';
  }
}
