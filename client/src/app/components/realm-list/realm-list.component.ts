import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {RealmService} from '../../services/realm.service';
import {RealmStatus} from '../../models/realm-status.model';
import {ColumnDescription} from '../../models/column-description';

@Component({
  selector: 'wah-realm-list',
  templateUrl: './realm-list.component.html',
  styleUrls: ['./realm-list.component.scss']
})
export class RealmListComponent implements OnInit, OnDestroy {
  sm = new SubscriptionManager();
  realms: RealmStatus[] = [];
  columns: ColumnDescription[] = [
    {key: 'region', title: 'Region', dataType: 'text'},
    {key: 'name', title: 'Realm', dataType: 'text'},
    {key: 'battlegroup', title: 'Battlegroup', dataType: 'text'},
    {key: 'timezone', title: 'Timezone', dataType: 'text'},
    {key: 'locale', title: 'Locale', dataType: 'text'},
    {key: 'lastModified', title: 'Last modified', dataType: 'date'},
    {key: 'lowestDelay', title: 'Minutes per update', dataType: 'number'},
    {key: 'size', title: 'Size in MB', dataType: 'number'}
  ];
  show: boolean;

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
}
