import {Component, OnInit, Input, AfterViewInit, OnDestroy, OnChanges, SimpleChanges} from '@angular/core';
import {Angulartics2} from 'angulartics2';
import {Subscription} from 'rxjs';
import {Dashboard} from '../../models/dashboard.model';
import {SharedService} from '../../../../services/shared.service';
import {Report} from '../../../../utils/report.util';
import {faCog} from '@fortawesome/free-solid-svg-icons/faCog';
import {MatDialog} from '@angular/material/dialog';
import {ConfigureComponent} from '../configure/configure.component';

@Component({
  selector: 'wah-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
})
export class DashboardItemComponent implements AfterViewInit, OnDestroy, OnInit, OnChanges {
  @Input() dashboard: Dashboard;
  @Input() filterParameter: string;
  detailPanelOpenSubscription: Subscription;
  isOtherDetailPanelOpen = false;

  detailView = false;
  isConfigOpen = false;
  maxVisibleRows: number;
  currentColumns;
  data;
  faCog = faCog;


  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.setColumns();
    this.setData();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
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

  toggleConfig(): void {
    this.isConfigOpen = true;
    const dialogRef = this.dialog.open(ConfigureComponent, {
      width: '90%',
      data: this.dashboard
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isConfigOpen = false;
    });
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
