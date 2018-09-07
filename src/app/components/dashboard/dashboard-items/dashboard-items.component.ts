import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { Dashboard } from '../../../models/dashboard';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'wah-dasboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss']
})
export class DashboardItemsComponent implements AfterViewInit, OnDestroy {
  dashboards: Dashboard[] = SharedService.itemDashboards;
  subscription: Subscription;


  constructor(private _title: Title) {
    this._title.setTitle('WAH - Item dashboard');
  }

  ngAfterViewInit(): void {
    this.subscription = Dashboard.itemEvents.subscribe((dashboards: Dashboard[]) => {
      this.dashboards = dashboards;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
