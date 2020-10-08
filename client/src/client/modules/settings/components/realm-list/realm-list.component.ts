import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {RealmService} from '../../../../services/realm.service';
import {RealmStatus} from '../../../../models/realm-status.model';
import {ColumnDescription} from '../../../table/models/column-description';
import {AuctionUpdateLog, AuctionUpdateLogEntry} from '../../../../../../../api/src/models/auction/auction-update-log.model';
import {Report} from '../../../../utils/report.util';
import {DateUtil} from '@ukon1990/js-utilities';
import {MatDialog} from '@angular/material/dialog';
import {ConfigureComponent} from '../../../dashboard/components/configure/configure.component';
import {RealmListDialogComponent} from './realm-list-dialog/realm-list-dialog.component';

@Component({
  selector: 'wah-realm-list',
  templateUrl: './realm-list.component.html',
  styleUrls: ['./realm-list.component.scss']
})
export class RealmListComponent {

  constructor(public dialog: MatDialog) {
  }

  toggle(): void {
    this.dialog.open(RealmListDialogComponent, {
      width: '95%',
      maxWidth: '100%'
    });
  }
}
