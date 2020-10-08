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
import {DetailsDialogComponent} from './details-dialog/details-dialog.component';
import {TextUtil} from '@ukon1990/js-utilities';

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
  @Input() isInDialogWindow: boolean;
  isOtherDetailPanelOpen = false;
  isConfigOpen = false;
  currentColumns;
  data;
  faCog = faCog;
  sm = new SubscriptionManager();


  constructor(public dialog: MatDialog, private service: DashboardService) {
    this.sm.add(SharedService.events.detailPanelOpen, (isOpen: boolean) => {
      this.isOtherDetailPanelOpen = isOpen;
    });

    this.sm.add(this.service.calculatedBoardEvent, (id) => {
      if (id === this.dashboard.id) {
        this.dashboard = this.service.map.value.get(id);
        this.setColumns();
      }
    });
  }

  ngAfterViewInit(): void {
    this.setColumns();
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
    this.dialog.open(ConfigureComponent, {
      width: '95%',
      maxWidth: '100%',
      data: this.dashboard
    });
  }

  setColumns(allColumns: boolean = this.allColumns): void {
    if (!this.dashboard || !this.dashboard.columns) {
      return;
    }
    this.currentColumns = (this.isInDialogWindow || allColumns) ?
      this.dashboard.columns : this.dashboard.columns.slice(0, 4);
    const nameColumns = this.dashboard.columns.filter(column =>
      TextUtil.contains(column.key, 'name'));
    if (nameColumns.length) {
      this.filterParameter = nameColumns[0].key;
    }
  }

  openClose(): void {
    this.dialog.open(DetailsDialogComponent, {
      width: '95%',
      maxWidth: '100%',
      data: {
        dashboard: this.dashboard,
        filterParameter: this.filterParameter,
      }
    });

    Report.send(`${this.dashboard.title} opened/closed`, 'Dashboard');
  }
}
