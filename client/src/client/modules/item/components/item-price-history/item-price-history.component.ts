import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import * as Highcharts from 'highcharts';
import {Chart, SeriesLineOptions, SeriesOptionsType, XAxisOptions} from 'highcharts';
import {Item} from '../../../../models/item/item';
import {ItemService} from '../../../../services/item.service';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {ItemDailyPriceEntry, ItemPriceEntry, ItemPriceEntryResponse} from '../../models/item-price-entry.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ErrorReport} from '../../../../utils/error-report.util';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {NumberUtil} from '../../../util/utils/number.util';
import {AuctionStatsUtil} from '../../../../../../../api/src/auction/utils/auction-stats.util';
import {ItemStats} from '../../../../../../../api/src/auction/models/item-stats.model';
import {ThemeUtil} from '../../../core/utils/theme.util';
import {Theme} from '../../../core/models/theme.model';
import {RealmService} from '../../../../services/realm.service';
import {AuctionItemStat} from '../../../../../../../api/src/auction/models/auction-item-stat.model';
import {Recipe} from '../../../crafting/models/recipe';
import {FormControl, FormGroup} from '@angular/forms';
import {AuctionsService} from '../../../../services/auctions.service';
import {PriceHistoryComponentUtil} from '../../utils/price-history.util';
import {ProspectingAndMillingUtil} from '../../../../utils/prospect-milling.util';
import {SharedService} from '../../../../services/shared.service';
import {Reagent} from '../../../crafting/models/reagent';
import {TimeUtil} from "../../../../../../../api/src/auction/utils/time.util";
import {DateUtil} from "@ukon1990/js-utilities";
import {ColumnDescription} from "../../../table/models/column-description";
import {ProfessionService} from '../../../crafting/services/profession.service';
import {Profession} from '../../../../../../../api/src/profession/model';

@Component({
  selector: 'wah-item-price-history',
  templateUrl: './item-price-history.component.html',
  styleUrls: ['./item-price-history.component.scss']
})
export class ItemPriceHistoryComponent implements OnChanges, AfterViewInit {
  private ahId: number;
  private readonly util: PriceHistoryComponentUtil;

