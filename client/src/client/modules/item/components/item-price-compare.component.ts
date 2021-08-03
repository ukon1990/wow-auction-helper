import {Component, Input, OnInit} from '@angular/core';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {Item} from '../../../models/item/item';
import {ItemService} from '../../../services/item.service';
import {RealmService} from '../../../services/realm.service';
import {SeriesColumnOptions, XAxisOptions, YAxisOptions} from 'highcharts';
import {ThemeUtil} from '../../core/utils/theme.util';
import {ItemPriceCompareEntry} from '../../../../../../api/src/auction/models/item-price-compare-entry.model';
import {ErrorReport} from '../../../utils/error-report.util';
import {ColumnDescription} from '../../table/models/column-description';

@Component({
  selector: 'wah-item-price-compare',
  template: `
      <mat-tab-group *ngIf="!isLoading; else loadingTemplate">
          <mat-tab label="Chart">
              <wah-highcharts
                      [xAxis]="xAxis"
                      [series]="[quantityChart, realmDataChart]"
                      [(update)]="updateChart"
                      [autoSetMinMax]="false"
              >
              </wah-highcharts>
          </mat-tab>
          <mat-tab label="Table">
              <wah-data-table
                filterParameter="names"
                [columns]="columns"
                [data]="data"
              >
              </wah-data-table>
          </mat-tab>
      </mat-tab-group>

      <ng-template #loadingTemplate>
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          Loading price data for the realms in your region. This might take a couple seconds.
      </ng-template>
  `
})
export class ItemPriceCompareComponent implements OnInit {
  @Input() item: Item;
  @Input() auctionItem: AuctionItem;

  columns: ColumnDescription[] = [
    {key: 'names', title: 'Realms', dataType: 'text'},
    {key: 'price', title: 'Price', dataType: 'gold'},
    {key: 'quantity', title: 'Quantity', dataType: 'number'},
    {key: 'diff', title: '% difference', dataType: 'percent'},
  ];
  data: any[] = [];
  theme = ThemeUtil.current;
  updateChart = false;
  realmDataChart: SeriesColumnOptions = {
    name: 'Prices',
    data: [],
    color: this.theme.accentColorCode,
    type: 'column',
  };
  quantityChart: SeriesColumnOptions = {
    name: 'Quantity',
    data: [],
    color: this.theme.primaryColorCode,
    yAxis: 1,
    type: 'column',
  };
  xAxis: XAxisOptions = {
    categories: [],
    crosshair: true
  };
  isLoading = false;

  constructor(private service: ItemService, private realmService: RealmService) { }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.service.getComparablePrices(
      {
        itemId: this.item.id,
        petSpeciesId: this.auctionItem.petSpeciesId || -1,
        bonusIds: this.auctionItem.bonusIds
      },
      this.realmService.events.realmStatus.value,
      this.realmService.events.list.value,
    )
      .then((data: ItemPriceCompareEntry[]) => {
        this.resetValues();
        const realmMap = new Map<number, string[]>();
        const currentHouse = this.realmService.events.realmStatus.value;
        this.realmService.events.list.value.forEach(realm => {
          if (!realmMap.get(realm.ahId)) {
            realmMap.set(realm.ahId, []);
          }
          realmMap.get(realm.ahId).push(realm.name);
        });
        let currentRealmValue: ItemPriceCompareEntry;
        let currentIndex = 0;
        data.sort((a, b) => b.price - a.price)
          .filter(entry => {
            if (entry.ahId === currentHouse.id) {
              currentRealmValue = entry;
            }
            return entry.price > 0;
          })
          .forEach((entry, index) => {
            if (entry.ahId === currentHouse.id) {
              currentIndex = index;
            }
            this.populateChartWithEntry(realmMap, entry, currentRealmValue);
          });
        this.xAxis.plotLines = [{
          color: this.theme.accentColorCode,
          width: 2,
          value: currentIndex
        }];
        this.reSpreadIntoChartSeries();
      })
      .catch(error => {
        ErrorReport.sendHttpError(error);
        this.isLoading = false;
      });
  }

  private reSpreadIntoChartSeries() {
    this.realmDataChart = {
      ...this.realmDataChart
    };
    this.quantityChart = {
      ...this.quantityChart
    };
    this.updateChart = !this.updateChart;
    this.isLoading = false;
  }

  private populateChartWithEntry(realmMap: Map<number, string[]>, entry: ItemPriceCompareEntry, currentRealmValue: ItemPriceCompareEntry) {
    const names = realmMap.get(entry.ahId).join(', ');
    this.xAxis.categories.push(names);
    this.realmDataChart.data.push([names, entry.price]);
    this.quantityChart.data.push([names, entry.quantity]);
    const diff = currentRealmValue ? entry.price / currentRealmValue.price : 0;
    this.data.push({
      ...entry,
      names,
      diff,
    });
  }

  private resetValues() {
    this.xAxis.categories.length = 0;
    this.realmDataChart.data.length = 0;
    this.quantityChart.data.length = 0;
    this.data.length = 0;
  }
}
