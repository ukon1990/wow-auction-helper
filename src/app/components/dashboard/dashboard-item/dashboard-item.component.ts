import { Component, OnInit, Input } from '@angular/core';
import { Dashboard } from '../../../models/dashboard';
import { Angulartics2 } from 'angulartics2/angulartics2';

@Component({
  selector: 'wah-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
})
export class DashboardItemComponent implements OnInit {
  @Input() dashboard: Dashboard;

  detailView = false;
  constructor(private angulartics2: Angulartics2) { }

  ngOnInit() {
  }

  logic(): void {
    this.detailView = !this.detailView;
    this.angulartics2.eventTrack.next({
      action: `${this.dashboard.title} opened/closed`,
      properties: { category: 'Dashboard' },
    });
  }
}
