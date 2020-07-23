import {Component, EventEmitter, Inject, OnChanges, Output, SimpleChanges} from '@angular/core';
import {faSave} from '@fortawesome/free-solid-svg-icons/faSave';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {DefaultDashboardSettings} from '../../models/default-dashboard-settings.model';
import {ObjectUtil} from '@ukon1990/js-utilities';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {conditionLocale} from '../../types/condition.enum';
import {ruleFields} from '../../data/rule-fields.data';
import {Profession} from '../../../../../../../api/src/profession/model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ProfessionService} from '../../../crafting/services/profession.service';
import {ItemRule, Rule} from '../../models/rule.model';
import {DashboardV2} from '../../models/dashboard-v2.model';
import {ColumnDescription} from '../../../table/models/column-description';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'wah-configure',
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss']
})
export class ConfigureComponent {
  @Output() event: EventEmitter<void> = new EventEmitter<void>();

  conditionLocale = conditionLocale;
  fields = ruleFields;
  professions: Profession[] = [];

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


  get itemRules(): FormArray {
    return this.form.get('itemRules') as FormArray;
  }

  constructor(
    public dialogRef: MatDialogRef<ConfigureComponent>,
    @Inject(MAT_DIALOG_DATA) public dashboard: DashboardV2,
    private fb: FormBuilder, private professionService: ProfessionService) {
    this.sm.add(this.professionService.listWithRecipes,
      list =>
        this.professions = list);

      this.populateForm(dashboard);
  }

  private populateForm(board: DashboardV2) {
    this.form.controls.title.setValue(board.title);
    this.form.controls.onlyItemsWithRules.setValue(board.onlyItemsWithRules);
    this.form.controls.isDisabled.setValue(board.isDisabled);

    if (board.columns) {
      board.columns.forEach(column => {
        this.addColumn(undefined, column);
      });
    }
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

  onEvent(settings: DefaultDashboardSettings) {
    setTimeout(() =>
      this.hasChanges = !!ObjectUtil.getDifference(this.dashboard, settings).length);
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
