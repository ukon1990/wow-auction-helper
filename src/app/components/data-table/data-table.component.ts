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
  pageRows: Array<number> = [10, 20, 40, 80, 100];
  pageEvent: PageEvent = { pageIndex: 0, pageSize: this.pageRows[0], length: 0 };
  sorter: Sorter;
  previousLength = 0;
  auctionDuration = {
    'VERY_LONG': '12h+',
    'LONG': '2-12h',
    'MEDIUM': '30m-2h',
    'SHORT': '<30m'
  };

  constructor() {
    this.sorter = new Sorter();
  }

  ngAfterViewInit() {
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
      const a = SharedService.auctionItemsMap[auction.item ? auction.item : auction.itemID];
      return SharedService.userAuctions.charactersMap[a.ownerRealm] &&
        SharedService.userAuctions.charactersMap[a.ownerRealm][a.owner] ? true : false;
    }
    return false;
  }

  /* istanbul ignore next */
  setSelectedSeller(seller: Seller) {
    SharedService.selectedSeller = seller.name;
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
    return SharedService.recipesForUser[recipe.spellID] ? SharedService.recipesForUser[recipe.spellID].toString() : '';
  }

  customPrices(): CustomPrices {
    return CustomPrices;
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
    if (name) {
      return name;
    }

    if (this.getItem(id)) {
      return this.getItem(item[this.id]).name;
    }

    return '';
  }

  getPetId(pet: any): number {
    return SharedService.pets[pet.petSpeciesId].creatureId;
  }

  /* istanbul ignore next */
  getItem(itemID: number): Item {
    return SharedService.items[itemID] ? SharedService.items[itemID] : new Item();
  }

  getItemID(item: any): number {
    return item[this.id] ? item[this.id] : item.itemID;
  }

  /* istanbul ignore next */
  getAuctionItem(item: any): AuctionItem {
    return SharedService.auctionItemsMap[this.getItemID(item)] ?
      SharedService.auctionItemsMap[this.getItemID(item)] : new AuctionItem();
  }

  /* istanbul ignore next */
  isDarkMode(): boolean {
    return SharedService.user.isDarkMode;
  }

  sort(key: string): void {
    this.sorter.addKey(key);
    this.sorter.sort(this.data);
  }
}
