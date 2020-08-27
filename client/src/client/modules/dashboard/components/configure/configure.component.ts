import {AfterViewInit, Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {faSave} from '@fortawesome/free-solid-svg-icons/faSave';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {ObjectUtil} from '@ukon1990/js-utilities';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {ruleFields} from '../../data/rule-fields.data';
import {Profession} from '../../../../../../../api/src/profession/model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {DashboardV2} from '../../models/dashboard-v2.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DashboardCalculateUtil} from '../../utils/dashboard-calculate.util';
import {AuctionsService} from '../../../../services/auctions.service';
import {faUndo} from '@fortawesome/free-solid-svg-icons/faUndo';

@Component({
  selector: 'wah-configure',
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss']
})
export class ConfigureComponent implements OnInit, AfterViewInit {
  @Output() event: EventEmitter<void> = new EventEmitter<void>();
  fields = ruleFields;
  professions: Profession[] = [];
  tmpBoard: DashboardV2;

  faSave = faSave;
  faTrash = faTrashAlt;
  faUndo = faUndo;

  hasChanges: boolean;
  form: FormGroup = new FormGroup({
    id: new FormControl(),
    parentId: new FormControl(),
    idParam: new FormControl(),
    title: new FormControl(null, Validators.required),
    columns: new FormArray([]),
    onlyItemsWithRules: new FormControl(false),
    isDisabled: new FormControl(false),
    rules: new FormArray([], Validators.minLength(1)),
    itemRules: new FormArray([]),
    sortRule: new FormGroup({
      field: new FormControl(null),
      sortDesc: new FormControl(true)
    }),
  });
  private sm = new SubscriptionManager();
  hasPanelBeenOpened = {
    columns: false,
    rules: true,
    itemRules: false
  };
  showAllColumns = true;


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
    public dialogRef: MatDialogRef<ConfigureComponent>,
    @Inject(MAT_DIALOG_DATA) public dashboard: DashboardV2 | any,
    private auctionService: AuctionsService) {
    this.populateForm(dashboard);
  }

  ngOnInit(): void {
    if (this.dashboard) {
      this.tmpBoard = DashboardCalculateUtil.calculate(this.dashboard, this.auctionService.mapped.value);
    }
  }

  ngAfterViewInit() {
    this.sm.add(this.form.valueChanges, () =>
      setTimeout(() => this.onEvent()));
  }

  private populateForm(board: DashboardV2) {
    if (!board) {
      // this.addDefaultColumns();
      return;
    }
    this.form.controls.id.setValue(board.id);
    this.form.controls.parentId.setValue(board.parentId);
    this.form.controls.idParam.setValue(board.idParam);

    this.form.controls.title.setValue(board.title);
    this.form.controls.onlyItemsWithRules.setValue(board.onlyItemsWithRules);

    this.form.controls.isDisabled.setValue(board.isDisabled);

    /*
    if (board.columns) {
      board.columns.forEach(column => {
        this.addColumn(undefined, column);
      });
    }*/
  }

  onEvent(board: DashboardV2 = this.form.getRawValue()) {
    this.tmpBoard = DashboardCalculateUtil.calculate(board, this.auctionService.mapped.value);
    this.hasChanges = true;
    /*
    if (!this.dashboard) {
      this.hasChanges = true;
    } else {
      const currentBoard: DashboardV2 = ObjectUtil.merge(
        board,
        ObjectUtil.clone(this.dashboard)
      ) as DashboardV2;
      this.hasChanges = !!ObjectUtil.getDifference(this.dashboard, currentBoard).length;
    }*/
  }

  onSave(): void {
    // TODO: Needs to be able to calculate individual dashboards
    if (this.dashboard) {
      ObjectUtil.overwrite(this.form.getRawValue(), this.dashboard);
      // DefaultDashboardSettings.save(this.clone);
      // Calculate
    } else {
      // Save
      // Calculate
    }
    this.event.emit();
    this.dialogRef.close();
  }

  onDiscard(): void {
    this.populateForm(this.dashboard);
    this.event.emit();
    this.dialogRef.close();
  }

  onDelete() {
    console.error('Delete is not implemented');
  }
}
