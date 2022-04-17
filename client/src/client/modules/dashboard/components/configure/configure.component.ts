import {AfterViewInit, Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {faSave} from '@fortawesome/free-solid-svg-icons/faSave';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {ObjectUtil} from '@ukon1990/js-utilities';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {ruleFields} from '../../data/rule-fields.data';
import {Profession} from '@shared/models';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {Dashboard} from '@shared/models';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DashboardCalculateUtil} from '../../utils/dashboard-calculate.util';
import {AuctionsService} from '../../../../services/auctions.service';
import {faUndo} from '@fortawesome/free-solid-svg-icons/faUndo';
import {getDefaultDashboards} from '../../data/default-doards.data';
import {DashboardService} from '../../services/dashboard.service';
import {Report} from '../../../../utils/report.util';
import {ProfessionService} from '../../../crafting/services/profession.service';
import {AuthService} from '../../../user/services/auth.service';

@Component({
  selector: 'wah-configure',
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss']
})
export class ConfigureComponent implements OnInit, AfterViewInit {
  @Output() event: EventEmitter<void> = new EventEmitter<void>();
  isAuthenticated: boolean;
  fields = ruleFields;
  professions: Profession[] = [];
  tmpBoard: Dashboard;
  isDefaultBoard: boolean;

  faSave = faSave;
  faTrash = faTrashAlt;
  faUndo = faUndo;

  hasChanges: boolean;
  form: FormGroup = new FormGroup({
    id: new FormControl(),
    parentId: new FormControl(),
    idParam: new FormControl(),
    title: new FormControl(null, Validators.required),
    description: new FormControl(null, [Validators.maxLength(128)]),
    tags: new FormControl([]),
    columns: new FormArray([]),
    sortOrder: new FormControl(0),
    onlyItemsWithRules: new FormControl(false),
    isDisabled: new FormControl(false),
    isPublic: new FormControl(false),
    rules: new FormArray([], Validators.minLength(1)),
    itemRules: new FormArray([]),
    sortRule: new FormGroup({
      field: new FormControl(null),
      sortDesc: new FormControl(true)
    }),
    lastModified: new FormControl({value: new Date(), disabled: true}),
    createdBy: new FormControl(),
    createdById: new FormControl(),
  });
  private sm = new SubscriptionManager();
  hasPanelBeenOpened = {
    columns: false,
    rules: true,
    itemRules: false
  };
  showAllColumns = true;
  lastCalculationTime: number;


  get itemRules(): FormArray {
    return this.form.get('itemRules') as FormArray;
  }

  get rules(): FormArray {
    return this.form.get('rules') as FormArray;
  }

  get columns(): FormArray {
    return this.form.get('columns') as FormArray;
  }

  constructor(
    private authService: AuthService,
    public dialogRef: MatDialogRef<ConfigureComponent>,
    @Inject(MAT_DIALOG_DATA) public dashboard: Dashboard | any,
    private auctionService: AuctionsService,
    public service: DashboardService,
    private professionService: ProfessionService) {
    this.populateForm(dashboard);
  }

  ngOnInit(): void {
    if (this.dashboard) {
      this.tmpBoard = {
        ...this.dashboard,
        data: [...this.dashboard.data]
      }; // DashboardCalculateUtil.calculate(this.dashboard, this.auctionService.mapped.value);
      this.isDefaultBoard = this.service.defaultMap.value.has(this.dashboard.id);
      Report.send('Editing existing board', 'Dashboard.ConfigureComponent');
    } else {
      Report.send('Creating new board', 'Dashboard.ConfigureComponent');
    }
    this.isAuthenticated = this.authService.isAuthenticated.value;
  }

  ngAfterViewInit() {
    this.sm.add(this.form.valueChanges, () => {
      this.lastCalculationTime = +new Date();
      setTimeout(() => {
        const timeDiff = +new Date() - this.lastCalculationTime;
        if (timeDiff >= 1000) {
          this.onEvent();
        }
      }, 1000);
    });
  }

  private populateForm(board: Dashboard) {
    if (!board) {
      // this.addDefaultColumns();
      return;
    }
    Report.debug('Configuring board', board);
    this.form.controls.id.setValue(board.id, {emitEvent: false});
    this.form.controls.parentId.setValue(board.parentId, {emitEvent: false});
    this.form.controls.idParam.setValue(board.idParam, {emitEvent: false});

    this.form.controls.title.setValue(board.title, {emitEvent: false});
    this.form.controls.description.setValue(board.description, {emitEvent: false});
    this.form.controls.tags.setValue(board.tags, {emitEvent: false});
    this.form.controls.onlyItemsWithRules.setValue(board.onlyItemsWithRules, {emitEvent: false});
    this.form.controls.sortOrder.setValue(board.sortOrder, {emitEvent: false});

    this.form.controls.isDisabled.setValue(board.isDisabled || false, {emitEvent: false});
    this.form.controls.lastModified.setValue(new Date(board.lastModified), {emitEvent: false});

    this.form.controls.createdBy.setValue(board.createdBy, {emitEvent: false});
    this.form.controls.createdById.setValue(board.createdById, {emitEvent: false});
    this.form.controls.isPublic.setValue(board.isPublic, {emitEvent: false});
  }

  onEvent(board: Dashboard = this.form.getRawValue()) {
    this.tmpBoard = DashboardCalculateUtil.calculate(board, this.auctionService.mapped.value);
    this.hasChanges = true;
  }

  onSave(): void {
    const board: Dashboard = this.form.getRawValue();
    if (this.dashboard && this.dashboard.id) {
      Report.send('Saved existing board', 'Dashboard.ConfigureComponent');
    } else {
      Report.send('Saving a new board', 'Dashboard.ConfigureComponent');
    }
    board.lastModified = +new Date();

    if (board.isPublic && this.isAuthenticated) {
      this.service.saveToPublicDataset(board)
        .catch(console.error);
    } else if (this.dashboard && !board.isPublic && this.dashboard.isPublic && this.isAuthenticated) {
      this.service.deletePublicEntry(board)
        .catch(console.error);
    } else {
      this.service.save(board);
    }
    this.event.emit();
    this.dialogRef.close();
  }

  onDiscard(): void {
    if (this.isDefaultBoard && this.dashboard) {
      const original: Dashboard = this.getDefaultBoard();
      ObjectUtil.overwrite(original, this.dashboard);
    }
    this.populateForm(this.dashboard);
    this.event.emit();
    Report.send('Closing board', 'Dashboard.ConfigureComponent');
    this.dialogRef.close();
  }

  private getDefaultBoard(): Dashboard {
    return getDefaultDashboards(this.professionService.list.value)
      .filter(board => board.id === this.dashboard.id)[0];
  }

  onDelete() {
    const board: Dashboard = this.dashboard;
    if (board.isPublic && this.isAuthenticated) {
      this.service.deletePublicEntry(board, true)
        .catch(console.error);
    } else {
      this.service.delete(board);
    }
    this.event.emit();
    this.dialogRef.close();
  }

  reset(): void {
    const defaultBoards = getDefaultDashboards(this.professionService.list.value);
    for (let i = 0; i < defaultBoards.length; i++) {
      if (this.dashboard.id === defaultBoards[i].id || this.dashboard.parentId === defaultBoards[i].id) {
        this.form.reset(defaultBoards[i]);
        this.dashboard = defaultBoards[i];
        // this.populateForm(defaultBoards[i]);
        setTimeout(() => this.onSave());
        return;
      }
    }
  }
}