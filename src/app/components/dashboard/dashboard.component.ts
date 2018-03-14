import { Component, OnInit } from '@angular/core';
import { Dashboard } from '../../models/dashboard';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'wah-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  getSellersCount(): number {
    return SharedService.sellerDashboards.length;
  }

  getitemCount(): number {
    return SharedService.itemDashboards.length;
  }
}
