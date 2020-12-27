import {AfterViewInit, Component, Input, OnDestroy} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {DashboardService} from '../../services/dashboard.service';
import {DashboardV2} from '../../models/dashboard-v2.model';
import {FormControl, FormGroup} from '@angular/forms';
import {ConfigureComponent} from '../configure/configure.component';
import {MatDialog} from '@angular/material/dialog';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {MigrationComponent} from '../migration/migration.component';
import {NewsUtil} from '../../../about/utils/news.util';
import {CharacterService} from '../../../character/services/character.service';
import {Report} from '../../../../utils/report.util';
import {ErrorReport} from '../../../../utils/error-report.util';
import {SearchComponent} from '../search/search.component';
import { faFileImport } from '@fortawesome/free-solid-svg-icons/faFileImport';
import {faPlus} from '@fortawesome/free-solid-svg-icons/faPlus';
import {PageEvent} from '@angular/material/paginator';
import {TextUtil} from '@ukon1990/js-utilities/dist/utils/text.util';

@Component({
  selector: 'wah-dashboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss']
})
export class DashboardItemsComponent implements OnDestroy, AfterViewInit {
  form: FormGroup = new FormGroup({
    displayHidden: new FormControl(false),
    search: new FormControl()
  });
  dashboards: DashboardV2[] = [];
  filteredBoards: DashboardV2[] = [];
  // displayHiddenForm: FormControl = new FormControl(false);
  // displaySearch: FormControl = new FormControl();
  itemsPerPage = 8;
  pageRows: Array<number> = [4, 8, 12, 24, 36];
  pageEvent: PageEvent = { pageIndex: 0, pageSize: this.itemsPerPage, length: 0 };
  sm = new SubscriptionManager();
  faImport = faFileImport;
  faPlus = faPlus;
  numberOfCharactersOnRealm: number;
  numberOfBoardsWithAMatch: number;
  numberOfActiveBoards: number;
  private lastCalculationTime: number;

  constructor(private service: DashboardService,
              public dialog: MatDialog,
              private characterService: CharacterService
  ) {
    this.sm.add(this.form.valueChanges, value => {
      const delay = 500;
      this.lastCalculationTime = +new Date();

      setTimeout(() => {
        const timeDiff = +new Date() - this.lastCalculationTime;
        if (timeDiff >= delay) {
          this.filter(value);
        }
      }, delay);
    });
  }

  ngAfterViewInit() {
    this.sm.add(this.service.list, (boards: DashboardV2[]) => {
      this.dashboards = [...boards];
      this.filter();
    });
    this.sm.add(NewsUtil.events, isDisplaying => this.renderMigration(isDisplaying));
    this.sm.add(this.service.calculatedBoardEvent, () =>
      this.setTabTitleNumbers());
    this.sm.add(this.characterService.charactersForRealmWithRecipes,
      chars => {
        this.numberOfCharactersOnRealm = chars.length;
      });

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
    try {
      Report.send(
        'Rearranged board',
        'DashboardItemsComponent.drop',
        `Moved board from ${previousIndex} to ${currentIndex}`);
      Report.debug(`Moved board from ${previousIndex} to ${currentIndex}`);
      this.service.move(previousIndex, currentIndex);
    } catch (error) {
      ErrorReport.sendError('DashboardItemsComponent.drop', error);
    }
  }

  pageChange(event: PageEvent): void {
    this.pageEvent = event;
  }

  /* istanbul ignore next */
  get toValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return this.pageRows[0];
    }
    return this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1);
  }

  /* istanbul ignore next */
  get fromValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return 0;
    }
    return (this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1)) - this.pageEvent.pageSize;
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

  openImportBoardDialog() {
    this.dialog.open(SearchComponent, {
      width: '95%',
      maxWidth: '100%',
    });
  }

  private filter({search, displayHidden} = this.form.value) {
    this.filteredBoards = this.dashboards
      .filter(({title, data, isDisabled, tags}) => {
        if (!displayHidden && isDisabled) {
          return false;
        }

        if (!data.length && !displayHidden) {
          return false;
        }

        if (!search || TextUtil.contains(title, search)) {
          return true;
        }

        if (tags) {
          for (let i = 0; i < tags.length; i++) {
            if (tags[i] && TextUtil.contains(tags[i], search)) {
              return true;
            }
          }
        }

        for (let i = 0; i < data.length; i++) {
          const values = Object.keys(data[i]);
          for (let ix = 0; ix < values.length; ix++) {
            const source = '' + data[i][values[ix]];
            if (source && TextUtil.contains(source, search)) {
              return true;
            }
          }
        }
        return false;
      });
  }
}
