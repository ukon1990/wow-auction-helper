import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {ObjectUtil} from '@ukon1990/js-utilities/dist/utils/object.util';
import {SharedService} from '../../../../services/shared.service';
import {TsmLuaUtil} from '../../../../utils/tsm/tsm-lua.util';
import {Item, ItemInventory} from '../../../../models/item/item';
import {TSM} from '../../../auction/models/tsm.model';
import {ActivatedRoute, Router} from '@angular/router';
import {EmptyUtil} from '@ukon1990/js-utilities/dist/utils/empty.util';
import {Filters} from '../../../../utils/filtering';
import {Report} from '../../../../utils/report.util';

@Component({
  selector: 'wah-tsm-dataset',
  templateUrl: './addon-dataset.component.html',
  styleUrls: ['./addon-dataset.component.scss']
})
export class AddonDatasetComponent implements OnDestroy, OnInit {
  columns = {
    amount: [
      {key: 'type', title: 'Source', dataType: 'string'},
      {key: 'otherPlayer', title: 'From', dataType: 'seller'},
      {key: 'player', title: 'To', dataType: 'seller'},
      {key: 'amount', title: 'Amount', dataType: 'gold'},
      {key: 'time', title: 'Time', dataType: 'date'}
    ],
    player: [
      {key: 'name', title: 'Name', dataType: 'name'},
      {key: 'player', title: 'Character', dataType: 'seller'},
      {key: 'source', title: 'Source', dataType: 'string'},
      {key: 'otherPlayer', title: 'Other player', dataType: 'seller'},
      {key: 'quantity', title: 'Quantity', dataType: 'number'},
      {key: 'price', title: 'Price', dataType: 'gold'},
      {key: 'stackSize', title: 'Stack size', dataType: 'number'},
      {key: 'time', title: 'Time', dataType: 'date'}
    ],
    buys: [
      {key: 'name', title: 'Name', dataType: 'name'},
      {key: 'player', title: 'Character', dataType: 'seller'},
      {key: 'otherPlayer', title: 'From', dataType: 'seller'},
      {key: 'quantity', title: 'Quantity', dataType: 'number'},
      {key: 'stackSize', title: 'Size', dataType: 'number'},
      {key: 'price', title: 'Price', dataType: 'gold'},
      {key: 'time', title: 'Time', dataType: 'date'}
    ]
  };
  dataSets = [
    {
      title: 'Sold items',
      name: 'csvSales',
      columns: this.columns.player,
      data: [],
      hasCharacters: false
    },
    {
      title: 'Income',
      name: 'csvIncome',
      columns: this.columns.amount,
      data: [],
      hasCharacters: false
    },
    {
      title: 'Expired auctions',
      name: 'csvExpired',
      columns: this.columns.player,
      data: [],
      hasCharacters: false
    },
    {
      title: 'Expenses',
      name: 'csvExpense',
      columns: this.columns.amount,
      data: [],
      hasCharacters: false
    },
    {
      title: 'Cancelled auctions',
      name: 'csvCancelled',
      columns: [
        {key: 'name', title: 'Name', dataType: 'name'},
        {key: 'player', title: 'Character', dataType: 'seller'},
        {key: 'quantity', title: 'Quantity', dataType: 'number'},
        {key: 'stackSize', title: 'Size', dataType: 'number'},
        {key: 'time', title: 'Time', dataType: 'date'}
      ],
      data: [],
      hasCharacters: false
    },
    {
      title: 'Purchased auctions',
      name: 'csvBuys',
      columns: this.columns.buys,
      data: [],
      hasCharacters: false
    }, {
      title: 'Pending mail',
      name: 'pendingMail',
      columns: [],
      data: [],
      hasCharacters: true
    },
    {
      title: 'Auctions',
      name: 'auctionQuantity',
      columns: [
        {key: 'name', title: 'Name', dataType: 'name'},
        {key: 'character', title: 'character.model.ts', dataType: 'seller'},
        {key: 'value', title: 'Quantity', dataType: 'number'}
      ],
      data: [],
      hasCharacters: true
    }, {
      title: 'Inventory',
      name: 'inventory',
      columns: [
        {key: 'name', title: 'Name', dataType: 'name'},
        {key: 'characters', title: 'Character', dataType: 'array'},
        {key: 'quantity', title: 'Quantity', dataType: 'number'},
        {key: 'buyout', title: 'Buyout', dataType: 'gold'},
        {key: 'sumBuyout', title: 'Total buyout', dataType: 'gold'},
        {key: 'regionSaleAvg', title: 'Regional sale avg', dataType: 'gold'},
        {key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent'},
        {key: 'avgDailySold', title: 'Avg daily sold', dataType: 'number'},
        {key: 'past14DaysSaleRate', title: 'Personal sale rate(14)', dataType: 'percent'},
        {key: 'totalSaleRate', title: 'Personal sale rate(total)', dataType: 'percent'},
      ],
      data: [],
      hasCharacters: false
    },
    {
      title: 'Gold log',
      name: 'goldLog',
      columns: [
        {key: 'minute', title: 'Time', dataType: 'date'},
        {key: 'character', title: 'Character', dataType: 'seller'},
        {key: 'copper', title: 'Gold', dataType: 'gold'}
      ],
      data: [],
      hasCharacters: true
    }
  ];
  realms = [];
  characters = [];
  selectedSet;
  table = {
    columns: [],
    data: []
  };
  form: FormGroup;
  inventoryFilterForm: FormGroup;
  sm = new SubscriptionManager();
  inventoryValue: number;
  inventoryValueOnlyInDemand: number;
  currentGold = 0;

  constructor(private formBuilder: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.form = this.formBuilder.group({
      dataset: new FormControl(0),
      realm: new FormControl(),
      character: new FormControl(),
      faction: new FormControl(SharedService.user.faction)
    });

    this.inventoryFilterForm = this.formBuilder.group({
      saleRate: new FormControl(0),
      avgDailySold: new FormControl(0)
    });
  }

  ngOnInit() {
    this.setSubscriptions();
    this.initContent();
  }

  private setSubscriptions() {
    this.sm.add(
      this.form.controls.dataset.valueChanges,
      (set) => {
        this.handleDataSetChange(set);
      });
    this.sm.add(
      this.form.controls.realm.valueChanges,
      (realm: string) =>
        this.setCharactersOnRealm(realm));

    this.sm.add(
      this.form.controls.character.valueChanges,
      (name: string) => {
        this.setTableData(this.form.value.realm, name);
      });

    this.sm.add(
      this.form.controls.faction.valueChanges,
      (faction: number) =>
        this.handleFactionChange(faction));

    this.sm.add(
      TsmLuaUtil.events,
      () => this.initContent());

    this.sm.add(
      this.inventoryFilterForm.valueChanges,
      (formData) =>
        this.handleInventorySet(this.form.getRawValue().faction, formData));
  }

  initContent(): void {
    if (SharedService.tsmAddonData.characterGuilds) {
      const firstChild = this.route.snapshot.firstChild;
      const name = !EmptyUtil.isNullOrUndefined(firstChild) ?
        firstChild.params.name : undefined;
      this.setDataSets(SharedService.tsmAddonData);

      if (name) {
        for (let i = 0, sets = this.dataSets; i < sets.length; i++) {
          if (sets[i].name === name) {
            this.form.controls.dataset.setValue(i);
            return;
          }
        }
      } else {
        this.form.controls.dataset.setValue(0);
      }
    }

    this.setRealmFormValue();
  }

  private setRealmFormValue() {
    const realm = SharedService.realms[SharedService.user.realm];
    if (realm) {
      this.form.controls.realm.setValue(realm.name);
    } else {
      this.sm.add(
        SharedService.events.realms,
        () => this.setRealmFormValue(),
        {terminateUponEvent: true});
    }
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  getFilterParam(): string {
    if (!this.table.data || !this.table.data[0]) {
      return undefined;
    }

    if (this.table.data[0].name) {
      return 'name';
    } else if (this.table.data[0].source) {
      return 'type';
    }
    return undefined;
  }

  private handleDataSetChange(index: number) {
    this.selectedSet = this.dataSets[index];
    this.realms.length = 0;
    Object.keys(this.selectedSet.data)
      .forEach(realm =>
        this.realms.push(realm));

    if (EmptyUtil.isNullOrUndefined(this.form.value.realm)) {
      this.form.controls.realm.setValue(this.realms[0]);
    } else {
      this.setCharactersOnRealm(this.form.value.realm);
    }

    this.handleInventorySet();
    this.handleGoldLogSet();
    this.updateRoute();
  }

  private updateRoute() {
    this.router.navigate(['.', this.selectedSet.name], {
      relativeTo: this.route
    });
  }

  currentSetIsInventory(): boolean {
    return this.selectedSet && this.selectedSet.name === 'inventory';
  }

  private setCharactersOnRealm(realm: string) {
    const {character, faction} = this.form.value;
    if (this.selectedSet && this.selectedSet.hasCharacters) {
      this.handleDataSetWithCharacters(realm, character);
    } else if (this.currentSetIsInventory()) {
      this.setTableData(realm, undefined, faction);
      this.handleInventorySet();
    } else {
      this.setTableData(realm);
    }

  }

  private handleDataSetWithCharacters(realm: string, character) {
    this.characters.length = 0;
    this.characters.push('All');
    if (this.selectedSet.data[realm]) {
      Object.keys(this.selectedSet.data[realm])
        .forEach(name => {
          if (name !== 'All') {
            this.characters.push(name);
          }
        });
    }

    if (character && this.form.value.realm === realm) {
      this.setTableData(realm, character);
    } else {
      // So that it won't happen until the actual realm value is set to the form
      setTimeout(() =>
        this.form.controls.character.setValue(this.characters[0]));
    }
    this.handleGoldLogSet(realm);
  }

  setDataSets(data): void {
    this.dataSets.forEach(set =>
      set.data = data[set.name]);
  }

  private setTableData(realm: string, character?: string, faction?: number) {
    if (!this.selectedSet) {
      return;
    }

    this.table.columns = this.selectedSet.columns;
    if (realm && character) {
      Report.debug('AddonDatasetComponent.setTableData', this.selectedSet, realm, character);
      this.table.data = this.selectedSet.data[realm][character];
    } else if (realm && !EmptyUtil.isNullOrUndefined(faction)) {
      const realmData = this.selectedSet.data[realm];
      this.table.data = realmData[faction] || [];
    } else {
      this.table.data = this.selectedSet.data[realm];
    }

    if (ObjectUtil.isObject(this.table.data)) {
      const list = [];
      Object.keys(this.table.data)
        .forEach(id =>
          list.push(this.table.data[id]));
      this.table.data = list;
    }
    this.sortTableByTime();
    Report.debug('AddonDatasetComponent.setTableData', this.table);
  }

  private sortTableByTime() {
    if (this.shouldSortBasedOnTime()) {
      this.table.data
        .sort((a, b) =>
          (b.time || b.minute) - (a.time || a.minute));
    }
  }

  private shouldSortBasedOnTime() {
    return this.table.data && this.table.data[0] && (this.table.data[0].time || this.table.data[0].minute);
  }

  private handleInventorySet(currentFaction?: number, formData?: { saleRate: number, avgDailySold: number }) {
    if (!this.currentSetIsInventory()) {
      return;
    }
    const {realm, faction} = this.form.getRawValue();
    const factionToUse = !EmptyUtil.isNullOrUndefined(currentFaction) ?
      currentFaction : faction;
    let list = this.selectedSet.data[realm][factionToUse];
    this.inventoryValue = 0;
    this.inventoryValueOnlyInDemand = 0;
    if (!list) {
      return;
    }
    if (!formData) {
      formData = this.inventoryFilterForm.getRawValue();
    }

    list = this.filterInventory(formData, list);

    list.forEach((iv: ItemInventory) => {
      const tsm: TSM = SharedService.tsm[iv.id];
      if (!this.isSoldByVendor(SharedService.items[iv.id])) {
        this.inventoryValue += iv.sumBuyout;

        if (tsm && tsm.RegionAvgDailySold > 1) {
          this.inventoryValueOnlyInDemand += iv.sumBuyout;
        }
      }
    });
    this.table.data = list;
  }

  private isSoldByVendor(item: Item): boolean {
    return item && item.itemSource && item.itemSource.soldBy && item.itemSource.soldBy.length > 0;
  }

  private handleFactionChange(faction: number) {
    this.setTableData(this.form.value.realm, undefined, faction);
    this.handleInventorySet(faction);
  }

  private filterInventory(formData: { saleRate: number, avgDailySold: number }, data: ItemInventory[]) {
    return data.filter(item =>
      Filters.isSaleRateMatch(item.id, formData.saleRate) &&
      Filters.isDailySoldMatch(item.id, formData.avgDailySold));
  }

  private handleGoldLogSet(realm?: string) {
    if (!realm) {
      realm = this.form.getRawValue().realm;
    }

    this.currentGold = 0;

    if (this.isGoldLogSet()) {
      const realmData = this.selectedSet.data[realm];
      Object.keys(realmData)
        .forEach(name => {
          if (name !== 'All') {
            let latestValue = {minute: 0, copper: 0};
            realmData[name].forEach(d => {
              if (d.minute > latestValue.minute) {
                latestValue = {minute: d.minute, copper: d.copper};
              }
            });
            this.currentGold += latestValue.copper;
          }
        });
    }
  }

  private isGoldLogSet() {
    return this.selectedSet && this.selectedSet.name === 'goldLog' && this.selectedSet.data;
  }
}
