import {ChartData} from './chart-data.model';

export class SummaryCard {
  dataMap = new Map<string, ChartData>();

  constructor(public title: string,
              public type: 'line' | 'radar' | 'bar' | 'pie',
              public labels: ChartData[] = [],
              public data: ChartData[] = []) {
  }

  addEntry(id: any, value: number): void {
    if (!this.dataMap[id]) {
      this.dataMap[id] = new ChartData(id, value);
      this.data.push(this.dataMap[id]);
    } else {
      this.dataMap[id].value += value;
    }
  }

  clearEntries(): void {
    Object.keys(this.dataMap).forEach(key =>
      delete this.dataMap[key]);
    this.data.length = 0;
  }
}
