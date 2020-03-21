import {FormControl} from '@angular/forms';
import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, OnDestroy} from '@angular/core';
import {ColumnDescription} from '../../../../table/models/column-description';
import {ItemPriceEntry} from '../../../models/item-price-entry.model';
import {ChartData} from '../../../../util/models/chart.model';
import {GoldPipe} from '../../../../util/pipes/gold.pipe';
import {MatTabChangeEvent, MatTabGroup} from '@angular/material';
import {Report} from '../../../../../utils/report.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {PriceSummaryUtil} from '../../../utils/price-summary.util';

@Component({
  selector: 'wah-price-heat-map',
  templateUrl: './price-heat-map.component.html',
  styleUrls: ['./price-heat-map.component.scss']
})
export class PriceHeatMapComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() dailyData: any[];
  @Input() hourlyData: any[];

  @ViewChild('tabs', {static: false}) tabs;

  numberOfWeeksFormControl: FormControl = new FormControl(2);

  columns: ColumnDescription[] = [
    {key: 'hour', title: 'Hour', dataType: 'string'},
    {key: '0', title: 'Monday', dataType: 'gold'}, // TODO: Might be not be a good idea to hard-code
    {key: '1', title: 'Tuesday', dataType: 'gold'},
    {key: '2', title: 'Wednesday', dataType: 'gold'},
    {key: '3', title: 'Thursday', dataType: 'gold'},
    {key: '4', title: 'Friday', dataType: 'gold'},
    {key: '5', title: 'Saturday', dataType: 'gold'},
    {key: '6', title: 'Sunday', dataType: 'gold'}
  ];

  dayList = [];
  days = PriceSummaryUtil.days;

  chartDataDay: ChartData = {
    labels: [],
    datasets: [],
    axisLabels: {
      yAxis1: 'Min/Avg/Max',
      yAxis2: 'Avg change'
    },
    labelCallback: this.tooltipCallbackHourly
  };
  chartDataPerDay = this.setChartDataPerDayList();

  constructor() {
    this.sm.add(this.numberOfWeeksFormControl.valueChanges,
      value =>
        this.processHourly(this.hourlyData, value));
  }

  private sm = new SubscriptionManager();
  private indexStoredName = 'price-history-by-weekdays-tabs';
  selectedTab = localStorage[this.indexStoredName] ? +localStorage[this.indexStoredName] : 0;

  ngOnChanges({dailyData, hourlyData}: SimpleChanges): void {
    if (hourlyData && hourlyData.currentValue) {
      this.processHourly(hourlyData.currentValue);
    }
  }

  ngAfterViewInit(): void {
    this.sm.add(
      (this.tabs as MatTabGroup)
        .selectedTabChange,
      (event: MatTabChangeEvent) => Report.debug('Tab change in heat map', event));

  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  private processHourly(data: ItemPriceEntry[], numberOfWeeks: number = this.numberOfWeeksFormControl.value) {
    console.log('Number of weeks', numberOfWeeks);

    this.dayList = PriceSummaryUtil.processHourly(data, numberOfWeeks);

    this.dailyData = [];
    this.setGroupedByWeekdayChartData();
  }

  private setGroupedByWeekdayChartData() {
    this.setDatasetForGroupedByWeekDayChart();
    this.chartDataPerDay = this.setChartDataPerDayList();

    this.dayList.forEach((day, index) =>
      PriceSummaryUtil.processAndSetWeekdayData(
        index, day, this.dayList, this.chartDataPerDay[index], this.chartDataDay));
  }

  daySelection(index: number) {
    this.setTabChange(index);
  }

  private setDatasetForGroupedByWeekDayChart() {
    this.chartDataDay = {
      labels: [],
      datasets: [{
        label: 'Min',
        data: [],
        type: 'line',
        yAxisID: 'yAxes-1',
        backgroundColor: 'rgba(0, 255, 22, 0.4)'
      }, {
        label: 'Avg',
        data: [],
        type: 'line',
        yAxisID: 'yAxes-1',
        backgroundColor: 'rgba(255, 144, 0, 0.78)'
      }, {
        label: 'Max',
        data: [],
        type: 'line',
        yAxisID: 'yAxes-1',
        backgroundColor: 'rgba(0, 173, 255, 0.61)'
      }, {
        label: 'Avg price change',
        data: [],
        type: 'line',
        yAxisID: 'yAxes-2',
        backgroundColor: 'hsla(9,100%,50%,0.33)'
      }],
      axisLabels: {
        yAxis1: 'Min/Avg/Max',
        yAxis2: 'Avg change'
      },
      labelCallback: this.tooltipCallbackHourly
    };
  }

  tooltipCallbackHourly(items, data): string {
    const {index, datasetIndex} = items;
    const dataset = data.datasets[datasetIndex];
    return dataset.label + ': ' +
      new GoldPipe().transform(data.datasets[datasetIndex].data[index] * 10000);
  }

  private setChartDataPerDayList(): ChartData[] {
    const list = [];
    this.days.forEach(() => {
      list.push({
        labels: [],
        datasets: [{
          label: 'Min',
          data: [],
          type: 'line',
          yAxisID: 'yAxes-1',
          backgroundColor: 'rgba(0, 255, 22, 0.4)'
        }, {
          label: 'Avg',
          data: [],
          type: 'line',
          yAxisID: 'yAxes-1',
          backgroundColor: 'rgba(255, 144, 0, 0.78)'
        }, {
          label: 'Max',
          data: [],
          type: 'line',
          yAxisID: 'yAxes-1',
          backgroundColor: 'rgba(0, 173, 255, 0.61)'
        }, {
          label: 'Avg price change',
          data: [],
          type: 'line',
          yAxisID: 'yAxes-2',
          backgroundColor: 'hsla(9,100%,50%,0.33)'
        }],
        axisLabels: {
          yAxis1: 'Min/Avg/Max',
          yAxis2: 'Avg change'
        },
        labelCallback: this.tooltipCallbackHourly
      });
    });
    return list;
  }

  setTabChange(index: number) {
    this.selectedTab = index;
    localStorage[this.indexStoredName] = index;
  }
}
