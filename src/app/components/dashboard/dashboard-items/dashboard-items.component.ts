import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { Dashboard } from '../../../models/dashboard';

@Component({
  selector: 'wah-dasboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss']
})
export class DashboardItemsComponent {

  getItemDashboards(): Array<Dashboard> {
    return SharedService.itemDashboards;
  }
}
