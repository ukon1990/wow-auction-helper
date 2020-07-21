import {Component, OnDestroy} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {DashboardService} from '../../services/dashboard.service';
import {DashboardV2} from '../../models/dashboard-v2.model';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'wah-dasboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss']
})
export class DashboardItemsComponent implements OnDestroy {
  dashboards: DashboardV2[] = [];
  displayHiddenForm: FormControl = new FormControl(false);
  sm = new SubscriptionManager();

  constructor(private service: DashboardService) {
    this.sm.add(this.service.list, (boards) => this.dashboards = boards);
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }
}
