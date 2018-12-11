import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { Dashboard } from '../../../models/dashboard';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'wah-dashboard-sellers',
  templateUrl: './dashboard-sellers.component.html',
  styleUrls: ['./dashboard-sellers.component.scss']
})
export class DashboardSellersComponent implements AfterViewInit, OnDestroy {

  dashboards: Dashboard[] = SharedService.sellerDashboards;
  subscription: Subscription;

  constructor(private _title: Title) {
    this._title.setTitle('WAH - Sellers dashboard');
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
