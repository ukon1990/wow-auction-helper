import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {RealmService} from '../../../../services/realm.service';
import {RealmStatus} from '../../../../models/realm-status.model';
import {ColumnDescription} from '../../../table/models/column-description';
import {AuctionUpdateLog, AuctionUpdateLogEntry} from '../../../../../../../api/src/models/auction/auction-update-log.model';
import {Report} from '../../../../utils/report.util';
import {DateUtil} from '@ukon1990/js-utilities';

@Component({
  selector: 'wah-realm-list',
  templateUrl: './realm-list.component.html',
  styleUrls: ['./realm-list.component.scss']
})
export class RealmListComponent implements OnInit, OnDestroy {
  sm = new SubscriptionManager();
  updateLogForRealm: AuctionUpdateLog;
  realms: RealmStatus[] = [];
  columns: ColumnDescription[] = [
    {key: 'region', title: 'Region', dataType: 'text'},
    {key: 'name', title: 'Realm', dataType: 'text'},
    {key: 'battlegroup', title: 'Battlegroup', dataType: 'text'},
    {key: 'timezone', title: 'Timezone', dataType: 'text'},
    {key: 'locale', title: 'Locale', dataType: 'text'},
    {key: 'autoUpdate', title: 'Is activated', dataType: 'boolean'},
    {key: 'lowestDelay', title: 'Minutes per update', dataType: 'number'},
    {key: 'size', title: 'Size in MB', dataType: 'number'},
    {key: 'lastModified', title: 'Last updated', dataType: 'date'},
    {key: 'timeLeft', title: 'Time left', dataType: 'number'},
    {key: 'nextUpdate', title: 'Next expected update', dataType: 'date'}
  ];
  show: boolean;
  logColumns: ColumnDescription[] = [
    {key: 'lastModified', title: 'Last updated', dataType: 'date'},
    {key: 'timeSincePreviousDump', title: 'Time since previous update', dataType: 'number'},
    {key: 'size', title: 'File size', dataType: 'number'}
  ];
  selectedDataset = {
    columns: this.columns,
    data: []
  };

  constructor(private service: RealmService) {
    this.sm.add(
      this.service.events.list,
      (realms: RealmStatus[]) => {
        this.realms = realms.map(status => {
          const nextUpdate = status.lastModified + status.lowestDelay * 1000 * 60;
          return {
            ...status,
            timeLeft: DateUtil.timeSince(new Date(nextUpdate), 'm') * -1,
            nextUpdate: nextUpdate
          };
        });
        this.reset();
      });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  toggle(): void {
    this.show = !this.show;
  }

  reset(): void {
    this.selectedDataset.columns = this.columns;
    this.selectedDataset.data = this.realms;
  }

  realmSelect({row}): void {
    if (row.timeSincePreviousDump) {
      return;
    }
    this.updateLogForRealm = undefined;
    if (row.lastModified > +new Date() - 60 * 60 * 1000 * 7) {
      this.service.getLogForRealmWithId(row.ahId)
        .then(res => {
          const first = res.entries[0];
          res.entries = [{
            id: first.id,
            ahId: first.ahId,
            lastModified: first.lastModified + res.avgTime * 1000 * 60,
            timeSincePreviousDump: first.timeSincePreviousDump,
            url: '',
            size: first.size
          }, ...res.entries];
          res.entries.forEach(entry => {
            entry.timeSincePreviousDump = this.msToMinutes(entry);
            entry['name'] = row.name;
          });
          this.updateLogForRealm = res;
          this.selectedDataset.columns = this.logColumns;
          this.selectedDataset.data = res.entries;
        })
        .catch(err => Report.debug('realmSelect', err));
    }
    // getLogForRealmWithId;
  }

  private msToMinutes(entry: AuctionUpdateLogEntry) {
    return Math.round(entry.timeSincePreviousDump / 1000 / 60);
  }
}
