import {AfterContentInit, AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Angulartics2} from 'angulartics2';
import {MatTabChangeEvent, MatTabGroup} from '@angular/material';
import {FormControl} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {GameBuild} from '../../../../utils/game-build.util';
import {Recipe} from '../../../crafting/models/recipe';
import {ColumnDescription} from '../../../table/models/column-description';
import {WowdbService} from '../../../../services/wowdb.service';
import {ItemService} from '../../../../services/item.service';
import {SharedService} from '../../../../services/shared.service';
import {Report} from '../../../../utils/report.util';
import {AuctionPet} from '../../../auction/models/auction-pet.model';
import {Endpoints} from '../../../../services/endpoints';
import {Pet} from '../../../pet/models/pet';
import {User} from '../../../../models/user/user';

@Component({
  selector: 'wah-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
  @ViewChild('tabs', {static: false}) tabs;
  expansions = GameBuild.expansionMap;
  wowDBItem: any;
  factionId: number;
  targetBuyoutValue: number;
  materialFor: Array<Recipe> = new Array<Recipe>();
  createdBy: Array<Recipe>;
  locale = localStorage['locale'].split('-')[0];
  indexStoredName = 'item_tab_index';
  selectedTab = localStorage[this.indexStoredName] ? localStorage[this.indexStoredName] : 1;
  personalSaleRate;
  selected = {
    item: undefined,
    auctionItem: undefined,
    seller: undefined
  };
  shoppingCartQuantityField: FormControl = new FormControl(1);
  subscriptions = new SubscriptionManager();
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
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'reagents', title: 'Materials', dataType: 'materials'},
    {key: 'cost', title: 'Cost', dataType: 'gold'},
    {key: 'roi', title: 'ROI', dataType: 'gold'},
    {key: undefined, title: 'In cart', dataType: 'cart-recipe-count'}
  ];

  recipeColumnsSimple: Array<ColumnDescription> = [
    {key: 'rank', title: 'Rank', dataType: ''},
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'profession', title: 'Source', dataType: ''},
    {key: 'cost', title: 'Cost', dataType: 'gold'},
    {key: 'roi', title: 'ROI', dataType: 'gold'},
    {key: undefined, title: 'In cart', dataType: 'cart-recipe-count'}
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
  private isUsing3PAPI: boolean;

  constructor(private _wowDBService: WowdbService, private angulartics2: Angulartics2) {
  }

  ngOnInit(): void {
    this.factionId = SharedService.user.faction;
    this.isUsing3PAPI = SharedService.user.apiToUse !== 'none';
    this.setItemData();
    this.setAuctionItem();
    this.setRecipesForItem();

    Report.send('Opened', 'Item detail view');
  }

  ngAfterViewInit(): void {
    this.subscriptions.add(
      (this.tabs as MatTabGroup)
        .selectedTabChange,
      (event: MatTabChangeEvent) => {
        this.angulartics2.eventTrack.next({
          action: `Changed tab to ${event.tab.textLabel}`,
          properties: {category: `Item detail view`},
        });
      }
    );

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

  setPersonalSaleRate(saleRate: number): void {
    this.personalSaleRate = saleRate;
  }

  setItemData(): void {
    if (!SharedService.selectedItemId) {
      return;
    }

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
      action: `Opened ${target}`,
      properties: {category: `Item detail view`},
    });
  }

  /* istanbul ignore next */
  isDarkMode(): boolean {
    return SharedService.user.isDarkMode;
  }


  setRecipesForItem(): void {
    this.createdBy = SharedService.itemRecipeMap[SharedService.selectedItemId];
  }

  userHasRecipeForItem(): boolean {
    return !!SharedService.recipesMapPerItemKnown[SharedService.selectedItemId];
  }

  addEntryToCart(): void {
    if (!this.userHasRecipeForItem()) {
      return;
    }
    SharedService.user.shoppingCart
      .add(
        SharedService.recipesMapPerItemKnown[SharedService.selectedItemId],
        this.shoppingCartQuantityField.value);

    this.angulartics2.eventTrack.next({
      action: 'Added to recipe shopping cart',
      properties: {category: 'Item detail view'},
    });
  }

  /* istanbul ignore next */
  setAuctionItem(): void {
    this.selected.auctionItem = this.auctionItemExists() ?
      SharedService.auctionItemsMap[this.getAuctionId()] : undefined;

    Report.debug('setAuctionItem', this.selected.auctionItem);
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
    return `${Endpoints.getUndermineUrl()}item/${this.selected.item.id}`;
  }

  /* istanbul ignore next */
  close(): void {
    SharedService.selectedItemId = undefined;
    SharedService.selectedPetSpeciesId = undefined;
    SharedService.events.detailPanelOpen.emit(false);
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

  emitSelectedTab(seller: string) {
    // TODO: Forgotten?
  }
}
