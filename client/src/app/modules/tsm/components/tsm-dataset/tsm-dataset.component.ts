import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {ObjectUtil} from '@ukon1990/js-utilities/dist/utils/object.util';
import {SharedService} from '../../../../services/shared.service';
import {TsmLuaUtil} from '../../../../utils/tsm-lua.util';
import {Item, ItemInventory} from '../../../../models/item/item';
import {TSM} from '../../../auction/models/tsm.model';
import {ActivatedRoute, Router} from '@angular/router';
import {EmptyUtil} from '@ukon1990/js-utilities/dist/utils/empty.util';

@Component({
  selector: 'wah-tsm-dataset',
  templateUrl: './tsm-dataset.component.html',
  styleUrls: ['./tsm-dataset.component.scss']
})
export class TsmDatasetComponent implements OnDestroy, OnInit {
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
        {key: 'character.model.ts', title: 'character.model.ts', dataType: 'seller'},
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
        {key: 'sumBuyout', title: 'Total buyout', dataType: 'gold'}
      ],
      data: [],
      hasCharacters: false
    },
    {
      title: 'Gold log',
      name: 'goldLog',
      columns: [
        {key: 'minute', title: 'Time', dataType: 'date'},
        {key: 'character.model.ts', title: 'Character', dataType: 'seller'},
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
  sm = new SubscriptionManager();
  inventoryValue: number;
  inventoryValueOnlyInDemand: number;

  constructor(private formBuilder: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.form = this.formBuilder.group({
      dataset: new FormControl(0),
      realm: new FormControl(),
      character: new FormControl()
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
      (name: string) =>
        this.setTableData(this.form.value.realm, name));

    this.sm.add(
      TsmLuaUtil.events,
      () => this.initContent());
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
    if (this.selectedSet && this.selectedSet.hasCharacters) {
      this.characters.length = 0;
      this.characters.push('All');
      if (this.selectedSet.data[this.form.value.realm]) {
        Object.keys(this.selectedSet.data[this.form.value.realm])
          .forEach(name => {
            if (name !== 'All') {
              this.characters.push(name);
            }
          });
      }

      if (this.form.value.character && this.form.value.realm === realm) {
        this.setTableData(realm, this.form.value.character);
      } else {
        this.form.controls.character.setValue(this.characters[0]);
      }
    } else {
      this.setTableData(realm);
    }

    this.handleInventorySet();
  }

  setDataSets(data): void {
    this.dataSets.forEach(set =>
      set.data = data[set.name]);
  }

  private setTableData(realm: string, character?: string) {
    if (!this.selectedSet) {
      return;
    }
    if (realm && character) {
      this.table.columns = this.selectedSet.columns;
      this.table.data = this.selectedSet.data[realm][character];
    } else {
      this.table.columns = this.selectedSet.columns;
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

  private handleInventorySet() {
    if (!this.currentSetIsInventory()) {
      return;
    }
    const realm = this.form.getRawValue().realm;
    this.inventoryValue = 0;
    this.inventoryValueOnlyInDemand = 0;
    this.selectedSet.data[realm].forEach((iv: ItemInventory) => {
      const tsm: TSM = SharedService.tsm[iv.id];
      if (!this.isSoldByVendor(SharedService.items[iv.id])) {
        this.inventoryValue += iv.sumBuyout;

        if (tsm && tsm.RegionAvgDailySold > 1) {
          this.inventoryValueOnlyInDemand += iv.sumBuyout;
        }
      }
    });
  }

  private isSoldByVendor(item: Item): boolean {
    return item && item.itemSource && item.itemSource.soldBy && item.itemSource.soldBy.length > 0;
  }
}
