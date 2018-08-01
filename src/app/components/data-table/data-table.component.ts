import { Component, AfterViewInit, Input, Output, OnChanges } from '@angular/core';
import { PageEvent } from '@angular/material';
import { ColumnDescription } from '../../models/column-description';
import { SharedService } from '../../services/shared.service';
import { AuctionItem } from '../../models/auction/auction-item';
import { Auction } from '../../models/auction/auction';
import { Recipe } from '../../models/crafting/recipe';
import { User } from '../../models/user/user';
import { Sorter } from '../../models/sorter';
import { Item } from '../../models/item/item';
import { Seller } from '../../models/seller';
import { AuctionPet } from '../../models/auction/auction-pet';
import { CustomPrice, CustomPrices } from '../../models/crafting/custom-price';
import { ShoppingCartRecipe } from '../../models/shopping-cart';
import { Angulartics2 } from 'angulartics2';
import { CustomProcs } from '../../models/crafting/custom-proc';
import { Watchlist, WatchlistGroup } from '../../models/watchlist/watchlist';

@Component({
  selector: 'wah-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements AfterViewInit, OnChanges {

  @Input() id: any;
  @Input() iconSize: number;
  @Input() isCrafting: boolean;
  @Input() showOwner: boolean;
  @Input() columns: Array<ColumnDescription>;
  @Input() data: Array<any>;
  @Input() numOfRows: number;
  @Input() hideCraftingDetails: boolean;
  @Input() useAuctionItemForName: boolean;
  @Input() linkType: string;
  @Input() itemsPerPage = 10;
  @Input() dontUsePagignation: boolean;

  pageRows: Array<number> = [10, 20, 40, 80, 100];
  pageEvent: PageEvent = { pageIndex: 0, pageSize: this.itemsPerPage, length: 0 };
  sorter: Sorter;
  locale = localStorage['locale'].split('-')[0];
  previousLength = 0;
  auctionDuration = {
    'VERY_LONG': '12h+',
    'LONG': '2-12h',
    'MEDIUM': '30m-2h',
    'SHORT': '<30m'
  };
  getBonusList = Auction.getBonusList;

  constructor(private angulartics2: Angulartics2) {
    this.sorter = new Sorter();
  }

  ngAfterViewInit() {
    if (this.numOfRows) {
      this.pageEvent.pageSize = this.numOfRows;
    }
  }

  /* istanbul ignore next */
  ngOnChanges(change) {
    if (change && change.data && change.data.currentValue) {
      // this.pageEvent.length = change.data.currentValue.length;
      if (this.previousLength !== change.data.currentValue.length) {
        this.pageEvent.pageIndex = 0;
      }
      this.previousLength = change.data.currentValue.length;
      this.sorter.sort(this.data);
    }

    if (change && change.itemsPerPage && change.itemsPerPage.currentValue) {
      this.pageEvent.pageSize = change.itemsPerPage.currentValue;
    }
  }

  select(item): void {
    if (this.id === 'name') {
      this.setSelectedSeller(item);
    } else {
      this.setSelectedItem(item);
    }
  }

  isUsersAuction(auction: any): boolean {
    if (this.showOwner) {
      const a = SharedService.auctionItemsMap[auction.item ? Auction.getAuctionItemId(auction) : auction.itemID];
      return SharedService.userAuctions.charactersMap[a.ownerRealm] &&
        SharedService.userAuctions.charactersMap[a.ownerRealm][a.owner] ? true : false;
    }
    return false;
  }

  addEntryToCart(entry: any): void {
    if (entry.spellID) {
      SharedService.user.shoppingCart.addEntry(1, entry, undefined);
      this.angulartics2.eventTrack.next({
        action: 'Added recipe',
        properties: { category: 'Shopping cart' },
      });
    } else {
      SharedService.user.shoppingCart.addEntry(1, undefined, entry);
      this.angulartics2.eventTrack.next({
        action: 'Added item',
        properties: { category: 'Shopping cart' },
      });
    }
  }
  /* istanbul ignore next */
  setSelectedSeller(seller: Seller) {
    SharedService.selectedSeller = SharedService.sellersMap[seller.name];
    SharedService.selectedItemId = undefined;
    SharedService.selectedPetSpeciesId = undefined;
  }

  /* istanbul ignore next */
  setSelectedItem(item: any): void {
    if (item.item) {
      SharedService.selectedItemId = item.item;
    } else {
      SharedService.selectedItemId = item.itemID;
    }
    this.setSelectedPet(item);
    SharedService.selectedSeller = undefined;
  }

  /* istanbul ignore next */
  setSelectedPet(pet: any) {
    if (pet.petSpeciesId) {
      SharedService.selectedPetSpeciesId =
        new AuctionPet(pet.petSpeciesId, pet.petLevel, pet.petQualityId);
    }
  }

  /* istanbul ignore next */
  getFromValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return 0;
    }
    return (this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1)) - this.pageEvent.pageSize;
  }

  getCraftersForRecipe(recipe: Recipe) {
    return SharedService.recipesForUser[recipe.spellID] ?
      SharedService.recipesForUser[recipe.spellID].join(', ') : '';
  }

  customPrices(): CustomPrices {
    return CustomPrices;
  }

  customProcs(): CustomProcs {
    return CustomProcs;
  }

  /* istanbul ignore next */
  pageChange(event: PageEvent): void {
    this.pageEvent = event;
  }

  /* istanbul ignore next */
  getToValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return this.pageRows[0];
    }
    return this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1);
  }

  /* istanbul ignore next */
  getUser(): User {
    return SharedService.user;
  }

  /* istanbul ignore next */
  getItemName(name: string, item: any): string {
    const id = this.getItemID(item);
    if (name !== undefined) {
      return name;
    }

    if (this.useAuctionItemForName && item.petSpeciesId) {
      const petId = `${item.item}-${item.petSpeciesId}-${item.petLevel}-${item.petQualityId}`;
      if (SharedService.auctionItemsMap[petId]) {
        return SharedService.auctionItemsMap[petId].name;
      }
    }

    if (this.getItem(id)) {
      return this.getItem(item[this.id]).name;
    }

    return '';
  }

  getPetId(pet: any): number {
    if (!SharedService.pets[pet.petSpeciesId]) {
      console.log('Missing pet', pet.petSpeciesId);
      return 0;
    }
    return SharedService.pets[pet.petSpeciesId].creatureId;
  }

  /* istanbul ignore next */
  getItem(itemID: number): Item {
    return SharedService.items[itemID] ?
    SharedService.items[itemID] : new Item();
  }

  getItemID(item: any): number {
    return item[this.id] ? item[this.id] : item.itemID;
  }

  /* istanbul ignore next */
  getAuctionItem(item: any): AuctionItem {
    return SharedService.auctionItemsMap[this.getItemID(item)] ?
      SharedService.auctionItemsMap[this.getItemID(item)] : new AuctionItem();
  }

  moveGroup(from: number, to: number): void {
    SharedService.user.watchlist.moveGroup(from, to);
  }

  removeGroup(index: number): void {
    SharedService.user.watchlist.removeGroup(index);

    this.angulartics2.eventTrack.next({
      action: 'Removed group',
      properties: { category: 'Watchlist' },
    });
    this.pageEvent.pageIndex = 0;
  }

  removeRecipe(recipe: ShoppingCartRecipe, index: number): void {
    SharedService.user.shoppingCart.removeRecipe(recipe, index);
    this.angulartics2.eventTrack.next({
      action: 'Removed recipe',
      properties: { category: 'Shopping cart' },
    });
  }

  /* istanbul ignore next */
  isDarkMode(): boolean {
    return SharedService.user.isDarkMode;
  }

  sort(column: ColumnDescription): void {
    this.sorter.addKey(column.key, column.dataType === 'gold-per-item');
    this.sorter.sort(this.data, column.customSort);
  }

  getSource(recipe: Recipe): string {
    return recipe.profession ? recipe.profession : 'On use';
  }

  displayColumn(column: ColumnDescription): boolean {
    if (this.isMobile() && column.hideOnMobile) {
      return false;
    }
    return true;
  }

  isMobile(): boolean {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  /**
   * Gets a string of the relevant relations for an item
   *
   * @param {*} item
   * @returns {string}
   * @memberof DataTableComponent
   */
  getWHRelations(item: any): string {
    // {{linkType ? linkType : 'npc' }}
    if (item.petSpeciesId) {
      return 'npc=' + this.getPetId(item);
    }
    return (this.linkType ?
      `${ this.linkType }=` : 'item=') + this.getItemID(item);
  }
}
