import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Dashboard} from '../../models/dashboard.model';
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

@Component({
  selector: 'wah-configure',
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss']
})
export class ConfigureComponent implements OnChanges {
  @Input() dashboard: Dashboard;
  @Output() event: EventEmitter<void> = new EventEmitter<void>();

  conditionLocale = conditionLocale;
  fields = ruleFields;
  professions: Profession[] = [];

  faSave = faSave;
  faTrash = faTrashAlt;
  clone: DashboardV2;
  hasChanges: boolean;
  form: FormGroup = new FormGroup({
    title: new FormControl(null, Validators.required),
    columns: new FormArray([]),
    onlyItemsWithRules: new FormControl(false),
    isDisabled: new FormControl(false),
    rules: new FormArray([]),
    itemRules: new FormArray([]),
    sortRule: new FormGroup({
      field: new FormControl(null),
      sortDesc: new FormControl(true)
    }),
  });
  private sm = new SubscriptionManager();

  get rules(): FormArray {
    return this.form.get('rules') as FormArray;
  }

  get itemRules(): FormArray {
    return this.form.get('itemRules') as FormArray;
  }

  private baseRuleConfig = {
    condition: [null, Validators.required],
    targetValueType: [null, Validators.required],
    field: [null, Validators.required],
    toField: null,
    toValue: null,
  };

  constructor(private fb: FormBuilder, private professionService: ProfessionService) {
    this.sm.add(this.professionService.listWithRecipes,
      list =>
        this.professions = list);
  }

  ngOnChanges({dashboard}: SimpleChanges) {
    if (dashboard && dashboard.currentValue) {
      const board: DashboardV2 = dashboard.currentValue;
      this.clone = ObjectUtil.clone(board) as DashboardV2;

      this.populateForm(board);
    }
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

    if (board.rules) {
      board.rules.forEach(rule =>
        this.addRule(undefined, rule));
    }
    if (board.rules) {
      board.itemRules.forEach(rule =>
        this.addItemRule(undefined, rule));
    }
  }

  addRule(formArray: FormArray = this.form.controls.rules as FormArray, rule?: Rule): void {
    const form = new FormGroup({
      condition: new FormControl(rule ? rule.condition : null, Validators.required),
      targetValueType: new FormControl(rule ? rule.targetValueType : null, Validators.required),
      field: new FormControl(rule ? rule.field : null, Validators.required),
      toField: new FormControl(rule ? rule.toField : null),
      toValue: new FormControl(rule ? rule.toValue : null),
    });
    formArray.push(form);
  }

  addItemRule(formArray: FormArray = this.form.controls.itemRules as FormArray, itemRule?: ItemRule): void {
    const form = new FormGroup({
      itemId: new FormControl(itemRule ? itemRule.itemId : null, Validators.required),
      bonusIds: new FormControl(itemRule ? itemRule.bonusIds : null),
      petSpecies: new FormControl(itemRule ? itemRule.petSpeciesId : null),
      rules: new FormArray([]),
    });

    if (itemRule) {
      itemRule.rules.forEach(rule =>
        this.addRule(form.controls.rules as FormArray, rule));
    }

    formArray.push(form);
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
      this.hasChanges = !!ObjectUtil.getDifference(this.dashboard.settings, settings).length);
  }

  onSave(): void {
    // TODO: Needs to be able to calculate individual dashboards
    if (this.dashboard.settings) {
      ObjectUtil.overwrite(this.clone, this.dashboard.settings);
      // DefaultDashboardSettings.save(this.clone);
      // Calculate
    } else {
      // Save
      // Calculate
    }
    this.event.emit();
  }

  onDiscard(): void {
    this.clone = ObjectUtil.clone(this.dashboard) as DashboardV2;

    this.event.emit();
  }
}
