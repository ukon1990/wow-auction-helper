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
import {CharacterService} from '../../../character/services/character.service';

@Component({
  selector: 'wah-dasboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss']
})
export class DashboardItemsComponent implements OnDestroy, AfterViewInit {
  dashboards: DashboardV2[] = [];
  displayHiddenForm: FormControl = new FormControl(false);
  sm = new SubscriptionManager();
  displaySortPanel: any;
  numberOfCharactersOnRealm: number;
  numberOfBoardsWithAMatch: number;
  numberOfActiveBoards: number;

  constructor(private service: DashboardService, public dialog: MatDialog, private characterService: CharacterService) {
    this.sm.add(this.service.list, (boards: DashboardV2[]) =>
      this.dashboards = [...boards]);
    this.sm.add(NewsUtil.events, isDisplaying => this.renderMigration(isDisplaying));
    this.sm.add(this.service.calculatedBoardEvent, () =>
      this.setTabTitleNumbers());
    this.sm.add(this.characterService.charactersForRealmWithRecipes,
      chars => {
        this.numberOfCharactersOnRealm = chars.length;
      });
  }

  ngAfterViewInit() {
    this.setTabTitleNumbers();
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  private setTabTitleNumbers() {
    this.numberOfBoardsWithAMatch = this.dashboards.filter(board =>
      board.data.length && !board.isDisabled).length;
    this.numberOfActiveBoards = this.dashboards.filter(board => !board.isDisabled).length;
  }

  openNewBoardDialog() {
    this.dialog.open(ConfigureComponent, {
      width: '95%',
      maxWidth: '100%',
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