  @Input() item: Item;
  @Input() auctionItem: AuctionItem;
  @Input() isActiveTab = true;
  @Input() dialogId: string;
  theme: Theme = ThemeUtil.current;
  form: FormGroup = new FormGroup({
    recipe: new FormControl(),
    period: new FormGroup({
      start: new FormControl(new TimeUtil().getDateAtNDaysSinceNow(30, true)),
      end: new FormControl(new TimeUtil().getDateAtNDaysSinceNow(-1, true))
    })
  });
  stats: ItemStats;
  statsDaily: ItemStats;
  Highcharts: typeof Highcharts = Highcharts;
  sm = new SubscriptionManager();
  hourlyCostChart: SeriesOptionsType = {
    name: 'Crafting cost',
    data: [],
    color: this.theme.accentColorCode,
    type: 'line',
  };
  hourlyQuantityChart: SeriesOptionsType = {
    name: 'Quantity',
    data: [],
    type: 'line',
    yAxis: 1,
    color: 'hsla(0, 100%, 50%, 0.7)',
  };
  hourlyPriceChart: SeriesOptionsType = {
    name: 'Prices',
    data: [],
    color: 'rgba(0, 255, 22, 0.7)',
    type: 'line',
  };
  hourlyChart: SeriesOptionsType[] = [
    this.hourlyQuantityChart,
    this.hourlyPriceChart,
    this.hourlyCostChart
  ];
  dailyChartPrice: SeriesOptionsType[] = [
    {
      name: 'Price range',
      data: [],
      type: 'arearange',
      lineWidth: 0,
      linkedTo: ':previous',
      color: 'rgba(0, 255, 22, 0.7)',
      fillOpacity: 0.3,
      zIndex: 0,
      marker: {
        enabled: false
      }
    }, {
      name: 'Avg price',
      data: [],
      type: 'line',
      zIndex: 1,
      color: 'rgba(255, 144, 0, 0.8)',
      marker: {
        fillColor: 'white',
        lineWidth: 2,
        lineColor: 'rgba(255, 144, 0, 0.8)'
      }
    }
  ];
  dailyChartQuantity: SeriesOptionsType[] = [
    {
      name: 'Quantity range',
      data: [],
      type: 'arearange',
      lineWidth: 0,
      linkedTo: ':previous',
      color: 'hsla(0, 100%, 50%, 0.7)',
      fillOpacity: 0.3,
      zIndex: 0,
      yAxis: 1,
      marker: {
        enabled: false
      }
    }, {
      name: 'Quantity avg',
      data: [],
      type: 'line',
      zIndex: 1,
      yAxis: 1,
      color: 'rgba(255, 144, 0, 0.8)',
      marker: {
        fillColor: 'red',
        lineWidth: 2,
        lineColor: 'hsla(0,100%,50%,0.7)'
      }
    }
  ];
  dailyChartCrafting: SeriesOptionsType[] = [
    /*
    TODO: Decide on if I want the range or not. Seems a bit cluttered with three ranges
    {
      name: 'Crafting cost',
      data: [],
      type: 'arearange',
      lineWidth: 0,
      linkedTo: ':previous',
      color: this.theme.primaryColorCode,
      fillOpacity: 0.3,
      zIndex: 0,
      marker: {
        enabled: false
      }
    }, */{
      name: 'Avg cost',
      data: [],
      type: 'line',
      zIndex: 1,
      color: this.theme.accentColorCode,
      marker: {
        fillColor: 'red',
        lineWidth: 2,
        lineColor: this.theme.accentColorCode
      }
    }
  ];
  dailyChart: SeriesOptionsType[] = [
    ...this.dailyChartPrice,
    ...this.dailyChartQuantity
  ];
  xAxis: XAxisOptions;
  priceHistory: ItemPriceEntryResponse = {
    hourly: [],
    daily: []
  };
  craftingCostHistory: ItemPriceEntryResponse;
  fourteenDayByHourTable = {
    columns: [
      {key: 'timestamp', title: 'Time', dataType: 'date'},
      {key: 'min', title: 'Price', dataType: 'gold'}
    ],
    data: []
  };
  groupedByDateTable = {
    columns: [
      {key: 'date', title: 'Date', dataType: 'string'},
      {key: 'min', title: 'Lowest min price', dataType: 'gold'},
      {key: 'minQuantity', title: 'Min quantity', dataType: 'number'},
      {key: 'avg', title: 'Avg min price', dataType: 'gold'},
      {key: 'avgQuantity', title: 'Avg quantity', dataType: 'number'},
      {key: 'max', title: 'Highest min price', dataType: 'gold'},
      {key: 'maxQuantity', title: 'Max quantity', dataType: 'number'}
    ],
    data: []
  };
  isLoading = true;
  updateDailyChart: any;
  isInitiated: boolean;
  reagents: Reagent[];
  locale = localStorage['locale'].split('-')[0];
  statsMap: {
    columns: ColumnDescription[],
    prices: unknown[],
    roi: unknown[]
  };
  professions: {[key: string]: Profession} = {};

  constructor(
    private service: ItemService,
    private realmService: RealmService,
    private auctionService: AuctionsService,
    private professionService: ProfessionService,
  ) {
    this.util = new PriceHistoryComponentUtil(auctionService);

    this.ahId = realmService.events.realmStatus.value ? realmService.events.realmStatus.value.id : undefined;
    this.sm.add(this.form.controls.period.valueChanges, (period) =>
      this.setHeatTable(period));
    this.sm.add(this.professionService.listWithRecipes, (professions: Profession[]) => {
      professions.forEach(profession => {
        this.professions[profession.id] = profession;
      });
    });
  }

  ngOnChanges({item, auctionItem, isActiveTab}: SimpleChanges) {
    if (this.isInitiated && auctionItem && auctionItem.currentValue) {
      // this.loadData(auctionItem.currentValue);
    }

    if (this.isInitiated && !this.isLoading && isActiveTab && isActiveTab.currentValue) {
      this.isInitiated = false;
      this.ngAfterViewInit();
    }
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit');
    const firstRecipe: Recipe = this.auctionItem && this.auctionItem.source && this.auctionItem.source.recipe.all ?
      this.auctionItem.source.recipe.all.sort((a, b) => b.roi - a.roi)[0] : undefined;
    const id = this.auctionItem.itemID;
    if (firstRecipe && !ProspectingAndMillingUtil.prospectingSourceMap.get(id) && !ProspectingAndMillingUtil.millsSourceMap.get(id)) {
      const subId = 'recipeSubscription';
      this.form.controls.recipe.setValue(firstRecipe);

      if (!this.sm.getById(subId)) {
        this.sm.add(this.form.valueChanges, ({recipe}) => {
          this.isLoading = true;
          this.loadCraftingCost(recipe as Recipe)
            .catch(console.error)
            .finally(() => this.isLoading = false);
        }, {id: subId});
      }
    } else {
      this.hourlyChart = [...this.hourlyChart.slice(0, 2)];
      this.dailyChart = [...this.dailyChart.slice(0, 4)];
    }
    this.loadData();
    setTimeout(() =>
        this.isInitiated = true,
      250);
  }

