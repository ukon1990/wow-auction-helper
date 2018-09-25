import { Component, OnInit, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { Dashboard } from '../../../models/dashboard';
import { Angulartics2 } from 'angulartics2';
import { SharedService } from '../../../services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'wah-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
})
export class DashboardItemComponent implements AfterViewInit, OnDestroy, OnInit {
  @Input() dashboard: Dashboard;
  @Input() filterParameter: string;
  detailPanelOpenSubscription: Subscription;
  isOtherDetailPanelOpen = false;

  detailView = false;
  maxVisibleRows;
  currentColumns;
  data;
  constructor(private angulartics2: Angulartics2) { }

  ngOnInit(): void {
    this.setColumns();
    this.setData();
  }
  ngAfterViewInit(): void {
    this.detailPanelOpenSubscription = SharedService.events.detailPanelOpen
      .subscribe((isOpen: boolean) => {
        this.isOtherDetailPanelOpen = isOpen;
      });
  }

  ngOnDestroy(): void {
    this.detailPanelOpenSubscription.unsubscribe();
  }

  setColumns(): void {
    this.currentColumns = this.detailView ?
      this.dashboard.columns : this.dashboard.columns.slice(0, 4);
  }

  setData(): void {
    this.maxVisibleRows = this.detailView ? undefined : 5;
  }

  openClose(): void {
    this.detailView = !this.detailView;
    this.setColumns();
    this.setData();
    this.angulartics2.eventTrack.next({
      action: `${this.dashboard.title} opened/closed`,
      properties: { category: 'Dashboard' },
    });
  }
}
