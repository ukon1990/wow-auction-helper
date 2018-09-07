import { Component, OnInit, Input, ViewChild, AfterContentInit, OnDestroy, OnChanges, AfterViewInit } from '@angular/core';
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
import { Endpoints } from '../../services/endpoints';
import { MatTabGroup, MatTab, MatTabChangeEvent } from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
  selector: 'wah-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
  @ViewChild('tabs') tabs;
  wowDBItem: any;
  targetBuyoutValue: number;
  materialFor: Array<Recipe> = new Array<Recipe>();
  createdBy: Array<Recipe>;
  locale = localStorage['locale'].split('-')[0];
  indexStoredName = 'item_tab_index';
  selectedTab = localStorage[this.indexStoredName] ? localStorage[this.indexStoredName] : 1;
  selectedTabSubscription: Subscription;
  selected = {
    item: undefined,
    auctionItem: undefined,
    seller: undefined
  };
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

  droppedByColumns: Array<ColumnDescription> = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'dropChance', title: 'Drop chance', dataType: 'percent'},
    {key: 'location', title: 'Zone', dataType: 'zone'},
    {key: 'id', title: 'WoWDB', dataType: 'wdb-link'},
    {key: 'id', title: 'WoWHead', dataType: 'whead-link'}
  ];

  containedInColumns: Array<ColumnDescription> = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'dropChance', title: 'Drop chance', dataType: 'percent'},
    {key: 'id', title: 'WoWDB', dataType: 'wdb-link'},
    {key: 'id', title: 'WoWHead', dataType: 'whead-link'}
  ];

  soldByColumns: Array<ColumnDescription> = [
    {key: 'name', title: 'Name', dataType: ''},
    {key: 'tag', title: 'Tag', dataType: ''},
    {key: 'location', title: 'Zone', dataType: 'zone'},
    {key: 'cost', title: 'Price', dataType: 'vendor-currency'},
    {key: 'id', title: 'WoWDB', dataType: 'wdb-link'},
    {key: 'id', title: 'WoWHead', dataType: 'whead-link'}
  ];

  constructor(private _wowDBService: WowdbService, private angulartics2: Angulartics2) {
    this.angulartics2.eventTrack.next({
      action: 'Opened',
      properties: { category: 'Item detail view' },
    });
  }

  ngOnInit(): void {
    console.log('selected', this.selected);

    this.setItemData();
    this.setAuctionItem();
    this.setRecipesForItem();
  }

  ngAfterViewInit(): void {
    this.selectedTabSubscription = (this.tabs as MatTabGroup)
      .selectedTabChange.subscribe(
        (event: MatTabChangeEvent) => {
          this.angulartics2.eventTrack.next({
            action: `Changed tab to ${ event.tab.textLabel }`,
            properties: { category: `Item detail view` },
          });
        });
  }

  ngAfterContentInit(): void {
    SharedService.events.detailPanelOpen.emit(true);
  }

  ngOnDestroy(): void {
    this.selectedTabSubscription.unsubscribe();
    SharedService.events.detailPanelOpen.emit(false);
  }

  setItemData(): void {
    if (!SharedService.selectedItemId) {
      return;
    }
    console.log(SharedService.items[SharedService.selectedItemId]);

    if (SharedService.items[SharedService.selectedItemId]) {
      this.selected.item = SharedService.items[SharedService.selectedItemId];
      this.setMaterialFor();
    }
  }

  setMaterialFor(): void {
    this.materialFor.length = 0;
    SharedService.recipes.forEach(recipe => {
      recipe.reagents.forEach(reagent => {
        if (reagent.itemID === SharedService.selectedItemId) {
          this.materialFor.push(recipe);
        }
      });
    });
  }

  openInNewTab(url: string, target: string) {
    if (navigator.platform !== 'Win32' &&
      (window.navigator['standalone'] || window.matchMedia('(display-mode: standalone)').matches)) {
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('target', '_blank');

      const dispatch = document.createEvent('HTMLEvents');
      dispatch.initEvent('click', true, true);
      a.dispatchEvent(dispatch);
    } else {
      window.open(url, '_blank');
    }

    this.angulartics2.eventTrack.next({
      action: `Opened ${ target }`,
      properties: { category: `Item detail view` },
    });
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


  setRecipesForItem(): void {
    this.createdBy = SharedService.itemRecipeMap[SharedService.selectedItemId];
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

    this.angulartics2.eventTrack.next({
      action: 'Added to recipe shopping cart',
      properties: { category: 'Item detail view' },
    });
  }

  /* istanbul ignore next */
  setAuctionItem(): void {
    this.selected.auctionItem = this.auctionItemExists() ?
      SharedService.auctionItemsMap[this.getAuctionId()] : undefined;
  }

  getAuctionId(): any {
    if (SharedService.selectedPetSpeciesId !== undefined) {
      return SharedService.selectedPetSpeciesId.auctionId;
    }
    return SharedService.selectedItemId;
  }

  /* istanbul ignore next */
  isUsingTSM(): boolean {
    return SharedService.user.apiToUse === 'tsm';
  }

  /* istanbul ignore next */
  isUsingWoWUction(): boolean {
    return SharedService.user.apiToUse === 'wowuction';
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

  getTUJUrl(): string {
    return `${Endpoints.getUndermineUrl()}item/${this.selected.item().id}`;
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

  setTabChange(index: number, tabName: string): void {
    this.selectedTab = index;
    localStorage[this.indexStoredName] = index;
  }
}
