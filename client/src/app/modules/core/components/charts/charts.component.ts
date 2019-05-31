import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, OnDestroy} from '@angular/core';
import {Chart} from 'chart.js';
import * as distinctColors from 'distinct-colors';
import {FormControl} from '@angular/forms';
import {Item} from '../../../../models/item/item';
import {ChartData} from '../../../../models/chart-data.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';

@Component({
  selector: 'wah-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() dataMap: Map<any, ChartData>;
  @Input() labels: ChartData[];
  @Input() datasetLabel: string;
  @Input() storageName;
  @Input() defaultType = 'doughnut';
  @Input() allowTypeChange = true;
  @Output() selection = new EventEmitter<number>();

  chart: Chart;
  chartTypeForm: FormControl = new FormControl();
  colors;

  subscriptions = new SubscriptionManager();

  constructor() {
  }

  ngAfterViewInit(): void {
    this.chartTypeForm.setValue(
      localStorage[this.storageName] ? localStorage[this.storageName] : this.defaultType);
    this.subscriptions.add(
      this.chartTypeForm.valueChanges,
      (type => {
        setTimeout(() => {
          this.save();
          this.setChart();
        }, 100);
      }));

    this.setChart();
  }

  ngOnChanges(changes): void {
    setTimeout(() => {
      this.colors = distinctColors({count: this.labels.length});
      this.setChart();
    }, 100);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  setChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart(this.storageName, this.getChartConfig());
  }

  private getChartConfig() {
    return {
      type: this.chartTypeForm.value,
      data: {
        datasets: [{
          label: this.datasetLabel,
          data: this.getData(),
          backgroundColor: this.colors
        }],
        labels: this.getLabels()
      },
      options: {
        scales: this.getScales(),
        onClick: (elements, chartItem) =>
          this.onClick(elements, chartItem)
      }
    };
  }

  private getScales() {
    const type = this.chartTypeForm.value;
    if (type !== 'line' && type !== 'bar') {
      return undefined;
    }
    return {
      yAxes: [{
        ticks: {
          beginAtZero: false,
          callback: function (value, index, values) {
            return value.toLocaleString();
          }
        }
      }]
    };
  }

  private getLabels() {
    return this.labels.map(label =>
      label.value);
  }

  private getData() {
    return this.labels.map(d =>
      this.dataMap[d.id] ?
        this.dataMap[d.id].value : 0);
  }

  getClassIDForItem(item: Item): string {
    return `${item.itemClass}-${item.itemSubClass}`;
  }

  save(): void {
    localStorage[this.storageName] = this.chartTypeForm.value;
  }

  private onClick(elements, chartItem): void {
    if (chartItem[0]) {
      this.selection.emit(chartItem[0]['_index']);
    }
  }
}
