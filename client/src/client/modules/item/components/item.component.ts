import {AfterContentInit, AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatTabChangeEvent, MatTabGroup} from '@angular/material/tabs';
import {FormControl} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {GameBuild} from '../../../utils/game-build.util';
import {Recipe} from '../../crafting/models/recipe';
import {ColumnDescription} from '../../table/models/column-description';
import {WowdbService} from '../../../services/wowdb.service';
import {ItemService} from '../../../services/item.service';
import {SharedService} from '../../../services/shared.service';
import {Report} from '../../../utils/report.util';
import {AuctionPet} from '../../auction/models/auction-pet.model';
import {Endpoints} from '../../../services/endpoints';
import {Pet} from '../../pet/models/pet';
import {ItemNpcDetails} from '../models/item-npc-details.model';
import {NpcService} from '../../npc/services/npc.service';
import {ZoneService} from '../../zone/service/zone.service';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {CraftingService} from '../../../services/crafting.service';
import {AuctionsService} from '../../../services/auctions.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ItemDetailsUtil} from '../utils/item-details.util';
import {ShoppingCartService} from '../../shopping-cart/services/shopping-cart.service';

@Component({
  selector: 'wah-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements AfterViewInit, AfterContentInit, OnDestroy {
  @ViewChild('tabs') tabs;

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
    pet: undefined
  };
  itemNpcDetails: ItemNpcDetails;
  shoppingCartQuantityField: FormControl = new FormControl(1);
  sm = new SubscriptionManager();
  columns: ColumnDescription[] = [
    {key: 'timeLeft', title: 'Time left', dataType: 'time-left'},
    {key: 'buyout', title: 'Buyout/item', dataType: 'gold-per-item'},
    {key: 'buyout', title: 'Buyout', dataType: 'gold', hideOnMobile: true},
    {key: 'bid', title: 'Bid/item', dataType: 'gold-per-item'},
    {key: 'bid', title: 'Bid', dataType: 'gold', hideOnMobile: true},
    {key: 'quantity', title: 'Size', dataType: ''}
  ];
  droppedByColumns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'dropChance', title: 'Drop chance', dataType: 'percent'},
    {key: 'id', title: 'WoWDB', dataType: 'wdb-link'},
    {key: 'id', title: 'WoWHead', dataType: 'whead-link'}
  ];

  recipeColumns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'reagents', title: 'Materials (min vs avg price)', dataType: 'materials', canNotSort: true},
    {key: 'cost', title: 'Cost', dataType: 'gold'},
    {key: 'roi', title: 'ROI', dataType: 'gold'},
    {key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent'},
    {key: 'avgDailySold', title: 'Avg daily sold', dataType: 'number'},
    {key: undefined, title: 'In cart', dataType: 'cart-recipe-count'}
  ];

  recipeColumnsSimple: ColumnDescription[] = [
    {key: 'rank', title: 'Rank', dataType: ''},
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'profession', title: 'Source', dataType: ''},
    {key: 'cost', title: 'Cost', dataType: 'gold'},
    {key: 'roi', title: 'ROI', dataType: 'gold'},
    {key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent'},
    {key: 'avgDailySold', title: 'Avg daily sold', dataType: 'number'},
    {key: undefined, title: 'In cart', dataType: 'cart-recipe-count'}
  ];
  private tabSubId = 'tab-subscription';

  constructor(private _wowDBService: WowdbService,
              private npcService: NpcService,
              private zoneService: ZoneService,
              private auctionService: AuctionsService,
              private itemService: ItemService,
              private shoppingCartService: ShoppingCartService,
              public dialogRef: MatDialogRef<ItemComponent>,
              @Inject(MAT_DIALOG_DATA) public selection: any) {
    this.itemNpcDetails = new ItemNpcDetails(npcService, zoneService);

    this.setSelection(selection);

    this.sm.add(this.itemSelectionHistoryForm.valueChanges, index => {
      const target = this.selectionHistory[index].auctionItem || this.selectionHistory[index].item;
      if (this.selectionHistory.length > 1 && !this.ignoreNextSelectionHistoryFormChange) {
        this.selectionHistory.splice(index, 1);
      }
      this.setSelection(target);
    });
    this.sm.add(this.itemService.selectionHistory,
      history => {
        this.selectionHistory = history;
      });
  }

  onItemSelection(): void {
    this.setItemData();
    this.setRecipesForItem();

    Report.send('Opened', 'Item detail view');
  }

  ngAfterViewInit(): void {
    this.sm.add(
      ItemService.itemSelection,
      () => this.onItemSelection());
  }

  ngAfterContentInit(): void {
    SharedService.events.detailPanelOpen.emit(true);
    setTimeout(() => {
      const tabGroup: MatTabGroup = this.tabs;
      // Should be done after the render cyclus
      this.sm.add(
        tabGroup
          .selectedTabChange,
        (event: MatTabChangeEvent) => {
          Report.send(`Changed tab to ${event.tab.textLabel}`, `Item detail view`);
        });
    });
  }

  ngOnDestroy(): void {
    SharedService.events.detailPanelOpen.emit(false);

    this.sm.unsubscribe();
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
      this.itemNpcDetails.setForItemId(id, NpcService.list.value);
    }
  }

  setMaterialFor(): void {
    const materialFor = CraftingService.reagentRecipeMap.value.get(this.selected.item.id) || [];
    this.materialFor = [...materialFor];
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
    if (!this.selected.item) {
      return false;
    }
    const ai = this.auctionService.mapped.value.get(this.selected.item.id);
    return !!(ai && ai.source &&
      ai.source.recipe &&
      ai.source.recipe.known &&
      ai.source.recipe.known.length);
  }

  addEntryToCart(isRecipe: boolean = true): void {/*
    if (!this.userHasRecipeForItem()) {
      return;
    }*/
    const quantity: number = +this.shoppingCartQuantityField.value;
    if (isRecipe) {
      this.shoppingCartService.addRecipeByItemId(this.selected.item.id, quantity);
      Report.send('Added to recipe shopping cart', 'Item detail view');
    } else {
      this.shoppingCartService.addItem(this.selected.item.id, quantity);
      Report.send('Added to item shopping cart', 'Item detail view');
    }

  }

  /* istanbul ignore next */
  getPet(): Pet {
    const auctionItem: AuctionItem = this.selected.auctionItem;
    const speciesId = auctionItem ? auctionItem.petSpeciesId : undefined;
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
  close(): void {
    this.sm.unsubscribeById(this.tabSubId);
    SharedService.events.detailPanelOpen.emit(false);
    this.dialogRef.close();
  }

  isMobile(): boolean {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  setTabChange(index: number, tabName: string): void {
    this.selectedTab = index;
    localStorage[this.indexStoredName] = index;
  }

  private setSelection(item: any) {
    if (this.ignoreNextSelectionHistoryFormChange) {
      this.ignoreNextSelectionHistoryFormChange = false;
      return;
    }

    this.selected = ItemDetailsUtil.getSelection(item, this.auctionService.mapped.value);
    this.itemService.addToSelectionHistory({...this.selected});
    this.onItemSelection();
    this.itemSelectionHistoryForm.setValue(0);
    this.ignoreNextSelectionHistoryFormChange = true;
  }


}
