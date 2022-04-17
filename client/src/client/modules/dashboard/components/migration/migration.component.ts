import {AfterViewInit, Component, EventEmitter, Inject, OnInit, Output, ViewChild} from '@angular/core';
import {Dashboard} from '@shared/models';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DashboardService} from '../../services/dashboard.service';
import {faSave, faUndo} from '@fortawesome/free-solid-svg-icons';
import {DashboardMigrationUtil} from '../../utils/dashboard-migration.util';
import {MatStepper} from '@angular/material/stepper';
import {Report} from '../../../../utils/report.util';
import {ErrorReport} from '../../../../utils/error-report.util';

@Component({
  selector: 'wah-migration',
  templateUrl: './migration.component.html',
  styleUrls: ['./migration.component.scss']
})
export class MigrationComponent implements OnInit, AfterViewInit {
  @ViewChild('stepper') stepper: MatStepper;
  @Output() event: EventEmitter<void> = new EventEmitter<void>();
  faSave = faSave;
  faTrash = faTrashAlt;
  faUndo = faUndo;
  boards: Dashboard[] = [];


  constructor(
    public dialogRef: MatDialogRef<MigrationComponent>,
    @Inject(MAT_DIALOG_DATA) public input: string | any,
    private service: DashboardService) {
  }

  ngOnInit() {
    this.boards = DashboardMigrationUtil.migrate(JSON.parse(this.input));
    this.boards.forEach(board => board.isDisabled = true);
    console.log('Migrated', this.boards);
  }

  ngAfterViewInit(): void {
    console.log('Stepper', this.stepper);
  }

  onSave(): void {
    this.dialogRef.close();
  }

  onDiscard(): void {
    this.dialogRef.close();
  }

  migrate() {
    try {
      const selection: Dashboard[] = this.boards.filter(board => !board.isDisabled);
      this.service.saveAll(selection);

      // localStorage.removeItem('watchlist');
      localStorage.setItem('completedMigration', 'true');

      Report.send(
        'DashboardService.migrate',
        'DashboardService',
        `Succesfully migrated ${selection.length} / ${ this.boards.length } to the latest Dashboard setup`);
    } catch (error) {
      ErrorReport.sendError('DashboardService.migrate', error);
    }
    this.dialogRef.close();
  }

  noMigrate() {
    // localStorage.removeItem('watchlist');
    localStorage.setItem('completedMigration', 'true');
    this.dialogRef.close();
  }
}