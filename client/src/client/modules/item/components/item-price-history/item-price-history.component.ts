import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import * as Highcharts from 'highcharts';
import {Chart, SeriesLineOptions, SeriesOptionsType, XAxisOptions} from 'highcharts';
import {
  AuctionItemStat,
  ColumnDescription,
  Item,
  ItemPriceEntry,
  ItemPriceEntryResponse,
  ItemStats,
  Profession
} from '@shared/models';
import {ItemService} from '../../../../services/item.service';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ErrorReport} from '../../../../utils/error-report.util';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {AuctionStatsUtil, NumberUtil, TimeUtil} from '@shared/utils';
import {ThemeUtil} from '../../../core/utils/theme.util';
import {Theme} from '../../../core/models/theme.model';
import {RealmService} from '../../../../services/realm.service';
import {Recipe} from '../../../crafting/models/recipe';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {AuctionsService} from '../../../../services/auctions.service';
import {PriceHistoryComponentUtil} from '../../utils/price-history.util';
import {ProspectingAndMillingUtil} from '../../../../utils/prospect-milling.util';
import {SharedService} from '../../../../services/shared.service';
import {Reagent} from '../../../crafting/models/reagent';
import {ProfessionService} from '../../../crafting/services/profession.service';
import {getXAxisDateLabel} from '../../../util/utils/highcharts.util';
import {DateUtil} from "@ukon1990/js-utilities";

@Component({
  selector: 'wah-item-price-history',
  templateUrl: './item-price-history.component.html',
  styleUrls: ['./item-price-history.component.scss']
})
export class ItemPriceHistoryComponent implements OnChanges, AfterViewInit {
  private ahId: number;
  private readonly util: PriceHistoryComponentUtil;
  private ahTypeId: number = SharedService.user.ahTypeId || 0;

