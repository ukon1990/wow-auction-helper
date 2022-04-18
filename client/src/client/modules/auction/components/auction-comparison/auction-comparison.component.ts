import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuctionsService} from '../../../../services/auctions.service';
import {OrganizedAuctionResult} from '../../utils/auction.util';
import {RealmService} from '../../../../services/realm.service';
import {RealmStatus} from '@shared/models';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ColumnDescription, itemQualities} from '@shared/models';
import {AuctionItem} from '../../models/auction-item.model';
import {AuctionHouseStatus} from '../../models/auction-house-status.model';
import {ItemClass} from '../../../item/models/item-class.model';
import {ItemClassService} from '../../../item/service/item-class.service';
import {Filters} from '../../../../utils/filtering';
import {GameBuild} from '@shared/utils';
import {ComparisonTableDataModel} from '../../models/comparison-table-data.model';
import {ComparisonVariableEnum} from '../../enums/comparison-variable.enum';


@Component({
  selector: 'wah-auction-comparison',
  templateUrl: './auction-comparison.component.html',
})
export class AuctionComparisonComponent implements OnInit, OnDestroy {
  ComparisonVariableEnum = ComparisonVariableEnum;
  selections: {[key: string]: RealmStatus} = {
    comparisonSetOne: undefined,
    comparisonSetTwo: undefined,
  };
  expansions =  GameBuild.expansionMap;
  comparisonSetOne: OrganizedAuctionResult;
  comparisonSetTwo: OrganizedAuctionResult;
  isComparisonOneLoading: boolean;
  isComparisonTwoLoading: boolean;
  tableData: ComparisonTableDataModel[] = [];
  allData: ComparisonTableDataModel[] = [];
  private currentBuyoutColumn: ColumnDescription = {
    key: 'buyout', title: 'Buyout', dataType: 'gold'};
  private currentQuantityTotalColumn: ColumnDescription = {
    key: 'quantityTotal', title: 'Stock', dataType: 'number', hideOnMobile: true};
  private otherBuyoutColumn: ColumnDescription = {
    key: 'otherBuyout', title: 'Other buyout', dataType: 'gold'};
  private otherQuantityTotalColumn: ColumnDescription = {
    key: 'otherQuantityTotal', title: 'Other Stock', dataType: 'number', hideOnMobile: true};
  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'itemLevel', title: 'iLvL', dataType: 'number', hideOnMobile: true},
    this.currentQuantityTotalColumn,
    this.currentBuyoutColumn,
    {key: 'buyoutDifference', title: 'Difference', dataType: 'gold'},
    {key: 'buyoutDifferencePercent', title: 'Difference %', dataType: 'percent'},
    this.otherBuyoutColumn,
    this.otherQuantityTotalColumn,
  ];
  form: FormGroup;
  subs: Subscription = new Subscription();
  itemClasses: ItemClass[] = ItemClassService.classes.value;
  itemQualities = itemQualities;
  delayFilter = false;

  constructor(
    private auctionService: AuctionsService,
    private realmService: RealmService,
    private formBuilder: FormBuilder
  ) {

    this.subs.add(ItemClassService.classes.subscribe(
      classes => this.itemClasses = classes));

    const filter = JSON.parse(localStorage.getItem('query_compare_auctions')) || undefined;
    this.form = formBuilder.group({
      name: filter && filter.name ? filter.name : '',
      itemClass: filter ? filter.itemClass : '-1',
      itemSubClass: filter ? filter.itemSubClass : '-1',
      saleRate: filter && filter.saleRate !== null ? parseFloat(filter.saleRate) : null,
      avgDailySold: filter && filter.avgDailySold !== null ? parseFloat(filter.avgDailySold) : null,
      expansion: filter && filter.expansion ? filter.expansion : null,
      quantityTotal: filter?.quantityTotal || null,
      otherQuantityTotal: filter?.otherQuantityTotal || null,
      minItemQuality: filter && filter.minItemQuality ? filter.minItemQuality : null,
      minItemLevel: filter && filter.minItemLevel ? filter.minItemLevel : null,
      buyoutDifference: filter && filter.buyoutDifference ? filter.buyoutDifference : null,
      buyoutDifferencePercent: filter && filter.buyoutDifferencePercent ? filter.buyoutDifferencePercent : null,
    });
  }

  ngOnInit(): void {
    this.selections.comparisonSetOne = this.realmService.events.realmStatus.value;


    this.subs.add(this.form.controls.itemClass.valueChanges.subscribe(
      () => this.form.controls.itemSubClass.setValue('-1')));

    this.subs.add(this.form.valueChanges.subscribe((filter) => {
      localStorage['query_compare_auctions'] = JSON.stringify(filter);
      if (!this.delayFilter) {
        this.delayFilter = true;
        setTimeout(async () => {
          this.filterAuctions(this.form.value);
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

  private isMatch(item: ComparisonTableDataModel, changes): boolean {
    return Filters.isNameMatch(item.itemID, this.form.getRawValue().name, item.petSpeciesId, item.id) &&
      Filters.isItemClassMatch(
        item.itemID, this.form.getRawValue().itemClass, changes.itemSubClass) &&
      Filters.isSaleRateMatch(item.itemID, changes.saleRate) &&
      Filters.isBelowMarketValue(item.itemID, changes.mktPrice) &&
      Filters.isQuantityAbove(
        item.id, changes.quantityTotal, this.comparisonSetOne?.map.get(item.id)) &&
      Filters.isQuantityAbove(
        item.id, changes.otherQuantityTotal, this.comparisonSetTwo?.map.get(item.id)) &&
      Filters.isDailySoldMatch(item.itemID, changes.avgDailySold) &&
      Filters.isBelowSellToVendorPrice(item.itemID, changes.onlyVendorSellable) &&
      Filters.isItemAboveQuality(item.itemID, changes.minItemQuality) &&
      Filters.isAboveItemLevel(item.itemID, changes.minItemLevel) &&
      Filters.isExpansionMatch(item.itemID, changes.expansion, this.realmService.isClassic) &&
      (!changes.buyoutDifference || item.buyoutDifference >= changes.buyoutDifference) &&
      (!changes.buyoutDifferencePercent || item.buyoutDifferencePercent >= changes.buyoutDifferencePercent / 100);
  }

  handleRealmSelection (
    {realmStatus, ahTypeId = 0}: {ahTypeId: number, realmStatus: AuctionHouseStatus},
    saveToParam: ComparisonVariableEnum
  ) {
    if (!realmStatus) {
      return;
    }
    this.selections[saveToParam] = realmStatus;
    this.setIsLoading(saveToParam, true);
    this.auctionService.getAuctions(realmStatus, true, ahTypeId)
      .then(result => {
        this[saveToParam] = result;
        switch (saveToParam) {
          case ComparisonVariableEnum.comparisonSetOne:
            this.currentBuyoutColumn.title = `${realmStatus.name} buyout`;
            this.currentQuantityTotalColumn.title = `${realmStatus.name} quantity`;
            break;
          case ComparisonVariableEnum.comparisonSetTwo:
            this.otherBuyoutColumn.title = `${realmStatus.name} buyout`;
            this.otherQuantityTotalColumn.title = `${realmStatus.name} quantity`;
            break;
        }
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

  private setIsLoading(saveToParam: ComparisonVariableEnum, state: boolean) {
    switch (saveToParam) {
      case ComparisonVariableEnum.comparisonSetOne:
        this.isComparisonOneLoading = state;
        break;
      case ComparisonVariableEnum.comparisonSetTwo:
        this.isComparisonTwoLoading = state;
        break;
    }
  }

  private compareDatasets() {
    const list = [];
    const map = new Map<string, ComparisonTableDataModel>();
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

  private getAndAddEntryToMapIfNotExists(
    list: any[],
    map: Map<string, ComparisonTableDataModel>,
    item: AuctionItem
  ): ComparisonTableDataModel {
    let value: ComparisonTableDataModel = map.get(item.id);
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