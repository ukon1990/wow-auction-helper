import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { Dashboard } from '../../../models/dashboard';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'wah-dashboard-sellers',
  templateUrl: './dashboard-sellers.component.html',
  styleUrls: ['./dashboard-sellers.component.scss']
})
export class DashboardSellersComponent {

  constructor(private _title: Title) {
    this._title.setTitle('WAH - Sellers dashboard');
  }

  getSellerDashboards(): Array<Dashboard> {
    return SharedService.sellerDashboards;
  }
}
