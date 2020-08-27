import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {ruleFields} from '../../../../data/rule-fields.data';
import {GameBuild} from '../../../../../../utils/game-build.util';
import {Profession} from '../../../../../../../../../api/src/profession/model';
import {conditionLocale} from 'client/modules/dashboard/types/condition.enum';
import {itemClasses} from 'client/models/item/item-classes';
import {ProfessionService} from '../../../../../crafting/services/profession.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {Rule} from '../../../../models/rule.model';
import {TextUtil} from '@ukon1990/js-utilities';

@Component({
  selector: 'wah-rule',
  templateUrl: './rule.component.html',
  styleUrls: ['./rule.component.scss']
})
export class RuleComponent implements OnInit, OnDestroy {
  @Input() formGroup: FormGroup;
  @Input() rules: Rule[];
  @Input() index: number;
  @Input() isOrRule: boolean;
  @Output() remove: EventEmitter<void> = new EventEmitter<void>();
  fields = ruleFields;
  conditionLocale = conditionLocale;
  expansions = GameBuild.expansionMap;
  itemClasses = itemClasses.classes;
  professions: Profession[] = [];
  mainFieldType = {
    isProfession: false,
    isExpansion: false,
    isItemClass: false
  };

  sm = new SubscriptionManager();
  faTrash = faTrashAlt;
  faPlus = faPlus;

  get orRules(): FormArray {
    return this.formGroup.get('or') as FormArray;
  }

  constructor(private professionService: ProfessionService) {
    this.sm.add(this.professionService.listWithRecipes,
      list =>
        this.professions = list);
  }

  ngOnInit(): void {
    if (this.rules) {
      this.rules.forEach(rule =>
        this.addOrRule(rule));
    }
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  shouldDisplayInputField(index: number): boolean {
    return !this.isFieldType(index, 'profession') &&
      !this.isFieldType(index, 'expansion') &&
      !this.isFieldType(index, 'itemClass');
  }

  isFieldType(i: number, type: string) {
    const field = this.formGroup.value.field;
    return field ? TextUtil.contains(field, type) : false;
  }

  addOrRule(rule?: Rule) {
    const form = new FormGroup({
      condition: new FormControl(rule ? rule.condition : null, Validators.required),
      targetValueType: new FormControl(rule ? rule.targetValueType : null, Validators.required),
      field: new FormControl(rule ? rule.field : null, Validators.required),
      toField: new FormControl(rule ? rule.toField : null),
      toValue: new FormControl(rule ? rule.toValue : null),
      or: new FormArray([]),
    });
    (this.formGroup.controls.or as FormArray).push(form);
  }
}
