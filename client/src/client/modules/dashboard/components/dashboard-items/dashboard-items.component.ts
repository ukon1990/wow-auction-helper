import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {DashboardService} from '../../services/dashboard.service';
import {DashboardV2} from '../../models/dashboard-v2.model';
import {FormControl} from '@angular/forms';
import {ConfigureComponent} from '../configure/configure.component';
import {MatDialog} from '@angular/material/dialog';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {MigrationComponent} from '../migration/migration.component';
import {NewsUtil} from '../../../about/utils/news.util';

@Component({
    selector: 'wah-dasboard-items',
    templateUrl: './dashboard-items.component.html',
    styleUrls: ['./dashboard-items.component.scss']
})
export class DashboardItemsComponent implements OnDestroy {
    dashboards: DashboardV2[] = [];
    displayHiddenForm: FormControl = new FormControl(false);
    sm = new SubscriptionManager();
    displaySortPanel: any;

    constructor(private service: DashboardService, public dialog: MatDialog) {
        this.sm.add(this.service.list, (boards) => this.dashboards = boards);
        this.sm.add(NewsUtil.events, isDisplaying => this.renderMigration(isDisplaying));
    }

  ngOnDestroy(): void {
        this.sm.unsubscribe();
    }

    openNewBoardDialog() {
        this.dialog.open(ConfigureComponent, {
            width: '95%'
        });
    }

  drop({previousIndex, currentIndex}: CdkDragDrop<DashboardV2, any>) {
      this.service.move(previousIndex, currentIndex);
  }

    onPanelClick(panelName: string) {
        if (panelName === 'sort') {
            if (this.displaySortPanel) {
                this.displaySortPanel = false;
            } else {
                this.displaySortPanel = true;
            }
        } else {
            if (!this.displaySortPanel && panelName === 'boards') {
                this.displaySortPanel = true;
            } else {
                this.displaySortPanel = false;
            }
        }
    }

  private renderMigration(isDisplaying: boolean) {
    if (!localStorage.getItem('completedMigration') && localStorage.getItem('watchlist') && !isDisplaying) {
      this.dialog.open(MigrationComponent, {
        width: '95%',
        maxWidth: '100%',
        data: localStorage.getItem('watchlist')
      });
    }
  }
}
