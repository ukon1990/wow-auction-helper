import {AfterViewInit, Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {faSave} from '@fortawesome/free-solid-svg-icons/faSave';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {ObjectUtil} from '@ukon1990/js-utilities';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ruleFields} from '../../data/rule-fields.data';
import {Profession} from '../../../../../../../api/src/profession/model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ProfessionService} from '../../../crafting/services/profession.service';
import {DashboardV2} from '../../models/dashboard-v2.model';
import {ColumnDescription} from '../../../table/models/column-description';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DashboardCalculateUtil} from '../../utils/dashboard-calculate.util';
import {AuctionsService} from '../../../../services/auctions.service';

@Component({
  selector: 'wah-configure',
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss']
})
export class ConfigureComponent implements AfterViewInit {
  @Output() event: EventEmitter<void> = new EventEmitter<void>();
  fields = ruleFields;
  professions: Profession[] = [];
  tmpBoard: DashboardV2;

  faSave = faSave;
  faTrash = faTrashAlt;
  hasChanges: boolean;
  form: FormGroup = new FormGroup({
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
    @Inject(MAT_DIALOG_DATA) public dashboard: DashboardV2,
    private auctionService: AuctionsService) {
    this.populateForm(dashboard);
    this.sm.add(this.form.valueChanges, (board: DashboardV2) => this.onEvent(board));
  }

  ngAfterViewInit(): void {
    if (this.dashboard) {
      this.tmpBoard = DashboardCalculateUtil.calculate(this.dashboard, this.auctionService.mapped.value);
    }
  }

  private populateForm(board: DashboardV2) {
    if (!board) {
      this.addDefaultColumns();
      return;
    }
    this.form.controls.title.setValue(board.title);
    this.form.controls.onlyItemsWithRules.setValue(board.onlyItemsWithRules);
    this.form.controls.isDisabled.setValue(board.isDisabled);

    if (board.columns) {
      board.columns.forEach(column => {
        this.addColumn(undefined, column);
      });
    }
  }

  private addDefaultColumns() {
    this.addColumn(undefined, {
      key: 'name', title: 'Name', dataType: 'name', options: {idName: 'id'}
    });
    this.addColumn(undefined, {
      key: 'buyout', title: 'Buyout', dataType: 'gold'
    });
    this.addColumn(undefined, {
      key: 'mktPrice',
      title: 'Market value',
      dataType: 'gold'
    });
    this.addColumn(undefined, {
      key: 'regionSaleRate',
      title: 'Sale rate',
      dataType: 'percent'
    });
  }

  addColumn(formArray: FormArray = this.form.controls.columns as FormArray, column?: ColumnDescription): void {
    const form = new FormGroup({
      key: new FormControl(column ? column.key : null, Validators.required),
      title: new FormControl(column ? column.title : null, Validators.required),
      dataType: new FormControl(column ? column.dataType : null, Validators.required),
      /*
      toField: new FormControl(column ? column.toField : null),
      toValue: new FormControl(column ? column.toValue : null),
      */
    });
    formArray.push(form);
  }

  onEvent(board: DashboardV2) {
    console.log('Board update', board);
    this.tmpBoard = DashboardCalculateUtil.calculate(board, this.auctionService.mapped.value);
    if (!this.dashboard) {
      this.hasChanges = true;
    } else {
      return;
      const currentBoard: DashboardV2 = ObjectUtil.merge(
        board,
        ObjectUtil.clone(this.dashboard)
      ) as DashboardV2;
      this.hasChanges = !!ObjectUtil.getDifference(this.dashboard, currentBoard).length;
    }
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
}
