import {AfterViewInit, Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {Dashboard} from '../../models/dashboard.model';
import {SharedService} from '../../../../services/shared.service';
import {Report} from '../../../../utils/report.util';
import {faCog} from '@fortawesome/free-solid-svg-icons/faCog';
import {MatDialog} from '@angular/material/dialog';
import {ConfigureComponent} from '../configure/configure.component';
import {DashboardV2} from '../../models/dashboard-v2.model';
import {DashboardService} from '../../services/dashboard.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';

@Component({
  selector: 'wah-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
})
export class DashboardItemComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() dashboard: DashboardV2;
  @Input() filterParameter: string;
  @Input() hideButtons: boolean;
  @Input() allColumns: boolean;
  isOtherDetailPanelOpen = false;

  detailView = false;
  isConfigOpen = false;
  maxVisibleRows: number;
  currentColumns;
  data;
  faCog = faCog;
  sm = new SubscriptionManager();


  constructor(public dialog: MatDialog, private service: DashboardService) {
    this.sm.add(SharedService.events.detailPanelOpen, (isOpen: boolean) => {
      this.isOtherDetailPanelOpen = isOpen;
    });

    this.sm.add(this.service.calculatedBoardEvent, (id) => {
    });
  }

  ngAfterViewInit(): void {
    this.setColumns();
    this.setData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.allColumns) {
      this.setColumns(changes.allColumns.currentValue);
    } else {
      this.setColumns();
    }
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  toggleConfig(): void {
    this.isConfigOpen = true;
    const dialogRef = this.dialog.open(ConfigureComponent, {
      width: '95%',
      data: this.dashboard
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isConfigOpen = false;
    });
  }

  setColumns(allColumns: boolean = this.allColumns): void {
    this.currentColumns = (this.detailView || allColumns) ?
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
