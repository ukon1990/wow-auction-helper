import { AfterContentInit, AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material';
import { FormControl } from '@angular/forms';
import { SubscriptionManager } from '@ukon1990/subscription-manager/dist/subscription-manager';
import { GameBuild } from '../../../utils/game-build.util';
import { Recipe } from '../../crafting/models/recipe';
import { ColumnDescription } from '../../table/models/column-description';
import { WowdbService } from '../../../services/wowdb.service';
import { ItemService } from '../../../services/item.service';
import { SharedService } from '../../../services/shared.service';
import { Report } from '../../../utils/report.util';
import { AuctionPet } from '../../auction/models/auction-pet.model';
import { Endpoints } from '../../../services/endpoints';
import { Pet } from '../../pet/models/pet';
import { ItemNpcDetails } from '../models/item-npc-details.model';
import { NpcService } from '../../npc/services/npc.service';
import { ZoneService } from '../../zone/service/zone.service';
import { AuctionItem } from '../../auction/models/auction-item.model';

@Component({
  selector: 'wah-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
  @ViewChild('tabs', { static: false }) tabs;
  ignoreNextSelectionHistoryFormChange = false;
  itemSelectionHistoryForm: FormControl = new FormControl(0);
  selectionHistory: any[] = [];
  expansions = GameBuild.expansionMap;
  targetBuyoutValue: number;
  materialFor: Recipe[] = [];
  createdBy: Recipe[];
  locale = localStorage['locale'].split('-')[0];
  indexStoredName = 'item_tab_index';
  selectedTab = localStorage[this.indexStoredName] ? +localStorage[this.indexStoredName] : 0;
  selected = {
    item: undefined,
    auctionItem: undefined,
    seller: undefined,
    pet: undefined
  };
  itemNpcDetails: ItemNpcDetails;
  shoppingCartQuantityField: FormControl = new FormControl(1);
  subscriptions = new SubscriptionManager();
  columns: ColumnDescription[] = [
    { key: 'timeLeft', title: 'Time left', dataType: 'time-left' },
    { key: 'buyout', title: 'Buyout/item', dataType: 'gold-per-item' },
    { key: 'buyout', title: 'Buyout', dataType: 'gold', hideOnMobile: true },
    { key: 'bid', title: 'Bid/item', dataType: 'gold-per-item' },
    { key: 'bid', title: 'Bid', dataType: 'gold', hideOnMobile: true },
    { key: 'quantity', title: 'Size', dataType: '' }
  ];
  droppedByColumns: ColumnDescription[] = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'dropChance', title: 'Drop chance', dataType: 'percent' },
    { key: 'id', title: 'WoWDB', dataType: 'wdb-link' },
    { key: 'id', title: 'WoWHead', dataType: 'whead-link' }
  ];

  recipeColumns: ColumnDescription[] = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'reagents', title: 'Materials (min vs avg price)', dataType: 'materials' },
    { key: 'cost', title: 'Cost', dataType: 'gold' },
    { key: 'roi', title: 'ROI', dataType: 'gold' },
    { key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent' },
    { key: 'avgDailySold', title: 'Avg daily sold', dataType: 'number' },
    { key: undefined, title: 'In cart', dataType: 'cart-recipe-count' }
  ];

  recipeColumnsSimple: ColumnDescription[] = [
    { key: 'rank', title: 'Rank', dataType: '' },
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'profession', title: 'Source', dataType: '' },
    { key: 'cost', title: 'Cost', dataType: 'gold' },
    { key: 'roi', title: 'ROI', dataType: 'gold' },
    { key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent' },
    { key: 'avgDailySold', title: 'Avg daily sold', dataType: 'number' },
    { key: undefined, title: 'In cart', dataType: 'cart-recipe-count' }
  ];

  constructor(private _wowDBService: WowdbService, private npcService: NpcService, private zoneService: ZoneService) {
    this.itemNpcDetails = new ItemNpcDetails(npcService, zoneService);

    this.subscriptions.add(
      SharedService.events.detailSelection,
      item => this.setSelection(item));

    this.subscriptions.add(this.itemSelectionHistoryForm.valueChanges, index => {
      const target = this.selectionHistory[index].auctionItem || this.selectionHistory[index].item;
      if (this.selectionHistory.length > 1 && !this.ignoreNextSelectionHistoryFormChange) {
        this.selectionHistory.splice(index, 1);
      }
      this.setSelection(target);
    });
  }

  ngOnInit(): void {
    this.setItemData();
    // TODO: this.setAuctionItem();
    this.setRecipesForItem();

    Report.send('Opened', 'Item detail view');
    Report.debug('Selected:', this.selected);
  }

  ngAfterViewInit(): void {
    this.subscriptions.add(
      ItemService.itemSelection,
      () => this.ngOnInit()
    );
  }

  ngAfterContentInit(): void {
    SharedService.events.detailPanelOpen.emit(true);
  }

  ngOnDestroy(): void {
    SharedService.events.detailPanelOpen.emit(false);

    this.subscriptions.unsubscribe();
  }

  setItemData(): void {
    if (!this.selected.item) {
      return;
    }
    const id: number = this.selected.item.id;
    if (!id) {
      return;
    }

    if (SharedService.items[id]) {
      this.selected.item = SharedService.items[id];
      this.setMaterialFor();
      this.itemNpcDetails.setForItemId(id);
    }
  }

  setMaterialFor(): void {
    this.materialFor.length = 0;
    SharedService.recipes.forEach(recipe => {
      recipe.reagents.forEach(reagent => {
        if (reagent.itemID === this.selected.item.id) {
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

    Report.send(`Opened ${target}`, `Item detail view`);
  }

  /* istanbul ignore next */
  isDarkMode(): boolean {
    return SharedService.user.isDarkMode;
  }


  setRecipesForItem(): void {
    this.createdBy = undefined;
    if (this.selected.item) {
      this.createdBy = SharedService.itemRecipeMap[this.selected.item.id];
    }
  }

  userHasRecipeForItem(): boolean {
    return !!SharedService.recipesMapPerItemKnown[this.selected.item.id];
  }

  addEntryToCart(): void {
    if (!this.userHasRecipeForItem()) {
      return;
    }
    SharedService.user.shoppingCart
      .add(
        SharedService.recipesMapPerItemKnown[this.selected.item.id],
        this.shoppingCartQuantityField.value);

    Report.send('Added to recipe shopping cart', 'Item detail view');
  }

  /* istanbul ignore next */
  setAuctionItem(): void {
    this.selected.auctionItem = this.auctionItemExists() ?
      SharedService.auctionItemsMap[this.getAuctionId()] : undefined;

    Report.debug('setAuctionItem', this.selected.auctionItem);
  }

  getAuctionId(): any {/*
    if (SharedService.selectedPetSpeciesId !== undefined) {
      return SharedService.selectedPetSpeciesId.auctionId;
    }*/
    return this.selected.item.id;
  }

  /* istanbul ignore next */
  getPet(): Pet {
    const speciesId = (this.selected.auctionItem as AuctionItem).petSpeciesId;
    if (!speciesId) {
      return undefined;
    }
    return SharedService.pets[speciesId];
  }

  /* istanbul ignore next */
  getSelectedPet(): AuctionPet {
    return; // TODO: SharedService.selectedPetSpeciesId;
  }

  getTUJUrl(): string {
    return `${Endpoints.getUndermineUrl()}item/${this.selected.item.id}`;
  }

  /* istanbul ignore next */
  close(): void {/*
    SharedService.selectedItemId = undefined;
    SharedService.selectedPetSpeciesId = undefined;*/
    SharedService.events.detailPanelOpen.emit(false);
    Object.keys(this.selected).forEach(key =>
      this.selected[key] = undefined);
  }

  /* istanbul ignore next */
  auctionItemExists(): boolean {
    return SharedService.auctionItemsMap[this.selected.item.id] ? true : false;
  }

  isMobile(): boolean {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  setTabChange(index: number, tabName: string): void {
    this.selectedTab = index;
    localStorage[this.indexStoredName] = index;
    try {
      Report.send(`Changed tab to ${(this.tabs as MatTabGroup)._tabs['_results'][index].textLabel}`, `Item detail view`);
    } catch (e) {}
  }

  private setSelection(item: any) {
    console.log('this.ignoreNextSelectionHistoryFormChange', this.ignoreNextSelectionHistoryFormChange);
    if (this.ignoreNextSelectionHistoryFormChange) {
      this.ignoreNextSelectionHistoryFormChange = false;
      return;
    }
    this.selected.pet = undefined;

    Report.debug('setSelection', item);
    if (item.auctions) {
      this.handleAuctionItem(item);
    } else if (item.itemID) {
      this.handleItemWithItemID(item);
    } else if (item.id) {
      this.handleItemWithId(item);
    } else if (item.speciesId) {
      this.handlePet(item);
    }
    this.selectionHistory = [{ ...this.selected }, ...this.selectionHistory];
    this.ngOnInit();

    this.ignoreNextSelectionHistoryFormChange = true;
    this.itemSelectionHistoryForm.setValue(0);
  }

  private handleAuctionItem(item: any) {
    this.selected.auctionItem = item;
    this.selected.item = SharedService.items[item.itemID];
    this.selected.pet = SharedService.pets[item.petSpeciesId];
  }

  private handleItemWithItemID(item: any) {
    this.selected.auctionItem = SharedService.auctionItemsMap[item.itemID];
    this.selected.item = SharedService.items[item.itemID];
  }

  private handleItemWithId(item: any) {
    this.selected.auctionItem = SharedService.auctionItemsMap[item.id];
    this.selected.item = SharedService.items[item.id];
  }

  private handlePet(item: any) {
    this.selected.pet = SharedService.pets[item.speciesId];
    for (let i = 0, length = SharedService.auctionItems.length; i < length; i++) {
      if (SharedService.auctionItems[i].petSpeciesId === (this.selected.pet as Pet).speciesId) {
        this.selected.auctionItem = SharedService.auctionItems[i];
        this.selected.item = SharedService.items[this.selected.auctionItem.itemID];
        return;
      }
    }
  }
}
