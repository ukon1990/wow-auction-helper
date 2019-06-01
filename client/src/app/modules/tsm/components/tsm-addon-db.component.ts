import {AfterContentInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {TsmLuaUtil} from '../../../utils/tsm-lua.util';
import {ObjectUtil} from '../../../utils/object.util';
import {SharedService} from '../../../services/shared.service';
import {Report} from '../../../utils/report.util';
import {DatabaseService} from '../../../services/database.service';
import {ErrorReport} from '../../../utils/error-report.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';

@Component({
  selector: 'wah-tsm-addon-db',
  templateUrl: './tsm-addon-db.component.html',
  styleUrls: ['./tsm-addon-db.component.scss']
})
export class TsmAddonDbComponent implements OnInit, OnDestroy, AfterContentInit {
  @Input() importMode: boolean;
  form: FormGroup;
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
  tsmAddonData = SharedService.tsmAddonData;
  selectedSet;
  realms = [];
  characters = [];
  table = {
    columns: [],
    data: []
  };

  subscriptions = new SubscriptionManager();
  lastModified: Date = localStorage['timestamp_tsm_addon_import'] ?
    new Date(localStorage['timestamp_tsm_addon_import']) : undefined;

  constructor(private formBuilder: FormBuilder, private dbService: DatabaseService) {
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

    this.subscriptions.add(
      SharedService.events.tsmDataRestored,
      () => this.ngAfterContentInit());
  }

  ngAfterContentInit(): void {
    const realm = SharedService.realms[SharedService.user.realm];

    if (SharedService.tsmAddonData.characterGuilds) {
      this.setDataSets(SharedService.tsmAddonData);
      this.handleDataSetChange(0);
    }

    if (realm) {
      this.form.controls.realm.setValue(realm.name);
    } else {
      this.subscriptions.add(
        SharedService.events.realms,
        () => this.ngAfterContentInit(),
        {terminateUponEvent: true});
    }
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

    if (ObjectUtil.isNullOrUndefined(this.form.value.realm)) {
      this.form.controls.realm.setValue(this.realms[0]);
    } else {
      this.setCharactersOnRealm(this.form.value.realm);
    }
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
  }

  importFromFile(fileEvent): void {
    try {
      const files = fileEvent.target.files;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new TsmLuaUtil().convertList(reader.result);
          this.setDataSets(data);
          this.lastModified = fileEvent['srcElement']['files'][0].lastModifiedDate;

          this.handleDataSetChange(0);
          this.dbService.addTSMAddonData(reader.result, this.lastModified);
          Report.send('Imported TSM addon data', 'Import');
        } catch (error) {
          ErrorReport.sendError('TsmAddonDbComponent.importFromFile', error);
        }
      };
      reader.readAsText(files[0]);
    } catch (error) {
      ErrorReport.sendError('TsmAddonDbComponent.importFromFile', error);
    }
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

    console.log('Selected table data', this.table);
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
