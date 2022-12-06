import {AfterContentInit, AfterViewInit, Component, Inject, OnDestroy, ViewChild} from '@angular/core';
import {MatTabChangeEvent, MatTabGroup} from '@angular/material/tabs';
import {UntypedFormControl} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {Recipe} from '../../crafting/models/recipe';
import {ColumnDescription, Item, Pet} from '@shared/models';
import {ItemService} from '../../../services/item.service';
import {SharedService} from '../../../services/shared.service';
import {Report} from '../../../utils/report.util';
import {AuctionPet} from '../../auction/models/auction-pet.model';
import {Endpoints} from '../../../services/endpoints';
import {ItemNpcDetails} from '../models/item-npc-details.model';
import {NpcService} from '../../npc/services/npc.service';
import {ZoneService} from '../../zone/service/zone.service';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {CraftingService} from '../../../services/crafting.service';
import {AuctionsService} from '../../../services/auctions.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ItemDetailsUtil} from '../utils/item-details.util';
import {ShoppingCartService} from '../../shopping-cart/services/shopping-cart.service';
import {ErrorReport} from '../../../utils/error-report.util';
import {RealmService} from '../../../services/realm.service';

@Component({
  selector: 'wah-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements AfterViewInit, AfterContentInit, OnDestroy {
  @ViewChild('tabs') tabs;
  wowheadBaseUrl: string;

  ignoreNextSelectionHistoryFormChange = false;
  itemSelectionHistoryForm: UntypedFormControl = new UntypedFormControl(0);
  selectionHistory: any[] = [];
  targetBuyoutValue: number;
  materialFor: Recipe[] = [];
  createdBy: Recipe[];
  locale = localStorage['locale'].split('-')[0];
  indexStoredName = 'item_tab_index';
  selectedTab = localStorage[this.indexStoredName] ? +localStorage[this.indexStoredName] : 0;
  itemVariations: AuctionItem[] = [];
  selected: {
    item: Item;
    auctionItem: AuctionItem;
    pet: Pet;
  } = {
    item: undefined,
    auctionItem: undefined,
    pet: undefined
  };
  auctionItems: AuctionItem[] = [];
  itemNpcDetails: ItemNpcDetails;
  shoppingCartQuantityField: UntypedFormControl = new UntypedFormControl(1);
  sm = new SubscriptionManager();

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
    {key: undefined, title: 'In cart', dataType: 'cart-recipe-count'}
  ];

  recipeColumnsSimple: ColumnDescription[] = [
    {key: 'rank', title: 'Rank', dataType: ''},
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'profession', title: 'Source', dataType: ''},
    {key: 'cost', title: 'Cost', dataType: 'gold'},
    {key: 'roi', title: 'ROI', dataType: 'gold'},
    {key: undefined, title: 'In cart', dataType: 'cart-recipe-count'}
  ];
  private tabSubId = 'tab-subscription';

  constructor(private npcService: NpcService,
              private realmService: RealmService,
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
    const ai = this.auctionService.getById(this.selected.item.id);
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
    const auctionItem: AuctionItem = this.selected?.auctionItem;
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

    this.selected = ItemDetailsUtil.getSelection(item,
      this.auctionService.mapped.value,
      this.auctionService.mappedVariations.value);

    if (!this.selected) {
      return;
    }
    try {
      this.itemVariations = (this.auctionService.mappedVariations.value.get(this.selected.item.id) || [])
        .sort((a, b) => b.itemLevel - a.itemLevel);
      this.itemService.addToSelectionHistory({...this.selected});
      this.auctionItems = this.auctionService.mappedVariations.value.get(this.selected.item.id);
      this.onItemSelection();
      this.itemSelectionHistoryForm.setValue(0);
      this.ignoreNextSelectionHistoryFormChange = true;
      Report.debug('ItemComponent.setSelection', this.selected);
    } catch (error) {
      ErrorReport.sendError('ItemComponent.setSelection', error);
    }
    this.wowheadBaseUrl = `http://www.wowhead.com${
      this.realmService.isClassic ? '/wotlk' : ''
    }/item=`;
  }


  openVariation(variation: AuctionItem) {
    SharedService.events.detailSelection.emit(variation);
  }
}