  @Input() item: Item;
  @Input() auctionItem: AuctionItem;
  @Input() isActiveTab = true;
  @Input() dialogId: string;
  theme: Theme = ThemeUtil.current;
  form: UntypedFormGroup = new UntypedFormGroup({
    recipe: new UntypedFormControl(),
    period: new UntypedFormGroup({
      start: new UntypedFormControl(new TimeUtil().getDateAtNDaysSinceNow(30, true)),
      end: new UntypedFormControl(new TimeUtil().getDateAtNDaysSinceNow(-1, true))
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
    dashStyle: 'ShortDot',
    marker: {
      enabled: false
    }
  };
  hourlyQuantityChart: SeriesOptionsType = {
    name: 'Quantity',
    data: [],
    type: 'line',
    yAxis: 1,
    color: this.theme.warnColorCode,
    marker: {
      enabled: false
    }
  };
  hourlyPriceChart: SeriesOptionsType = {
    name: 'Prices',
    data: [],
    color: this.theme.primaryColorCode,
    type: 'line',
    marker: {
      enabled: false
    }
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
      color: this.theme.primaryColorCode,
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
      color: this.theme.primaryColorCode,
      dashStyle: 'Dash',
      marker: {/*
        fillColor: 'white',
        lineWidth: 2,
        lineColor: 'rgba(255, 144, 0, 0.8)'
        */
        enabled: false
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
      color: this.theme.warnColorCode,
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
      color: this.theme.warnColorCode,
      dashStyle: 'Dash',
      marker: {/*
        fillColor: 'red',
        lineWidth: 2,
        lineColor: 'hsla(0,100%,50%,0.7)'
      */
      enabled: false
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
      dashStyle: 'ShortDot',
      marker: {/*
        fillColor: 'red',
        lineWidth: 2,
        lineColor: this.theme.accentColorCode*/

        enabled: false
      }
    }
  ];
  dailyChart: SeriesOptionsType[] = [
    ...this.dailyChartPrice,
    ...this.dailyChartQuantity
  ];
  xAxisDaily: XAxisOptions;
  xAxisHourly: XAxisOptions;
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
  isLoadingCraftingCost = false;
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
  numberOfDays = 0;

  constructor(
    private service: ItemService,
    private realmService: RealmService,
    private auctionService: AuctionsService,
    private professionService: ProfessionService,
  ) {
    const {gameBuild} = this.realmService.events.realmStatus.value;
    this.ahTypeId = gameBuild === 1 ? SharedService.user.ahTypeId : 0;
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
    if (this.isInitiated && !this.isLoading && isActiveTab && isActiveTab.currentValue && auctionItem.currentValue !== this.auctionItem) {
      this.isInitiated = false;
      this.ngAfterViewInit();
    }
  }

  ngAfterViewInit() {
    const firstRecipe: Recipe = this.auctionItem && this.auctionItem.source && this.auctionItem.source.recipe.all ?
      this.auctionItem.source.recipe.all.sort((a, b) => b.roi - a.roi)[0] : undefined;
    const id = this.auctionItem.itemID;
    if (firstRecipe && !ProspectingAndMillingUtil.prospectingSourceMap.get(id) && !ProspectingAndMillingUtil.millsSourceMap.get(id)) {
      const subId = 'recipeSubscription';

      if (!this.sm.getById(subId)) {
        this.sm.add(this.form.controls.recipe.valueChanges, (recipe) => {
          const previousRecipe = this.form.value.recipe;
          if (
            recipe && !previousRecipe ||
            recipe.id !== previousRecipe.id
          ) {
            this.isLoading = true;
            this.isLoadingCraftingCost = true;
            this.loadCraftingCost(recipe as Recipe)
              .catch(console.error)
              .finally(() => {
                this.isLoading = false;
                this.isLoadingCraftingCost = false;
              });
          }
        }, {id: subId});
      }
      this.form.controls.recipe.setValue(firstRecipe, {emitEvent: false});
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
      this.service.getPriceHistory(
        this.getReagentsForRecipe(recipe),
        this.realmService.events.realmStatus.value
      )
        .then(result => {
          this.handleRecipeReagentResult(result);
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  }

  private handleRecipeReagentResult(
    result: Map<string, ItemPriceEntryResponse> = this.service.getLocalPriceHistoryForRealm(
      this.realmService.events.realmStatus.value.id
    ),
    recipe: Recipe = this.form.value.recipe
  ) {
    this.hourlyCostChart['data'] = [];
    this.dailyChartCrafting.forEach( entry => entry['data'] = []);
    this.craftingCostHistory = undefined;
    try {
      if (result && recipe && recipe.reagents) {
        const groupedValues = this.util.extractGroupedValuesFromReagentHistory(recipe, result, this.ahTypeId);
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
      ahId: this.ahId, itemId: reagent.id, petSpeciesId: -1, bonusIds: undefined, ahTypeId: this.ahTypeId
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
      ahTypeId: this.ahTypeId,
      bonusIds: auctionItem.bonusIds
    }, ...reagents],
      this.realmService.events.realmStatus.value
    )
      .then(async (history) => {
        const {itemID, petSpeciesId = -1, bonusIds} = auctionItem;
        this.priceHistory = history.get(`${itemID}-${petSpeciesId}-${AuctionItemStat.bonusIdRaw(bonusIds)}-${this.ahTypeId}`);
        await this.setAuctionAndDataset(history);
        this.stats = this.priceHistory.hourly ?
          AuctionStatsUtil.processDaysForHourlyPriceData(this.priceHistory.hourly) : undefined;
        this.statsDaily = this.priceHistory.daily.length ?
          AuctionStatsUtil.processDaysForDailyPriceData(this.priceHistory.daily) : undefined;
        this.isLoading = false;
        try {
        this.setHeatTable();
        } catch (error) {
          console.error('getDailyHeatmap error', error);
        }
      })
      .catch(async (error) => {
        console.error('in catch', error);
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
    const firstDay = this.priceHistory.daily[0].timestamp;
    const lastDay = this.priceHistory.daily[this.priceHistory.daily.length - 1].timestamp;
    this.numberOfDays = DateUtil.getDifferenceInDays(firstDay, lastDay);
    this.priceHistory.daily.forEach((entry) => {
      this.calculateDailyValues(entry);
    });
    this.groupedByDateTable.data.sort((a, b) =>
      b.timestamp - a.timestamp);
    this.xAxisDaily = getXAxisDateLabel();
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
    this.xAxisHourly = getXAxisDateLabel(true);
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