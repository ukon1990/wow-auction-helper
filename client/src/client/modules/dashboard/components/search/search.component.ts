import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormControl} from '@angular/forms';
import {DashboardMinimal, DashboardV2} from '../../models/dashboard-v2.model';
import {DashboardService} from '../../services/dashboard.service';
import {TextUtil} from '@ukon1990/js-utilities';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {DetailsDialogComponent} from '../dashboard-item/details-dialog/details-dialog.component';
import {DashboardCalculateUtil} from '../../utils/dashboard-calculate.util';
import {AuctionsService} from '../../../../services/auctions.service';
import {faEye} from '@fortawesome/free-solid-svg-icons/faEye';
import {faFileImport} from '@fortawesome/free-solid-svg-icons/faFileImport';
import {faSyncAlt} from '@fortawesome/free-solid-svg-icons/faSyncAlt';
import {Report} from '../../../../utils/report.util';

@Component({
  selector: 'wah-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.html']
})
export class SearchComponent implements OnInit, OnDestroy {
  faEye = faEye;
  faImport = faFileImport;
  searchField: FormControl = new FormControl();
  boards: DashboardMinimal[] = [];
  filteredBoards: DashboardMinimal[] = [];
  isLoading: boolean;
  sm = new SubscriptionManager();
  myDashboards = new Map<string, DashboardV2>();
  myCopiedDashboards = new Map<string, DashboardV2>();
  faUpdate = faSyncAlt;

  constructor(
    private auctionService: AuctionsService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<SearchComponent>,
    private service: DashboardService,
    ) {
    this.sm.add(
      this.searchField.valueChanges,
      value => this.search(value)
    );
  }

  ngOnInit(): void {
    this.downloadBoards();
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  private downloadBoards() {
    this.isLoading = true;
    this.service.getAllPublic()
      .then(boards => {
        this.mapUserBoards();
        this.isLoading = false;
        this.boards = boards;
        this.search();
      })
      .catch(() => {
        this.isLoading = false;
      });
  }

  search(filter: string = this.searchField.value): void {
    if (!filter) {
      this.filteredBoards = [...this.boards];
      return;
    }
    this.filteredBoards = this.boards.filter(board =>
      TextUtil.contains(board.id, filter) ||
      TextUtil.contains(board.title, filter) ||
      TextUtil.contains(board.description, filter) ||
      board.tags.filter(tag => TextUtil.contains(tag, filter)).length
    );
  }

  import(board: DashboardMinimal) {
    Report.send('DashboardSearchComponent.import', 'Imported dashboard');
    board.isImporting = true;
    const copied = this.myCopiedDashboards.get(board.id);
    this.service.importPublicBoard(board.id, copied)
      .then(() => {
        board.isImporting = false;
        this.mapUserBoards();
      })
      .catch(() => board.isImporting = false);
  }

  preview(board: DashboardMinimal) {
    Report.send('DashboardSearchComponent.preview', 'Previewed dashboard');
    board.isLoading = true;
    this.service.getCopyById(board.id)
      .then(copy => {
        board.isLoading = false;
        this.dialog.open(DetailsDialogComponent, {
          width: '95%',
          maxWidth: '100%',
          data: {
            dashboard:  DashboardCalculateUtil.calculate(copy, this.auctionService.mapped.value),
            filterParameter: '',
          },
        });
      })
      .catch(() => board.isLoading = false);
  }

  private mapUserBoards() {
    this.myDashboards = this.service.map.value;
    this.myCopiedDashboards = new Map<string, DashboardV2>();
    this.service.list.value.forEach(board => {
      if (board.parentId) {
        this.myCopiedDashboards.set(board.parentId, board);
      }
    });
  }
}
