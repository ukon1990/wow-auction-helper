import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SubscriptionsUtil} from '../../utils/subscriptions.util';
import {TsmLuaUtil} from '../../utils/tsm-lua.util';
import {ObjectUtil} from '../../utils/object.util';

@Component({
  selector: 'wah-tsm-addon-db',
  templateUrl: './tsm-addon-db.component.html',
  styleUrls: ['./tsm-addon-db.component.scss']
})
export class TsmAddonDbComponent implements OnInit, OnDestroy {
  form: FormGroup;
  /**
   amount: 50000000
   otherPlayer: "Mission"
   player: "Bløder"
   time: 1552897387
   type: "Garrison"
   */
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
      {key: 'quantity', title: 'Quantity', dataType: 'number'},
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
      name: 'csvSales',
      columns: this.columns.player,
      data: [],
      hasCharacters: false
    },
    {
      name: 'csvIncome',
      columns: this.columns.amount,
      data: [],
      hasCharacters: false
    },
    {
      name: 'csvExpired',
      columns: this.columns.player,
      data: [],
      hasCharacters: false
    },
    {
      name: 'csvExpense',
      columns: this.columns.amount,
      data: [],
      hasCharacters: false
    },
    {
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
      name: 'csvBuys',
      columns: this.columns.buys,
      data: [],
      hasCharacters: false
    },
    {
      name: 'auctionQuantity',
      columns: [],
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
  selectedSet;
  realms = [];
  characters = [];
  table = {
    columns: [],
    data: []
  };

  subscriptions = new SubscriptionsUtil();

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      dataset: new FormControl(0),
      realm: new FormControl(),
      character: new FormControl()
    });
  }

  ngOnInit() {
    this.subscriptions.add(
      this.form.controls.dataset.valueChanges,
      (set) =>
        this.handleDataSetChange(set));
    this.subscriptions.add(
      this.form.controls.realm.valueChanges,
      (realm: string) =>
        this.setCharactersOnRealm(realm));

    this.subscriptions.add(
      this.form.controls.character.valueChanges,
      (name: string) =>
        this.setTableData(this.form.value.realm, name));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


  private handleDataSetChange(index: number) {
    this.selectedSet = this.dataSets[index];
    this.realms.length = 0;
    Object.keys(this.selectedSet.data)
      .forEach(realm =>
        this.realms.push(realm));
    console.log('realms', this.realms, this.selectedSet);

    if (ObjectUtil.isNullOrUndefined(this.form.value.realm)) {
      this.form.controls.realm.setValue(this.realms[0]);
    } else {
      this.setCharactersOnRealm(this.form.value.realm);
    }
  }

  private setCharactersOnRealm(realm: string) {
    if (this.selectedSet.hasCharacters) {
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

      if (this.form.value.character) {
        this.setTableData(realm, this.form.value.character);
      } else {
        this.form.controls.character.setValue(this.characters[0]);
      }
    } else {
      this.setTableData(realm);
    }
  }

  importFromFile(fileEvent): void {
    console.log('File', fileEvent);
    const files = fileEvent.target.files;
    const reader = new FileReader();
    reader.onload = () => {
      const data = new TsmLuaUtil().convertList(reader.result);
      this.dataSets.forEach(set =>
        set.data = data[set.name]);

      this.handleDataSetChange(0);
      console.log(data);
    };
    reader.readAsText(files[0]);
  }

  private setTableData(realm: string, character?: string) {
    console.log(this.dataSets, this.selectedSet, realm, character);
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

    console.log('table', this.table);
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
}
