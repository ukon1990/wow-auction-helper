import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {faCog} from '@fortawesome/free-solid-svg-icons/faCog';
import {RealmService} from '../../../../../services/realm.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionUpdateLog} from '../../../../../../../../api/src/models/auction/auction-update-log.model';
import {RealmStatus} from '../../../../../models/realm-status.model';
import {ColumnDescription} from '../../../../table/models/column-description';
import {DateUtil} from '@ukon1990/js-utilities';
import {Report} from '../../../../../utils/report.util';

@Component({
  selector: 'wah-realm-list-dialog',
  templateUrl: './realm-list-dialog.component.html',
  styleUrls: ['./realm-list-dialog.component.scss']
})
export class RealmListDialogComponent implements OnDestroy {
  faCog = faCog;
  isDownloading: boolean;
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
  logColumns: ColumnDescription[] = [
    {key: 'lastModified', title: 'Last updated', dataType: 'date'},
    {key: 'timeSincePreviousDump', title: 'Time since previous update', dataType: 'number'},
    {key: 'size', title: 'File size', dataType: 'number'}
  ];
  selectedDataset = {
    columns: this.columns,
    data: []
  };

  constructor(private service: RealmService,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<RealmListDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
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
        const times = {};
        const timeList = [];
        realms.forEach(realm => {
          const minute = new Date(realm.lastModified).getMinutes();
          if (!times[minute]) {
            times[minute] = {
              minute,
              regions: {},
            };
            timeList.push(times[minute]);
          }
          if (!times[minute].regions[realm.region]) {
            times[minute].regions[realm.region] = 0;
          }

          times[minute].regions[realm.region]++;
        });
        Report.debug('Realm times are', timeList.sort((a, b) => b.minute - a.minute));
        this.reset();
      });
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  getRealms() {
    this.isDownloading = true;
    this.service.getRealms()
      .then(() => this.isDownloading = false)
      .catch(() => this.isDownloading = false);
  }

  reset(): void {
    this.selectedDataset.columns = [...this.columns];
    this.selectedDataset.data = [...this.realms];
  }

  realmSelect({row}): void {
    if (row.timeSincePreviousDump) {
      return;
    }
    this.updateLogForRealm = undefined;
    if (row.lastModified > +new Date() - 60 * 60 * 1000 * 7) {
      this.isDownloading = true;
      this.service.getLogForRealmWithId(row.ahId)
        .then(res => {
          const first = res.entries[0];
          res.entries = [{
            id: first.id,
            lastModified: first.lastModified + res.avgTime * 1000 * 60,
            timeSincePreviousDump: first.timeSincePreviousDump,
            url: '',
            size: first.size
          }, ...res.entries];
          res.entries.forEach(entry => {
            entry['name'] = row.name;
          });
          this.updateLogForRealm = res;
          this.selectedDataset.columns = this.logColumns;
          this.selectedDataset.data = res.entries;
          this.isDownloading = false;
        })
        .catch(err => {
          Report.debug('realmSelect', err);
          this.isDownloading = false;
        });
    }
    // getLogForRealmWithId;
  }
/*
  private msToMinutes(entry: AuctionUpdateLog) {
    return Math.round(entry.timeSincePreviousDump / 1000 / 60);
  }*/
}
