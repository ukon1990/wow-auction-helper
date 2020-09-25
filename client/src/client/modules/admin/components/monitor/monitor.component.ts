import {Component, OnDestroy, OnInit} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {SQLProcess, TableSize} from '../../../../../../../api/src/logs/model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {interval, Observable} from 'rxjs';
import {ColumnDescription} from '../../../table/models/column-description';
import {TextUtil} from '@ukon1990/js-utilities';

@Component({
  selector: 'wah-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})
export class MonitorComponent implements OnDestroy {
  size: TableSize[] = [];
  sizeColumns: ColumnDescription[] = [
    {key: 'name', title: 'Table', dataType: 'string'},
    {key: 'sizeInMb', title: 'Size (MB)', dataType: 'number'},
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
    {key: 'memoryUsed', title: 'Memory used', dataType: 'number'},
    {key: 'examinedRows', title: 'Examined rows', dataType: 'number'},
    {key: 'info', title: 'SQL', dataType: 'string'},
  ];
  time: Date;

  private statusInterval: Observable<number> = interval(500);
  private timeInterval: Observable<number> = interval(1000);
  private tableSizeInterval: Observable<number> = interval(10000);

  sm = new SubscriptionManager();

  constructor(private service: AdminService) {
    this.getSize();

    this.sm.add(this.statusInterval,
      () => {
        this.service.getCurrentQueries()
          .then(queries =>
            this.processQueriesResult(queries))
          .catch(console.error);
      });
    this.sm.add(this.timeInterval, () => this.time = new Date());
    this.sm.add(this.tableSizeInterval, () => this.getSize());
  }

  private getId(process: SQLProcess): string {
    return `${process.id}-${process.queryId}${process.tid}`;
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
        stored.memoryUsed = process.memoryUsed;
        stored.state = process.state;
      }
    });
    this.processHistory.sort((a, b) => b.timestamp - a.timestamp);
    this.processHistory = [...this.processHistory];
  }

  private getSize() {
    this.service.getTableSize()
      .then(size => this.size = size)
      .catch(console.error);
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }
}
