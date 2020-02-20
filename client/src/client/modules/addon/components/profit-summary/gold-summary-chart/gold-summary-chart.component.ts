import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import * as distinctColors from 'distinct-colors';
import {TSMCSV, TsmLuaUtil} from '../../../../../utils/tsm/tsm-lua.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {ChartData} from '../../../../util/models/chart.model';
import {GoldPipe} from '../../../../util/pipes/gold.pipe';

@Component({
  selector: 'wah-gold-summary-chart',
  templateUrl: './gold-summary-chart.component.html',
  styleUrls: ['./gold-summary-chart.component.scss']
})
export class GoldSummaryChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() realm;
  sm = new SubscriptionManager();
  goldLog;
  datasets: ChartData = {
    labels: [],
    datasets: [],
    // labelCallback: this.tooltipCallback
  };

  constructor() {
    this.sm.add(
      TsmLuaUtil.events,
      (data: TSMCSV) =>
        this.handleDataChange(data));
  }

  ngOnInit() {
  }

  ngOnChanges({realm}: SimpleChanges): void {
    if (realm && realm.currentValue) {
      this.generateDataset(realm.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  private handleDataChange(data: TSMCSV) {
    if (data) {
      this.goldLog = data['goldLog'];
      this.generateDataset();
    }
  }

  private generateDataset(realm: string = this.realm) {
    if (!realm || !this.goldLog || !this.goldLog[realm]) {
      return;
    }
    this.datasets = {
      labels: [],
      axisLabels: {
        yAxis1: 'Sum gold',
        xAxis: 'Date'
      },
      datasets: [],
      labelCallback: this.tooltipCallback
    };
    const dateLabelMap = {},
      dayMap = {},
      charMap = {},
      log = this.goldLog[realm];
    Object.keys(log)
      .forEach((character) => {
        if (character === 'All') {
          return;
        }
        log[character]
          .forEach(({minute, copper}) => {
            this.mapGoldToCharacterAndDate(minute, dateLabelMap, charMap, character, copper);
          });

      });
    const colors = distinctColors({count: Object.keys(charMap).length});
    Object.keys(charMap)
      .forEach((char, index) => {
        this.populateDatasetsWithCharacterData(charMap, char, colors, index, dateLabelMap);
      });
    const datasetCount = this.datasets.datasets.length;
    this.addDataset('Sum', [200, 30, 90], 'yAxes-1');
    this.populateGoldChart(datasetCount);
  }

  private populateDatasetsWithCharacterData(charMap: any, char: string, colors, index: number, dateLabelMap: {}) {
    const character = charMap[char];
    this.addDataset(char, colors[index].rgba());
    this.datasets.labels
      .sort((a, b) => dateLabelMap[a] - dateLabelMap[b])
      .forEach(day => {
        const dataset = this.datasets.datasets[index];
        if (character[day] === undefined) {
          const gold = dataset.data[dataset.data.length - 1];
          dataset.data.push(gold || 0);
        } else {
          dataset.data.push(character[day].copper / 10000);
        }
      });
  }

  private mapGoldToCharacterAndDate(minute, dateLabelMap: {}, charMap: {}, character: string, copper) {
    const date = new Date(minute).toLocaleDateString();
    if (!dateLabelMap[date]) {
      dateLabelMap[date] = minute;
      this.datasets.labels.push(date);
    }
    if (!charMap[character]) {
      charMap[character] = {};

    }
    if (!charMap[character][date]) {
      charMap[character][date] = {minute, copper};
    } else if (charMap[character][date].minute < minute) {
      charMap[character][date].minute = minute;
      charMap[character][date].copper = copper;
    }
  }

  private populateGoldChart(datasetCount: number) {
    this.datasets.labels.forEach((l, index) => {
      let gold = 0;
      for (let i = 0; i < datasetCount; i++) {
        const value = this.datasets.datasets[i].data[index];
        if (value !== undefined) {
          gold += value;
        }
      }
      this.datasets.datasets[datasetCount].data.push(gold);
    });
  }

  private sortAscending(a, b) {
    return a - b;
  }

  private addDataset(label: string, color: number[], yAxisID: 'yAxes-1' | 'yAxes-2' = 'yAxes-1') {
    this.datasets.datasets.push({
      label,
      data: [],
      type: 'line',
      yAxisID,
      backgroundColor: `rgba(${color[0]}, ${color[1]}, ${color[2]}, .5)`
    });
  }

  private tooltipCallback(items, data): string {
    const {index, datasetIndex} = items;
    const dataset = data.datasets[datasetIndex];
    return dataset.label + ': ' +
      new GoldPipe().transform(dataset.data[index] * 10000);
  }
}
