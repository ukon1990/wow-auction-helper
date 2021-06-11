import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuctionsService} from '../../../../services/auctions.service';
import {OrganizedAuctionResult} from '../../utils/auction.util';
import {RealmService} from '../../../../services/realm.service';
import {RealmStatus} from '../../../../models/realm-status.model';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ColumnDescription} from '../../../table/models/column-description';
import {AuctionItem} from '../../models/auction-item.model';
import {AuctionHouseStatus} from '../../models/auction-house-status.model';
import {ItemClass} from '../../../item/models/item-class.model';
import {ItemClassService} from '../../../item/service/item-class.service';
import { itemQualities } from '../../../../models/item/disenchanting-list';
import {Filters} from '../../../../utils/filtering';
import {Modifiers} from '../../models/auction.model';
import {GameBuild} from '../../../../utils/game-build.util';

interface TableDataModel {
  id: string;
  itemID: number;
  name: string;
  itemLevel: number;
  bonusIds: number[];
  modifiers: Modifiers[];
  petSpeciesId?: number;
  petLevel?: number;
  petQualityId?: number;
  quantityTotal: number;
  otherQuantityTotal: number;
  buyout: number;
  otherBuyout: number;
  buyoutDifference: number;
  buyoutDifferencePercent: number;
}

@Component({
  selector: 'wah-auction-comparison',
  templateUrl: './auction-comparison.component.html',
})
export class AuctionComparisonComponent implements OnInit, OnDestroy {
  selections: {[key: string]: RealmStatus} = {
    comparisonSetOne: undefined,
    comparisonSetTwo: undefined,
  };
  expansions =  GameBuild.expansionMap;
  comparisonSetOne: OrganizedAuctionResult;
  comparisonSetTwo: OrganizedAuctionResult;
  isComparisonOneLoading: boolean;
  isComparisonTwoLoading: boolean;
  tableData: TableDataModel[] = [];
  allData: TableDataModel[] = [];
  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'itemLevel', title: 'iLvL', dataType: 'number', hideOnMobile: true},
    {key: 'quantityTotal', title: 'Stock', dataType: 'number', hideOnMobile: true},
    {key: 'buyout', title: 'Buyout', dataType: 'gold'},
    {key: 'buyoutDifference', title: 'Difference', dataType: 'gold'},
    {key: 'buyoutDifferencePercent', title: 'Difference %', dataType: 'percent'},
    {key: 'otherBuyout', title: 'Other buyout', dataType: 'gold'},
    {key: 'otherQuantityTotal', title: 'Other Stock', dataType: 'number', hideOnMobile: true},
  ];
  form: FormGroup;
  subs: Subscription = new Subscription();
  itemClasses: ItemClass[] = ItemClassService.getForLocale();
  itemQualities = itemQualities;
  delayFilter = false;

  constructor(
    private auctionService: AuctionsService,
    private realmService: RealmService,
    private formBuilder: FormBuilder
  ) {
    const filter = JSON.parse(localStorage.getItem('query_compare_auctions')) || undefined;
    this.form = formBuilder.group({
      name: filter && filter.name ? filter.name : '',
      itemClass: filter ? filter.itemClass : '-1',
      itemSubClass: filter ? filter.itemSubClass : '-1',
      saleRate: filter && filter.saleRate !== null ? parseFloat(filter.saleRate) : null,
      avgDailySold: filter && filter.avgDailySold !== null ? parseFloat(filter.avgDailySold) : null,
      expansion: filter && filter.expansion ? filter.expansion : null,
      minItemQuality: filter && filter.minItemQuality ? filter.minItemQuality : null,
      minItemLevel: filter && filter.minItemLevel ? filter.minItemLevel : null,
      buyoutDifference: filter && filter.buyoutDifference ? filter.buyoutDifference : null,
      buyoutDifferencePercent: filter && filter.buyoutDifferencePercent ? filter.buyoutDifferencePercent : null,
    });
  }

  ngOnInit(): void {
    this.selections.comparisonSetOne = this.realmService.events.realmStatus.value;
    this.subs.add(this.form.valueChanges.subscribe((filter) => {
      localStorage['query_compare_auctions'] = JSON.stringify(filter);
      if (!this.delayFilter) {
        this.delayFilter = true;
        setTimeout(async () => {
          this.filterAuctions(filter);
          this.delayFilter = false;
        }, 100);
      }
    }));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  filterAuctions(changes = this.form.value) {
    this.tableData = this.allData
      .filter(i => this.isMatch(i, changes));
  }

  private isMatch(item: TableDataModel, changes): boolean {
    return Filters.isNameMatch(item.itemID, this.form.getRawValue().name, item.petSpeciesId, item.id) &&
      Filters.isItemClassMatch(
        item.itemID, this.form.getRawValue().itemClass, changes.itemSubClass) &&
      Filters.isSaleRateMatch(item.itemID, changes.saleRate) &&
      Filters.isBelowMarketValue(item.itemID, changes.mktPrice) &&
      Filters.isDailySoldMatch(item.itemID, changes.avgDailySold) &&
      Filters.isBelowSellToVendorPrice(item.itemID, changes.onlyVendorSellable) &&
      Filters.isItemAboveQuality(item.itemID, changes.minItemQuality) &&
      Filters.isAboveItemLevel(item.itemID, changes.minItemLevel) &&
      Filters.isExpansionMatch(item.itemID, changes.expansion) &&
      (!changes.buyoutDifference || item.buyoutDifference >= changes.buyoutDifference) &&
      (!changes.buyoutDifferencePercent || item.buyoutDifferencePercent >= changes.buyoutDifferencePercent / 100);
  }

  handleRealmSelection ({realmStatus, ahTypeId}: {ahTypeId: number, realmStatus: AuctionHouseStatus}, saveToParam: 'comparisonSetOne' | 'comparisonSetTwo') {
    console.log(realmStatus);
    this.selections[saveToParam] = realmStatus;
    this.setIsLoading(saveToParam, true);
    this.auctionService.getAuctions(realmStatus, true, ahTypeId)
      .then(result => {
        this[saveToParam] = result;
        if (this.comparisonSetOne && this.comparisonSetTwo) {
          this.compareDatasets();
        }
        this.setIsLoading(saveToParam, false);
      })
      .catch(error => {
        console.error(error);
        this.setIsLoading(saveToParam, false);
      });
  }

  private setIsLoading(saveToParam: 'comparisonSetOne' | 'comparisonSetTwo', state: boolean) {
    switch (saveToParam) {
      case 'comparisonSetOne':
        this.isComparisonOneLoading = state;
        break;
      case 'comparisonSetTwo':
        this.isComparisonTwoLoading = state;
        break;
    }
  }

  private compareDatasets() {
    const list = [];
    const map = new Map<string, TableDataModel>();
    this.comparisonSetOne.list.forEach(item => {
      if (!item.buyout) {
        return;
      }
      const entry = this.getAndAddEntryToMapIfNotExists(list, map, item);
      entry.buyout = item.buyout;
      entry.quantityTotal = item.quantityTotal;
    });
    this.comparisonSetTwo.list.forEach(item => {
      if (!item.buyout) {
        return;
      }
      const entry = this.getAndAddEntryToMapIfNotExists(list, map, item);
      entry.otherBuyout = item.buyout;
      entry.otherQuantityTotal = item.quantityTotal;
    });
    list.forEach(item => {
      if (item.buyout && !item.otherBuyout) {
        item.buyoutDifferencePercent = 1;
        item.buyoutDifference = item.buyout;
      } else if (item.buyout && !item.otherBuyout) {
        item.buyoutDifferencePercent = -1;
        item.buyoutDifference = item.otherBuyout * -1;
      } else {
        item.buyoutDifference = item.buyout - item.otherBuyout;
        item.buyoutDifferencePercent = item.buyout / item.otherBuyout;
      }
    });
    this.allData = list;
    this.filterAuctions();
  }

  private getAndAddEntryToMapIfNotExists(list: any[], map: Map<string, TableDataModel>, item: AuctionItem): TableDataModel {
    let value: TableDataModel = map.get(item.id);
    if (!map.has(item.id)) {
      value = {
        id: item.id,
        itemID: item.itemID,
        name: item.name,
        itemLevel: item.itemLevel,
        bonusIds: item.bonusIds,
        modifiers: item.modifiers,
        petSpeciesId: item.petSpeciesId,
        petLevel: item.petLevel,
        petQualityId: item.petQualityId,
        quantityTotal: 0,
        otherQuantityTotal: 0,
        buyout: 0,
        otherBuyout: 0,
        buyoutDifference: 0,
        buyoutDifferencePercent: 0,
      };
      map.set(item.id, value);
      list.push(value);
    }
    return value;
  }
}
