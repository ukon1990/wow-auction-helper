import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Item } from '../../models/item/item';
import { SharedService } from '../../services/shared.service';
import { AuctionItem } from '../../models/auction/auction-item';
import { ColumnDescription } from '../../models/column-description';
import { WowdbService } from '../../services/wowdb.service';
import { User } from '../../models/user/user';
import { Recipe } from '../../models/crafting/recipe';
import { Pet } from '../../models/pet';
import { AuctionPet } from '../../models/auction/auction-pet';
import { Angulartics2 } from 'angulartics2';

@Component({
  selector: 'wah-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  // TODO: https://github.com/d3/d3 with item price range
  @ViewChild('tabs') tabs;
  wowDBItem: any;
  targetBuyoutValue: number;
  materialFor: Array<Recipe> = new Array<Recipe>();

  columns: Array<ColumnDescription> = [
    {key: 'timeLeft', title: 'Time left', dataType: 'time-left'},
    {key: 'buyout', title: 'Buyout/item', dataType: 'gold-per-item'},
    {key: 'buyout', title: 'Buyout', dataType: 'gold', hideOnMobile: true},
    {key: 'bid', title: 'Bid/item', dataType: 'gold-per-item'},
    {key: 'bid', title: 'Bid', dataType: 'gold', hideOnMobile: true},
    {key: 'quantity', title: 'Size', dataType: ''},
    {key: 'owner', title: 'Owner', dataType: 'seller', hideOnMobile: true}
  ];

  recipeColumns: Array<ColumnDescription> = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'reagents', title: 'Materials', dataType: 'materials' },
    { key: 'cost', title: 'Cost', dataType: 'gold' },
    { key: 'roi', title: 'ROI', dataType: 'gold' },
    { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'], hideOnMobile: true }
  ];

  recipeColumnsSimple: Array<ColumnDescription> = [
    { key: 'rank', title: 'Rank', dataType: '' },
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'profession', title: 'Source', dataType: '' },
    { key: 'cost', title: 'Cost', dataType: 'gold' },
    { key: 'roi', title: 'ROI', dataType: 'gold' },
    { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] }
  ];

  npcColumns: Array<ColumnDescription> = [
    {key: 'Name', title: 'NPC', dataType: ''},
    {key: 'ID', title: 'WoWDB', dataType: 'wdb-link'},
    {key: 'ID', title: 'WoWHead', dataType: 'whead-link'}
  ];

  constructor(private _wowDBService: WowdbService, private angulartics2: Angulartics2) {
    this.angulartics2.eventTrack.next({
      action: 'Item detail view',
      properties: { category: 'Item' },
    });
  }

  /* istanbul ignore next */
  ngOnInit() {
    if (!SharedService.selectedItemId) {
      return;
    }
    this._wowDBService.getItem(SharedService.selectedItemId)
      .then(i => {
        this.wowDBItem = i;
      })
      .catch(e => console.error('Could not get the item from WOW DB', e));

    this.setMaterialFor();
  }

  setMaterialFor(): void {
    SharedService.recipes.forEach(recipe => {
      recipe.reagents.forEach(reagent => {
        if (reagent.itemID === SharedService.selectedItemId) {
          this.materialFor.push(recipe);
        }
      });
    });
  }

  openInNewTab(url) {
    // window.open(url, '_blank');
    let a = document.createElement('a');
    a.setAttribute("href", url);
    a.setAttribute("target", "_blank");

    var dispatch = document.createEvent("HTMLEvents");
    dispatch.initEvent("click", true, true);
    a.dispatchEvent(dispatch);
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

  userHasRecipeForItem(): boolean {
    return SharedService.recipesMapPerItemKnown[SharedService.selectedItemId] ? true : false;
  }
  addEntryToCart(): void {
    if (!this.userHasRecipeForItem()) {
      return;
    }
    SharedService.user.shoppingCart
      .addEntry(1, SharedService.recipesMapPerItemKnown[SharedService.selectedItemId]);
  }

  /* istanbul ignore next */
  getAuctionItem(): AuctionItem {
    return this.auctionItemExists() ?
      SharedService.auctionItemsMap[this.getAuctionId()] : undefined;
  }

  getAuctionId(): any {
    if (SharedService.selectedPetSpeciesId !== undefined) {
      return SharedService.selectedPetSpeciesId.auctionId;
    }
    return SharedService.selectedItemId;
  }

  /* istanbul ignore next */
  getItem(): Item {
    return SharedService.items[SharedService.selectedItemId] ?
      SharedService.items[SharedService.selectedItemId] : undefined;
  }

  /* istanbul ignore next */
  getPet(): Pet {
    if (!SharedService.selectedPetSpeciesId) {
      return undefined;
    }
    return SharedService.pets[SharedService.selectedPetSpeciesId.petSpeciesId];
  }

  /* istanbul ignore next */
  getSelectedPet(): AuctionPet {
    return SharedService.selectedPetSpeciesId;
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

  isMobile(): boolean {
    return window.matchMedia('(max-width: 767px)').matches;
  }
}
