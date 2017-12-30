import { Component, OnInit, Input } from '@angular/core';
import { Item } from '../../models/item/item';
import { SharedService } from '../../services/shared.service';
import { AuctionItem } from '../../models/auction/auction-item';
import { ColumnDescription } from '../../models/column-description';
import { WowdbService } from '../../services/wowdb.service';
import { User } from '../../models/user/user';
import { Recipe } from '../../models/crafting/recipe';

@Component({
  selector: 'wah-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  // TODO: https://github.com/d3/d3 with item price range
  wowDBItem: any;
  targetBuyoutValue: number;

  columns: Array<ColumnDescription> = [
    {key: 'timeLeft', title: 'Time left', dataType: 'time-left'},
    {key: 'buyout', title: 'Buyout/item', dataType: 'gold-per-item'},
    {key: 'buyout', title: 'Buyout', dataType: 'gold'},
    {key: 'bid', title: 'Bid/item', dataType: 'gold-per-item'},
    {key: 'bid', title: 'Bid', dataType: 'gold'},
    {key: 'quantity', title: 'Size', dataType: ''},
    {key: 'owner', title: 'Owner', dataType: ''}
  ];

  recipeColumns: Array<ColumnDescription> = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'reagents', title: 'Materials', dataType: 'materials' },
    { key: 'cost', title: 'Cost', dataType: 'gold' },
    { key: 'roi', title: 'ROI', dataType: 'gold' }
  ];

  npcColumns: Array<ColumnDescription> = [
    {key: 'Name', title: 'NPC', dataType: ''},
    {key: 'ID', title: 'WoWDB', dataType: 'wdb-link'},
    {key: 'ID', title: 'WoWHead', dataType: 'whead-link'}
  ];

  constructor(private _wowDBService: WowdbService) {
  }

  /* istanbul ignore next */
  ngOnInit() {
    if (SharedService.selectedItemId) {
      return;
    }
    this._wowDBService.getItem(SharedService.selectedItemId)
      .then(i => this.wowDBItem = i)
      .catch(e => console.error('Could not get the item from WOW DB', e));
  }

  openInNewTab(url) {
    window.open(url, '_blank');
  }

  /* istanbul ignore next */
  isDarkMode(): boolean {
    return SharedService.user.isDarkMode;
  }

  /* istanbul ignore next */
  getUser(): User {
    return SharedService.user;
  }

  isUsingAPI(): boolean {
    return this.getUser().apiToUse !== 'none';
  }

  itemHasRecipes(): boolean {
    return SharedService.itemRecipeMap[SharedService.selectedItemId] ? true : false;
  }

  getRecipesForItem(): Array<Recipe> {
    return SharedService.itemRecipeMap[SharedService.selectedItemId];
  }



  /* istanbul ignore next */
  getAuctionItem(): AuctionItem {
    return this.auctionItemExists() ?
      SharedService.auctionItemsMap[this.getAuctionId()] : undefined;
  }

  getAuctionId(): any {
    if (SharedService.selectedPetSpeciesId) {
      return `${SharedService.selectedItemId}-${SharedService.selectedPetSpeciesId}`;
    }
    return SharedService.selectedItemId;
  }

  /* istanbul ignore next */
  getItem(): Item {
    return SharedService.items[SharedService.selectedItemId] ?
      SharedService.items[SharedService.selectedItemId] : undefined;
  }

  /* istanbul ignore next */
  close(): void {
    SharedService.selectedItemId = undefined;
    SharedService.selectedPetSpeciesId = undefined;
  }

  /* istanbul ignore next */
  auctionItemExists(): boolean {
    return SharedService.auctionItemsMap[SharedService.selectedItemId] ? true : false;
  }
}
