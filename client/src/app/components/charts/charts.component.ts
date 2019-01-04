import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Chart} from 'chart.js';
import * as distinctColors from 'distinct-colors';
import {FormControl} from '@angular/forms';
import {Item} from '../../models/item/item';

@Component({
  selector: 'wah-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements AfterViewInit, OnChanges {
  @Input() data: any[];
  @Input() labels: string[];
  @Input() storageName;
  @Input() defaultType = 'doughnut';
  @Output() selection = new EventEmitter<number>();

  chart: Chart;
  chartTypeForm: FormControl = new FormControl();
  colors;

  constructor() {
  }

  ngAfterViewInit(): void {
    this.chartTypeForm.setValue(
      localStorage[this.storageName] ? localStorage[this.storageName] : this.defaultType);
    this.chartTypeForm.valueChanges.subscribe(type => {
      setTimeout(() => {
        this.save();
        this.setChart(this.labels);
      }, 100);
    });

    this.setChart(this.labels);
  }

  ngOnChanges(): void {
    setTimeout(() => {
      this.colors = distinctColors({count: this.labels.length});
      this.setChart(this.labels);
    }, 100);
  }

  setChart(data: Array<any>): void {
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart('chart', {
      type: this.chartTypeForm.value,
      data: {
        datasets: [{
          data: this.data, // .map(c => c.quantity),
          backgroundColor: this.colors
        }],
        labels: this.labels
      },
      options: {
        onClick: (elements, chartItem) =>
          this.onClick(elements, chartItem)
      }
    });
  }

  getClassIDForItem(item: Item): string {
    return `${item.itemClass}-${item.itemSubClass}`;
  }

  save(): void {
    localStorage[this.storageName] = this.chartTypeForm.value;
  }

  private onClick(elements, chartItem): void {
    this.selection.emit(chartItem[0]['_index']);
  }
}
