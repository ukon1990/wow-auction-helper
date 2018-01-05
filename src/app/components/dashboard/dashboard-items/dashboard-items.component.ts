import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { Dashboard } from '../../../models/dashboard';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'wah-dasboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss']
})
export class DashboardItemsComponent {

  constructor(private _title: Title) {
    this._title.setTitle('WAH - Item dashboard');
  }

  getItemDashboards(): Array<Dashboard> {
    return SharedService.itemDashboards;
  }
}
