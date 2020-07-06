import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ColumnDescription} from '../../../../table/models/column-description';
import {SummaryCard} from '../../../../../models/summary-card.model';
import {NumberUtil} from '../../../../util/utils/number.util';
import {GoldPipe} from '../../../../util/pipes/gold.pipe';
import {ChartData} from '../../../../util/models/chart.model';
import {ChartData as SummaryCardData} from '../../../../../models/chart-data.model';

@Component({
  selector: 'wah-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.scss']
})
export class SummaryCardComponent implements OnInit, OnChanges {
  @Input() summary: SummaryCard;
  @Input() useChart: boolean;

  columns: ColumnDescription[] = [
    {key: 'id', title: 'Type', dataType: 'text'},
    {key: 'value', title: 'Quantity', dataType: 'number'}
  ];
  tableData = [];
  dateData: ChartData = {
    labels: [],
    datasets: [],
    labelCallback: this.tooltipCallback
  };
  private axisLabels = {
    yAxis1: 'Quantity',
    xAxis: 'Source'
  };

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.summary && changes.summary.currentValue) {
      const summary: SummaryCard = changes.summary.currentValue;
      this.tableData.length = 0;
      this.resetData();
      summary.data
        .forEach((data: SummaryCardData) => {
          this.tableData.push({
            id: this.getLabel(summary, data),
            value: data.value
          });

          this.setChartData(summary, data);
        });

      this.tableData
        .sort((a: SummaryCardData, b: SummaryCardData) =>
          b.value - a.value);
    }
  }

  private getLabel(summary: SummaryCard, data: SummaryCardData) {
    const [match] = summary.labels.filter(l => l.id === data.id);
    return match ? match.value : data.id;
  }

  selection(id: number) {
  }

  resetData() {
    this.dateData.labels.length = 0;
    this.dateData.datasets = [];
    this.dateData.axisLabels = this.axisLabels;
    this.dateData.datasets.push({
      label: this.summary.title,
      data: [],
      type: 'bar',
      fill: 2,
      yAxisID: 'yAxes-1',
      backgroundColor: 'rgba(0, 255, 22, 0.4)'
    });
  }

  tooltipCallback(items, data): string {
    const {index, datasetIndex} = items;
    const dataset = data.datasets[datasetIndex];
    return dataset.label + ': ' +
      NumberUtil.format(dataset.data[index]);
  }

  private setChartData(summary: SummaryCard, data: SummaryCardData) {
    this.dateData.labels.push(this.getLabel(summary, data));
    this.dateData.datasets[0].data.push(data.value);
  }
}
