import {AfterContentInit, AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {AuctionItem} from '../../models/auction-item.model';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Filters} from '../../../../utils/filtering';
import {GameBuild} from '../../../../utils/game-build.util';
import {itemQualities} from '../../../../models/item/disenchanting-list';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {SharedService} from '../../../../services/shared.service';
import {AuctionsService} from '../../../../services/auctions.service';
import {ItemClassService} from '../../../item/service/item-class.service';
import {ItemClass} from '../../../item/models/item-class.model';
import {ColumnDescription} from '../../../table/models/column-description';

@Component({
  selector: 'wah-auctions',
  templateUrl: './auctions.component.html',
  styleUrls: ['./auctions.component.scss']
})
export class AuctionsComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentInit {
  form: FormGroup;
  itemClasses: ItemClass[] = ItemClassService.getForLocale();
  itemQualities = itemQualities;

  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'itemLevel', title: 'iLvL', dataType: 'number', hideOnMobile: true},
    {key: 'quantityTotal', title: 'Stock', dataType: 'number', hideOnMobile: true},
    {
      key: 'quantityTrend24', title: '24H stock trend', dataType: 'number', options: {
        tooltip: 'Avg quantity trend per hour, the past ~24 hours'
      }, hideOnMobile: true
    },
    {
      key: 'quantityTrend', title: 'Stock trend', dataType: 'number', options: {
        tooltip: 'Avg quantity trend per day, the past 7 days'
      }, hideOnMobile: true
    },
    {key: 'buyout', title: 'Buyout', dataType: 'gold'},
    {
      key: 'priceTrend24', title: '24H trend', dataType: 'gold', options: {
        tooltip: 'Price trend per hour, the past ~24 hours'
      }
    },
    {
      key: 'priceTrend', title: '7 Day trend', dataType: 'gold', options: {
        tooltip: 'Price trend per day, the past 7 days'
      }
    },
    {key: 'bid', title: 'Bid', dataType: 'gold', hideOnMobile: true},
    {
      key: 'mktPrice', title: 'Market value', dataType: 'gold', options: {
        tooltip: 'The avg price the past 7 days, per day'
      }, hideOnMobile: true
    },
    {
      key: undefined, title: 'In cart', dataType: 'cart-item-count', options: {
        idName: 'id',
      }
    },
    // {key: 'regionSaleAvg', title: 'Avg sale price', dataType: 'gold', hideOnMobile: true}
    // {key: 'avgDailySold', title: 'Daily sold', dataType: 'number', hideOnMobile: true}
    // {key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent', hideOnMobile: true}
  ];
  tableData = [];
  expansions = GameBuild.expansionMap;
  delayFilter = false;
  private subs = new SubscriptionManager();

  constructor(private formBuilder: FormBuilder, private auctionService: AuctionsService) {
    SharedService.events.title.next('Auctions');
    const filter = JSON.parse(localStorage.getItem('query_auctions')) || undefined;

    this.form = formBuilder.group({
      name: filter && filter.name ? filter.name : '',
      itemClass: filter ? filter.itemClass : '-1',
      itemSubClass: filter ? filter.itemSubClass : '-1',
      mktPrice: filter && filter.mktPrice !== null ? parseFloat(filter.mktPrice) : 0,
      saleRate: filter && filter.saleRate !== null ? parseFloat(filter.saleRate) : 0,
      avgDailySold: filter && filter.avgDailySold !== null ? parseFloat(filter.avgDailySold) : 0,
      onlyVendorSellable: filter && filter.onlyVendorSellable !== null ? filter.onlyVendorSellable : false,
      expansion: filter && filter.expansion ? filter.expansion : null,
      minItemQuality: filter && filter.minItemQuality ? filter.minItemQuality : null,
      minItemLevel: filter && filter.minItemLevel ? filter.minItemLevel : null
    });
  }

  ngOnInit() {
  }

  async ngAfterViewInit() {
    this.subs.add(
      this.form.valueChanges,
      (() => {
        localStorage['query_auctions'] = JSON.stringify(this.form.value);

        if (!this.delayFilter) {
          this.delayFilter = true;
          setTimeout(() => {
            this.filterAuctions();
            this.delayFilter = false;
          }, 100);
        }
      }));
    this.subs.add(
      this.auctionService.mapped,
      () => {
        this.filterAuctions();
      });
  }

  async ngAfterContentInit() {
    await this.filterAuctions();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  async filterAuctions(changes = this.form.value) {

    this.tableData = this.auctionService.list.value
      .filter(i => this.isMatch(i, changes))
      .map(i => {
        return {
          ...SharedService.pets[i.petSpeciesId],
          ...i,
          quantityTrend: i.stats ? i.stats.past7Days.quantity.trend : 0,
          quantityTrend24: i.stats ? i.stats.past24Hours.quantity.trend : 0,
          priceTrend: i.stats ? i.stats.past7Days.price.trend : 0,
          priceTrend24: i.stats ? i.stats.past24Hours.price.trend : 0,
        };
      });
  }

  isMatch(auctionItem: AuctionItem, changes): boolean {
    return Filters.isNameMatch(auctionItem.itemID, this.form.getRawValue().name, auctionItem.petSpeciesId, auctionItem.id) &&
      Filters.isItemClassMatch(
        auctionItem.itemID, this.form.getRawValue().itemClass, changes.itemSubClass) &&
      Filters.isSaleRateMatch(auctionItem.itemID, changes.saleRate) &&
      Filters.isBelowMarketValue(auctionItem.itemID, changes.mktPrice) &&
      Filters.isDailySoldMatch(auctionItem.itemID, changes.avgDailySold) &&
      Filters.isBelowSellToVendorPrice(auctionItem.itemID, changes.onlyVendorSellable) &&
      Filters.isItemAboveQuality(auctionItem.itemID, changes.minItemQuality) &&
      Filters.isAboveItemLevel(auctionItem.itemID, changes.minItemLevel) &&
      Filters.isExpansionMatch(auctionItem.itemID, changes.expansion);
  }
}
