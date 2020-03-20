import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {ColumnDescription} from '../../../../table/models/column-description';
import {ItemPriceEntry} from '../../../models/item-price-entry.model';
import {ChartData} from '../../../../util/models/chart.model';
import {NumberUtil} from '../../../../util/utils/number.util';
import {GoldPipe} from '../../../../util/pipes/gold.pipe';
import {MatTabChangeEvent, MatTabGroup} from '@angular/material';
import {Report} from '../../../../../utils/report.util';
import {ItemService} from '../../../../../services/item.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';

@Component({
  selector: 'wah-price-heat-map',
  templateUrl: './price-heat-map.component.html',
  styleUrls: ['./price-heat-map.component.scss']
})
export class PriceHeatMapComponent implements OnChanges, AfterViewInit {
  @Input() dailyData: any[];
  @Input() hourlyData: any[];


  @ViewChild('tabs', {static: false}) tabs;

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
  days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

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

  hourlyByDayTable = {
    columns: this.columns,
    data: []
  };
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

  private processHourly(data: ItemPriceEntry[]) {
    const dayMap = {};
    this.dayList = [];
    data.forEach(({timestamp, min, quantity}, index) => {
      const date = new Date(timestamp),
        day = date.getDay(),
        hour = date.getHours();
      if (!dayMap[day]) {
        dayMap[day] = {
          min: min,
          avg: min,
          max: min,
          avgQuantity: quantity,
          minTimeOfDay: hour,
          maxTimeOfDay: hour,
          avgPriceChange: undefined,
          hour: {}
        };
        this.dayList.push(dayMap[day]);
      } else {
        const dayData = dayMap[day];
        if (dayData.min > min) {
          dayMap[day].min = min;
          dayMap[day].minTimeOfDay = hour;
        }
        if (dayData.max < min) {
          dayMap[day].max = min;
          dayMap[day].maxTimeOfDay = hour;
        }

        dayMap[day].avg = (dayMap[day].avg + min) / 2;
        dayMap[day].avgQuantity = (dayMap[day].avgQuantity + quantity) / 2;
      }

      if (!dayMap[day].hour[hour]) {
        dayMap[day].hour[hour] = {
          min: {
            price: min,
            quantity
          },
          avg: {
            price: min,
            quantity
          },
          max: {
            price: min,
            quantity
          },
          change: data[index - 1] ? data[index].min - data[index - 1].min : 0
        };
      } else {
        const hourData = dayMap[day].hour[hour];
        hourData.avg.price = (hourData.avg.price + min) / 2;
        if (hourData.min.price > min) {
          hourData.min.price = min;
        }
        if (hourData.max.price < min) {
          hourData.max.price = min;
        }
        hourData.change = data[index].min - data[index - 1].min;
      }
    });
    this.dailyData = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let day = 0; day < 7; day++) {
        this.addDayForHoursTable(day, hour, dayMap);
      }
    }

    this.setGroupedByWeekdayChartData();
    console.log('dayMap', {dayMap, list: this.dayList});
  }

  private setGroupedByWeekdayChartData() {
    this.setDatasetForGroupedByWeekDayChart();
    this.chartDataPerDay = this.setChartDataPerDayList();

    this.dayList.forEach((day, index) => {
      const groupedDaysSets = this.chartDataDay.datasets,
        datasetsForDay = this.chartDataPerDay[index];

      for (let hour = 0; hour < 24; hour++) {
        this.calculateAndSetAvgPriceChange(hour, index, day);

        this.setPerHourForDayOfWeek(hour, index, day, datasetsForDay);
      }
      this.chartDataDay.labels.push(this.days[index]);
      groupedDaysSets[0].data.push(day.min / 10000);
      groupedDaysSets[1].data.push(day.avg / 10000);
      groupedDaysSets[2].data.push(day.max / 10000);
      groupedDaysSets[3].data.push(day.avgPriceChange / 10000);
    });
  }

  private setPerHourForDayOfWeek(hour: number, index: number, day, datasetsForDay: ChartData) {
    let prev;
    if (!hour) {
      const dayIndex = !index ? 6 : (index - 1);
      prev = this.dayList[dayIndex].hour[23];
    } else {
      prev = day.hour[hour - 1];
    }

    datasetsForDay.labels.push('' + hour);
    datasetsForDay.datasets[0].data.push(day.hour[hour].min.price / 10000);
    datasetsForDay.datasets[1].data.push(day.hour[hour].avg.price / 10000);
    datasetsForDay.datasets[2].data.push(day.hour[hour].max.price / 10000);
    if (prev) {
      const change = day.hour[hour].avg.price - prev.avg.price;
      datasetsForDay.datasets[3].data.push(change / 10000);
    }
  }

  private calculateAndSetAvgPriceChange(hour: number, index: number, day) {
    let prev;
    if (!hour) {
      const dayIndex = !index ? 6 : (index - 1);
      prev = this.dayList[dayIndex].hour[23];
    } else if (hour) {
      prev = day.hour[hour - 1];
    }
    const change = day.hour[hour].avg.price - prev.avg.price;
    console.log(index, hour, day.hour[hour].avg.price + ' - ' + prev.avg.price + ' = ' + change);
    if (day.avgPriceChange === undefined) {
      day.avgPriceChange = (day.avgPriceChange + change) / 2;
    } else {
      day.avgPriceChange = change;
    }
  }

  private setDatasetForGroupedByWeekDayChart() {
    this.chartDataDay.datasets.push({
      label: 'Min',
      data: [],
      type: 'line',
      yAxisID: 'yAxes-1',
      backgroundColor: 'rgba(0, 255, 22, 0.4)'
    });
    this.chartDataDay.datasets.push({
      label: 'Avg',
      data: [],
      type: 'line',
      yAxisID: 'yAxes-1',
      backgroundColor: 'rgba(255, 144, 0, 0.78)'
    });
    this.chartDataDay.datasets.push({
      label: 'Max',
      data: [],
      type: 'line',
      yAxisID: 'yAxes-1',
      backgroundColor: 'rgba(0, 173, 255, 0.61)'
    });
    this.chartDataDay.datasets.push({
      label: 'Avg price change',
      data: [],
      type: 'line',
      yAxisID: 'yAxes-2',
      backgroundColor: 'hsla(9,100%,50%,0.33)'
    });
  }

  private addDayForHoursTable(day: number, hour: number, dayMap: {}) {
    if (!this.hourlyByDayTable.data[hour]) {
      this.hourlyByDayTable.data.push({
        hour: hour < 10 ? '0' + hour : hour
      });
    }
    this.hourlyByDayTable.data[hour][day] = dayMap[day].hour[hour].avg.price;
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

  setTabChange(index: number, s: string) {
    this.selectedTab = index;
    localStorage[this.indexStoredName] = index;
  }
}
