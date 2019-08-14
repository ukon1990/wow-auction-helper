import {Component, OnInit, Input, AfterViewInit, OnDestroy} from '@angular/core';
import {Angulartics2} from 'angulartics2';
import {Subscription} from 'rxjs';
import {Dashboard} from '../../models/dashboard.model';
import {SharedService} from '../../../../services/shared.service';
import {Report} from '../../../../utils/report.util';

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
  maxVisibleRows: number;
  currentColumns;
  data;

  constructor() {
  }

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

    Report.send(`${this.dashboard.title} opened/closed`, 'Dashboard');
  }
}
