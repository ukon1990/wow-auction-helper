import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {SharedService} from '../../../../services/shared.service';
import {DEPRICATEDDashboard} from '../../models/dashboard.model';

@Component({
  selector: 'wah-dashboard-sellers',
  templateUrl: './dashboard-sellers.component.html',
  styleUrls: ['./dashboard-sellers.component.scss']
})
export class DashboardSellersComponent implements AfterViewInit, OnDestroy {

  dashboards: DEPRICATEDDashboard[] = SharedService.sellerDashboards;
  subscription: Subscription;

  constructor() {
  }

  ngAfterViewInit(): void {
    this.subscription = DEPRICATEDDashboard.sellerEvents.subscribe((dashboards: DEPRICATEDDashboard[]) => {
      this.dashboards = dashboards;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}