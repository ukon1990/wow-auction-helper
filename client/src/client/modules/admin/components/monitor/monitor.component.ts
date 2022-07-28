import {Component, OnDestroy} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {interval, Observable} from 'rxjs';
import {ColumnDescription, GlobalStatus, SQLProcess, TableSize} from '@shared/models';
import {TextUtil} from '@ukon1990/js-utilities';
import {MonitorUtil} from '../../utils/monitor.util';
import {SeriesOptionsType, XAxisOptions, YAxisOptions} from 'highcharts';
import {Theme} from '../../../core/models/theme.model';
import {ThemeUtil} from '../../../core/utils/theme.util';
import {getXAxisDateLabel} from '../../../util/utils/highcharts.util';

@Component({
  selector: 'wah-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})
export class MonitorComponent implements OnDestroy {
  size: TableSize[] = [];
  tableStatSummary = {
    totalTableSize: 0,
    totalIndexSizeInMb: 0,
    totalSizeInMb: 0,
    totalFreeTableSizeInMb: 0,
    totalAllocatedTableSize: 0,
    totalNumberOfRows: 0,
  };
  sizeColumns: ColumnDescription[] = [
    {key: 'name', title: 'Table', dataType: 'string'},
    {key: 'tableSizeInMb', title: 'Table size (MB)', dataType: 'number'},
    {key: 'indexSizeInMb', title: 'Index size (MB)', dataType: 'number'},
    {key: 'sizeInMb', title: 'Total size (MB)', dataType: 'number'},
    {key: 'freeTableSizeInMb', title: 'Available storage (MB)', dataType: 'number'},
    {key: 'allocatedTableSize', title: 'Total provisioned size (MB)', dataType: 'number'},
    {key: 'rows', title: 'Rows', dataType: 'number'},
  ];
  processes: SQLProcess[] = [];
  processHistory: any[] = [];
  processHistoryMap = new Map<string, any>();
  columns: ColumnDescription[] = [
    {key: 'command', title: 'Command', dataType: 'string'},
    {key: 'state', title: 'State', dataType: 'string'},
    {key: 'time', title: 'Time', dataType: 'number'},
    {key: 'timeMs', title: 'Time ms', dataType: 'number'},
    {key: 'progress', title: 'Progress', dataType: 'number'},
    {key: 'memoryUsed', title: 'Memory used', dataType: 'number'},
    {key: 'examinedRows', title: 'Examined rows', dataType: 'number'},
    {key: 'info', title: 'SQL', dataType: 'string'},
  ];

  processHistoryColumns: ColumnDescription[] = [
    {key: 'timestamp', title: 'Timestamp', dataType: 'date'},
    {key: 'state', title: 'State', dataType: 'string'},
    {key: 'time', title: 'Time', dataType: 'number'},
    {key: 'timeMs', title: 'Time ms', dataType: 'number'},
    {key: 'progress', title: 'Progress', dataType: 'number'},
    {key: 'memoryUsed', title: 'Memory used', dataType: 'number'},
    {key: 'examinedRows', title: 'Examined rows', dataType: 'number'},
    {key: 'info', title: 'SQL', dataType: 'string'},
  ];
  time: Date;
  globalStatuses: GlobalStatus[] = [];
  queryTime = {
    min: 0,
    avg: 0,
    max: 0,
  };


  private statusInterval: Observable<number> = interval(500);
  private timeInterval: Observable<number> = interval(1000);
  private tableSizeInterval: Observable<number> = interval(10000);
  private globalStatusInterval: Observable<number> = interval(2500);

  sm = new SubscriptionManager();
  series: SeriesOptionsType[] = [{
    name: 'Connections range',
    data: [],
    type: 'arearange',
    lineWidth: 0,
    linkedTo: ':previous',
    color: 'rgba(0, 255, 22, 0.4)',
    fillOpacity: 0.3,
    zIndex: 0,
    marker: {
      enabled: false
    }
  }, {
    name: 'Avg connections',
    data: [],
    type: 'line',
    zIndex: 1,
    marker: {
      fillColor: 'white',
      lineWidth: 2,
      lineColor: 'rgba(255, 144, 0, 0.78)'
    }
  }];
  updatedChart: boolean;

  yAxis: YAxisOptions[] = [
    { // Primary yAxis
      type: 'logarithmic',
      title: {
        text: 'Connections',
      }
    }
  ];
  xAxis: XAxisOptions = getXAxisDateLabel(true);
  theme: Theme = ThemeUtil.current;

  constructor(private service: AdminService) {
    this.getSize();
    this.getGlobalStatus();

    this.sm.add(this.statusInterval,
      () => {
        this.service.getCurrentQueries()
          .then(queries =>
            this.processQueriesResult(queries))
          .catch(console.error);
      });
    this.sm.add(this.timeInterval, () => this.time = new Date());
    this.sm.add(this.tableSizeInterval, () => this.getSize());
    this.sm.add(this.globalStatusInterval, () => this.getGlobalStatus());
  }

  private getId(process: SQLProcess): string {
    return `${process.id}-${process.command}${process.tid}`;
  }

  private processQueriesResult(queries: SQLProcess[]) {
    this.processes = queries.filter(q =>
      !TextUtil.contains(q.info, 'information_schema'))
      .map(q => ({
          ...q,
          info: q.info.slice(0, 1024)
        }));

    this.processes.forEach(process => {
      const res = {
        ...process,
        timestamp: +new Date(),
      };
      const id = this.getId(process);
      if (!this.processHistoryMap.has(id)) {
        this.processHistory.push(res);
        this.processHistoryMap.set(id, res);
      } else {
        const stored: SQLProcess = this.processHistoryMap.get(id);
        stored.examinedRows = process.examinedRows;
        stored.time = process.time;
        stored.timeMs = process.timeMs;
        stored.memoryUsed = process.memoryUsed;
        stored.state = process.state;
        stored.progress = process.progress;
      }
    });
    this.processHistory.sort((a, b) => b.timestamp - a.timestamp);
    this.processHistory = [...this.processHistory];

    this.queryTime = {
      min: 0, avg: 0, max: 0
    };
    this.processHistory.forEach((q: SQLProcess) => {
      const time = q.timeMs;
      if (this.queryTime.min === 0 || this.queryTime.min > time && time !== 0) {
        this.queryTime.min = time;
      }
      if (this.queryTime.max < time) {
        this.queryTime.max = time;
      }
      if (!this.queryTime.avg && time !== 0) {
        this.queryTime.avg = (this.queryTime.avg + time) / 2;
      }
    });
  }

  private getSize() {
    this.service.getTableSize()
      .then(size => {
        const summary = {
          totalTableSize: 0,
          totalIndexSizeInMb: 0,
          totalSizeInMb: 0,
          totalFreeTableSizeInMb: 0,
          totalAllocatedTableSize: 0,
          totalNumberOfRows: 0,
        };
        size.forEach(entry => {
          summary.totalTableSize += entry.tableSizeInMb;
          summary.totalIndexSizeInMb += entry.indexSizeInMb;
          summary.totalSizeInMb += entry.sizeInMb;
          summary.totalFreeTableSizeInMb += entry.freeTableSizeInMb;
          summary.totalAllocatedTableSize += entry.allocatedTableSize;
          summary.totalNumberOfRows += entry.rows;
        });
        this.size = size;
        this.tableStatSummary = summary;
      })
      .catch(console.error);
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  private getGlobalStatus() {
    this.service.getGlobalStatus()
      .then(status => {
        this.globalStatuses.push({
          ...status,
          timestamp: new Date()
        });
        MonitorUtil.getDataset(this.globalStatuses, this.series);
        this.updatedChart = true;
      })
      .catch(console.error);
  }
}