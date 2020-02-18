import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {TSMCSV, TsmLuaUtil} from '../../../../../utils/tsm/tsm-lua.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {ChartData} from '../../../../util/models/chart.model';
import {NumberUtil} from '../../../../util/utils/number.util';
import {GoldPipe} from '../../../../util/pipes/gold.pipe';
import {ProfitSummary} from '../../../models/profit-summary.model';
import {AuctionsService} from '../../../../../services/auctions.service';

@Component({
  selector: 'wah-profit-summary-chart',
  templateUrl: './profit-summary-chart.component.html',
  styleUrls: ['./profit-summary-chart.component.scss']
})
export class ProfitSummaryChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() realm: string;
  summary: any;
  sm = new SubscriptionManager();
  datasets: ChartData = {
    labels: [],
    datasets: [],
    labelCallback: this.tooltipCallback
  };

  constructor(private service: AuctionsService) {
    this.sm.add(
      TsmLuaUtil.events,
      (data: TSMCSV) =>
        this.handleDataChange(data));
    this.sm.add(
      this.service.events.list,
      () => this.handleRealmChange(this.realm)
    );
  }

  ngOnInit(): void {
    this.handleRealmChange(this.realm);
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  ngOnChanges({realm}: SimpleChanges): void {
    if (realm && realm.currentValue) {
      console.log(realm.currentValue);
      this.handleRealmChange(realm.currentValue);
    }
  }

  private handleDataChange(data: TSMCSV) {
    if (!data) {
      return;
    }
    this.summary = data.profitSummary;
    this.handleRealmChange(this.realm);
    console.log('CSV', data.profitSummary);
  }

  private handleRealmChange(realm: string) {
    this.datasets = {
      labels: [],
      axisLabels: {
        yAxis1: 'Gold',
        yAxis2: 'Daily profit',
        xAxis: 'Date'
      },
      datasets: [],
      labelCallback: this.tooltipCallback
    };
    if (!this.summary) {
      return;
    }
    const realmData: ProfitSummary = this.summary[realm];
    if (realmData) {
      this.addDataset('Income', 'hsla(76,100%,50%,0.33)');
      this.addDataset('Expenses', 'hsla(0, 100%, 50%, 0.33)');
      this.addDataset('Sales', 'hsla(126,100%,50%,0.33)');
      this.addDataset('Purchases', 'hsla(0, 100%, 50%, 0.33)');
      this.addDataset('Profit', 'hsla(230,100%,50%,0.33)', 'yAxes-2');

      realmData.total.daily.list
        .sort((a, b) => +a.date - +b.date)
        .forEach(day => {
          this.datasets.labels.push(day.date.toLocaleDateString());
          this.datasets.datasets[0].data.push(day.income / 10000);
          this.datasets.datasets[1].data.push(day.expenses / 10000);
          this.datasets.datasets[2].data.push(day.sales / 10000);
          this.datasets.datasets[3].data.push(day.purchases / 10000);
          this.datasets.datasets[4].data.push(day.profit / 10000);
        });
    }
  }

  tooltipCallback(items, data): string {
    const {index, datasetIndex} = items;
    const dataset = data.datasets[datasetIndex];
    if (datasetIndex === 1) {
      return dataset.label + ': ' +
        NumberUtil.format(dataset.data[index]);
    }
    return dataset.label + ': ' +
      new GoldPipe().transform(dataset.data[index] * 10000);
  }

  private addDataset(label: string, backgroundColor: string, yAxisID: 'yAxes-1' | 'yAxes-2' = 'yAxes-1') {
    this.datasets.datasets.push({
      label,
      data: [],
      type: 'line',
      yAxisID,
      backgroundColor
    });
  }
}
