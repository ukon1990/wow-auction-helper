import { Component, OnInit } from '@angular/core';
import { DefaultDashboardSettings } from '../../../models/dashboard/default-dashboard-settings.model';

@Component({
  selector: 'wah-manage-items-built-in',
  templateUrl: './manage-items-built-in.component.html',
  styleUrls: ['./manage-items-built-in.component.scss']
})
export class ManageItemsBuiltInComponent implements OnInit {
  boards = DefaultDashboardSettings.list;

  constructor() { }

  ngOnInit() {
  }

}
