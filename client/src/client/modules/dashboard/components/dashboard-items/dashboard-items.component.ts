import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import {SharedService} from '../../../../services/shared.service';
import {Dashboard} from '../../models/dashboard.model';

@Component({
  selector: 'wah-dasboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss']
})
export class DashboardItemsComponent implements AfterViewInit, OnDestroy {
  dashboards: Dashboard[] = SharedService.itemDashboards;
  subscription: Subscription;


  constructor() {
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