  private loadCraftingCost(recipe: Recipe = this.form.value.recipe): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!recipe) {
        this.hourlyCostChart['data'] = [];
        this.dailyChartCrafting.forEach( entry => entry['data'] = []);
        this.craftingCostHistory = undefined;
        resolve();
        return;
      }
      this.reagents = recipe.reagents.map(reagent => ({
        ...reagent,
        quantity: reagent.quantity / recipe.minCount,
        name: this.auctionService.getById(reagent.id) ? this.auctionService.getById(reagent.id).name : '' + reagent.id,
      }));
      this.service.getPriceHistory(this.getReagentsForRecipe(recipe))
        .then(result => {
          this.handleRecipeReagentResult(result);
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  }

  private handleRecipeReagentResult(result?: Map<string, ItemPriceEntryResponse>, recipe: Recipe = this.form.value.recipe) {
    this.hourlyCostChart['data'] = [];
    this.dailyChartCrafting.forEach( entry => entry['data'] = []);
    this.craftingCostHistory = undefined;
    try {
      if (result && recipe && recipe.reagents) {
        const groupedValues = this.util.extractGroupedValuesFromReagentHistory(recipe, result);
        this.hourlyChart = [
          this.hourlyQuantityChart,
          this.hourlyPriceChart,
          this.hourlyCostChart
        ];
        const {hourly, daily} = this.util.getChartDataForItemPriceHistoryForReagents(groupedValues);
        this.dailyChart = [
          ...this.dailyChartPrice,
          ...this.dailyChartQuantity,
          ...this.dailyChartCrafting,
        ];
        this.hourlyCostChart['data'] = hourly;
        this.dailyChartCrafting[0]['data'] = daily;
        this.craftingCostHistory = groupedValues;
      }
    } catch (error) {
      ErrorReport.sendError('ItemPriceHistoryComponent.loadCraftingCost', error);
    }
  }

  private getReagentsForRecipe(recipe: Recipe = this.form.value.recipe) {
    if (!recipe) {
      return [];
    }
    return recipe.reagents.map(reagent => ({
      ahId: this.ahId, itemId: reagent.id, petSpeciesId: -1, bonusIds: undefined
    }));
  }

  private loadData(auctionItem: AuctionItem = this.auctionItem) {
    this.isLoading = true;
    this.reagents = [];
    const reagents = this.getReagentsForRecipe();
    this.service.getPriceHistory([{
      ahId: this.ahId,
      itemId: this.item.id,
      petSpeciesId: auctionItem.petSpeciesId || -1,
      bonusIds: auctionItem.bonusIds
    }, ...reagents])
      .then(async (history) => {
        const {itemID, petSpeciesId = -1, bonusIds} = auctionItem;
        this.priceHistory = history.get(`${itemID}-${petSpeciesId}-${AuctionItemStat.bonusIdRaw(bonusIds)}`);
        await this.setAuctionAndDataset(history);
        this.stats = AuctionStatsUtil.processDaysForHourlyPriceData(this.priceHistory.hourly);
        this.statsDaily = AuctionStatsUtil.processDaysForDailyPriceData(this.priceHistory.daily);
        this.isLoading = false;
        try {
        this.setHeatTable();
        } catch (error) {
          console.error('getDailyHeatmap error', error);
        }
      })
      .catch(async (error) => {
        await this.setAuctionAndDataset();
        this.isLoading = false;
        this.priceHistory = {
          daily: [],
          hourly: []
        };
        this.priceHistory.hourly = [];
        ErrorReport.sendHttpError(error);
      });
  }

  private setHeatTable({start, end} = this.form.value.period): void {
    this.statsMap = this.util.getDailyHeatmap(
      (this.dailyChart[1] as SeriesLineOptions).data as number[][],
      this.dailyChartCrafting[0] ? (this.dailyChartCrafting[0] as SeriesLineOptions).data as number[][] : undefined,
      start,
      end
    );
  }

  private async setAuctionAndDataset(history?: Map<string, ItemPriceEntryResponse>) {
    if (this.priceHistory) {
      if (this.priceHistory.hourly && this.priceHistory.hourly.length) {
        this.resetSeriesData(this.hourlyChart);
        this.processHourlyData();
      }
      if (this.priceHistory.daily && this.priceHistory.daily.length) {
        this.resetSeriesData(this.dailyChart);
        this.processDailyData();
      }
      this.handleRecipeReagentResult(history);
      this.updateDailyChart = Math.random();
    }
  }

  private processDailyData() {
    this.priceHistory.daily = this.priceHistory.daily.sort((a, b) =>
      a.timestamp - b.timestamp);
    this.priceHistory.daily.forEach((entry) => {
      this.calculateDailyValues(entry);
    });
    this.groupedByDateTable.data.sort((a, b) =>
      b.timestamp - a.timestamp);
    const format = '%e. %b %y';
    this.xAxis = {
      type: 'datetime',
      labels: {
        format: '{value}',
        formatter: ({value}) => Highcharts.dateFormat(format, +value),
      },
      title: {
        text: null
      }
    };
  }

  private processHourlyData() {
    this.priceHistory.hourly = this.priceHistory.hourly.sort((a, b) =>
      a.timestamp - b.timestamp);
    const dates = [];
    this.priceHistory.hourly.forEach((entry) => {
      const date = new Date(entry.timestamp);
      this.calculateHourlyValues(entry.min, entry, date);
    });
    this.populateDailyChartData(dates);
    this.fourteenDayByHourTable.data.sort((a, b) =>
      b.timestamp - a.timestamp);
  }

  private populateDailyChartData(dates: any[]) {
    this.groupedByDateTable.data.length = 0;
    this.dailyChart.forEach(series => series['data'].length = 0);

    dates.forEach(date => this.calculateDailyValues(date));
  }


  private calculateHourlyValues(minGold: number, entry: ItemPriceEntry, date: Date) {
    this.fourteenDayByHourTable.data.push(entry);
    this.hourlyChart[0]['data'].push([+date, entry.quantity]);
    this.hourlyChart[1]['data'].push([+date, minGold]);
  }

  private calculateDailyValues(entry) {
    this.groupedByDateTable.data.push(entry);

    const date = new Date(entry).toLocaleDateString();
    this.dailyChart[0]['data'].push([entry.timestamp, entry.min, entry.max]);
    this.dailyChart[1]['data'].push([entry.timestamp, entry.avg]);
    this.dailyChart[2]['data'].push([entry.timestamp, entry.minQuantity, entry.maxQuantity]);
    this.dailyChart[3]['data'].push([entry.timestamp, entry.avgQuantity]);
  }

  private resetSeriesData(series: SeriesOptionsType[]): void {
    series.forEach(s => {
      s['data'] = [];
    });
  }

  tooltipCallbackDaily(items, data): string {
    const {index, datasetIndex} = items;
    const dataset = data.datasets[datasetIndex];
    if (datasetIndex > 2) {
      return dataset.label + ': ' +
        NumberUtil.format(dataset.data[index]);
    }
    return dataset.label + ': ' +
      new GoldPipe().transform(dataset.data[index] * 10000);
  }

  tooltipCallbackHourly(items, data): string {
    const {index, datasetIndex} = items;
    const dataset = data.datasets[datasetIndex];
    if (datasetIndex === 1) {
      return dataset.label + ': ' +
        NumberUtil.format(data.datasets[datasetIndex].data[index]);
    }
    return dataset.label + ': ' +
      new GoldPipe().transform(data.datasets[datasetIndex].data[index] * 10000);
  }


  setSelectedItem(id: number): void {
    SharedService.events.detailSelection.emit(
      ItemService.mapped.value.get(id));
  }

  setChartInstance(chart: Chart) {
    /* I leave this be for now, in case I want to add this back later.

    const start = +new Date(+new Date() - 1000 * 60 * 60 * 24 * 90);
    const end = +new Date();
    chart.xAxis[0].setExtremes(start, end, true);
    chart.showResetZoom();
    */
  }
}
