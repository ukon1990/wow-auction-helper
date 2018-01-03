import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { Dashboard } from '../../../models/dashboard';

@Component({
  selector: 'wah-dashboard-sellers',
  templateUrl: './dashboard-sellers.component.html',
  styleUrls: ['./dashboard-sellers.component.scss']
})
export class DashboardSellersComponent {

  getSellerDashboards(): Array<Dashboard> {
    return SharedService.sellerDashboards;
  }
}
