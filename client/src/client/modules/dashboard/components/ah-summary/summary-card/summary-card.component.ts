import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Report} from '../../../../../utils/report.util';
import {ColumnDescription} from '../../../../table/models/column-description';
import {SummaryCard} from '../../../../../models/summary-card.model';
import {ChartData} from '../../../../../models/chart-data.model';

@Component({
  selector: 'wah-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.scss']
})
export class SummaryCardComponent implements OnInit, OnChanges {
  @Input() summary: any;
  @Input() useChart: boolean;

  columns: ColumnDescription[] = [
    {key: 'id', title: 'Type', dataType: 'text'},
    {key: 'value', title: 'Quantity', dataType: 'number'}
  ];
  tableData = [];

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.summary && changes.summary.currentValue) {
      const summary: SummaryCard = changes.summary.currentValue;
      this.tableData.length = 0;
      summary.data
        .forEach((data: ChartData) =>
          this.tableData.push({
            id: summary.labels[data.id] ? summary.labels[data.id].value : data.id,
            value: data.value
          }));

      this.tableData
        .sort((a: ChartData, b: ChartData) =>
          b.value - a.value);
    }
  }

  selection(id: number) {
  }
}
