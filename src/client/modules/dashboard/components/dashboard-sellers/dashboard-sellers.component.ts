import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import {SharedService} from '../../../../services/shared.service';
import {Dashboard} from '../../models/dashboard.model';

@Component({
  selector: 'wah-dashboard-sellers',
  templateUrl: './dashboard-sellers.component.html',
  styleUrls: ['./dashboard-sellers.component.scss']
})
export class DashboardSellersComponent implements AfterViewInit, OnDestroy {

  dashboards: Dashboard[] = SharedService.sellerDashboards;
  subscription: Subscription;

  constructor() {
  }

  ngAfterViewInit(): void {
    this.subscription = Dashboard.sellerEvents.subscribe((dashboards: Dashboard[]) => {
      this.dashboards = dashboards;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
