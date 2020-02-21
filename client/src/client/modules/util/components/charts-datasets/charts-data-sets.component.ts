import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Chart} from 'chart.js';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {Report} from '../../../../utils/report.util';
import {ChartData} from '../../models/chart.model';

@Component({
  selector: 'wah-charts-data-sets',
  templateUrl: './charts-data-sets.component.html',
  styleUrls: ['./charts-data-sets.component.scss']
})
export class ChartsDataSetsComponent implements OnDestroy, AfterViewInit, OnChanges {
  @Input() datasets: ChartData;
  @Input() datasetLabel: string;
  @Input() storageName: string;
  @Input() height = 20;
  @Output() selection = new EventEmitter<number>();

  chart: Chart;
  chartTypeForm: FormControl = new FormControl();
  colors;

  subscriptions = new SubscriptionManager();

  constructor() {
  }

  ngAfterViewInit(): void {
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
      this.setChart();
    }, 100);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  setChart(): void {
    if (!this.storageName) {
      Report.debug('Chart is missing storageName');
      return;
    }
    try {
      if (this.chart) {
        this.chart.destroy();
      }
      Report.debug({id: this.storageName, config: this.getChartConfig()});
      this.chart = new Chart(this.storageName, this.getChartConfig());
    } catch (e) {
      Report.debug(e);
    }
  }

  private getChartConfig() {
    const config = {
      type: 'line',
      data: this.datasets,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: this.getScales(),
        onClick: (elements, chartItem) =>
          this.onClick(elements, chartItem),
      }
    };

    if (this.datasets.labelCallback) {
      config.options['tooltips'] = {
        enabled: true,
        mode: 'label',
        position: 'nearest',
        callbacks: {label: this.datasets.labelCallback}
      };
    } else {
      config.options['tooltips'] = {
        mode: 'label',
        position: 'nearest'
      };
    }

    return config;
  }

  private getScales() {
    let yAxis1, yAxis2, xAxis;
    if (this.datasets.axisLabels) {
      yAxis1 = this.datasets.axisLabels.yAxis1;
      yAxis2 = this.datasets.axisLabels.yAxis2;
      xAxis = this.datasets.axisLabels.xAxis;
    }
    return {
      yAxes: [{
        id: 'yAxes-1',
        scaleLabel: {
          display: !!yAxis1,
          labelString: yAxis1 || '',
        },
        type: 'linear',
        ticks: {
          beginAtZero: true,
          callback: function (value, index, values) {
            return value.toLocaleString();
          }
        },
        position: 'left',
        gridLines: {
          drawOnChartArea: false
        },
      }, {
        id: 'yAxes-2',
        scaleLabel: {
          display: !!yAxis2,
          labelString: yAxis2 || '',
        },
        type: 'linear',
        ticks: {
          beginAtZero: true,
          callback: function (value, index, values) {
            return value.toLocaleString();
          }
        },
        position: 'right',
        gridLines: {
          drawOnChartArea: false
        },
      }],
      xAxes: [{
        scaleLabel: {
          display: !!xAxis,
          labelString: xAxis || '',
        }
      }]
    };
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
