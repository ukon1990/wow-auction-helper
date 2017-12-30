import { Component, OnInit, Input } from '@angular/core';
import { Dashboard } from '../../../models/dashboard';

@Component({
  selector: 'wah-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
})
export class DashboardItemComponent implements OnInit {
  @Input() dashboard: Dashboard;

  detailView = false;
  constructor() { }

  ngOnInit() {
  }

  logic(): void {
    this.detailView = !this.detailView;
  }
}
