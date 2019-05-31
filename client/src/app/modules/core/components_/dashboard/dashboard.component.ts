import {Component, OnDestroy} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {SharedService} from '../../../../services/shared.service';

@Component({
  selector: 'wah-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnDestroy {
  routeSubscription: Subscription;
  activatedRoute = 'items';

  constructor(private route: Router) {
    this.routeSubscription = route.events
      .subscribe((event: NavigationEnd) =>
        this.onNavigationChange(event));
  }


  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  private onNavigationChange(event: NavigationEnd) {
    switch (event.url) {
      case '/dashboard/items':
        this.activatedRoute = 'items';
        break;
      case '/dashboard/sellers':
        this.activatedRoute = 'sellers';
        break;
      case '/dashboard/manage-dashboards':
        this.activatedRoute = 'manage-dashboards';
        break;
    }
  }

  getSellersCount(): number {
    return SharedService.sellerDashboards.length;
  }

  getitemCount(): number {
    return SharedService.itemDashboards.length;
  }
}
