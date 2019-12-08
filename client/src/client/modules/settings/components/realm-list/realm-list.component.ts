import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {RealmService} from '../../../../services/realm.service';
import {RealmStatus} from '../../../../models/realm-status.model';
import {ColumnDescription} from '../../../table/models/column-description';
import {AuctionUpdateLog, AuctionUpdateLogEntry} from '../../../../../../../api/src/models/auction/auction-update-log.model';
import {Report} from '../../../../utils/report.util';

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
    {key: 'lowestDelay', title: 'Minutes per update', dataType: 'number'},
    {key: 'size', title: 'Size in MB', dataType: 'number'},
    {key: 'lastModified', title: 'Last updated', dataType: 'date'}
  ];
  show: boolean;
  logColumns: ColumnDescription[] = [
    {key: 'lastModified', title: 'Last updated', dataType: 'date'},
    {key: 'timeSincePreviousDump', title: 'Time since previous update', dataType: 'number'},
  ];

  constructor(private service: RealmService) {
    this.sm.add(
      this.service.events.list,
      (realms: RealmStatus[]) => this.realms = realms);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  toggle(): void {
    this.show = !this.show;
  }

  realmSelect(row): void {
    if (row.timeSincePreviousDump) {
      return;
    }
    this.updateLogForRealm = undefined;
    console.log('Row clicked', row, new Date(+new Date() - 60 * 60 * 1000 * 7));
    if (row.lastModified > +new Date() - 60 * 60 * 1000 * 7) {
      this.service.getLogForRealmWithId(row.ahId)
        .then(res => {
          res.entries.forEach(entry =>
            entry.timeSincePreviousDump = this.msToMinutes(entry));
          this.updateLogForRealm = res;
        })
        .catch(err => Report.debug('realmSelect', err));
    }
    // getLogForRealmWithId;
  }

  private msToMinutes(entry: AuctionUpdateLogEntry) {
    return Math.round(entry.timeSincePreviousDump / 1000 / 60);
  }
}
