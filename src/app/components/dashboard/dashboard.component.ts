import { Component, OnInit } from '@angular/core';
import { Dashboard } from '../../models/dashboard';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'wah-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  getItemDashboards(): Array<Dashboard> {
    return SharedService.itemDashboards;
  }
  getSellerDashboards(): Array<Dashboard> {
    return SharedService.sellerDashboards;
  }
}
