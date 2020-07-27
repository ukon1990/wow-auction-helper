import {AfterViewInit, Component, Input, OnDestroy} from '@angular/core';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {conditionLocale} from 'client/modules/dashboard/types/condition.enum';
import {ruleFields} from '../../../data/rule-fields.data';
import {Rule} from '../../../models/rule.model';
import {ProfessionService} from '../../../../crafting/services/profession.service';
import {Profession} from '../../../../../../../../api/src/profession/model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {GameBuild} from '../../../../../utils/game-build.util';
import { itemClasses } from 'client/models/item/item-classes';

@Component({
  selector: 'wah-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements AfterViewInit, OnDestroy {
  @Input() form: FormGroup;
  @Input() rules: Rule[];
  @Input() displayHeader: boolean;
  faTrash = faTrashAlt;
  conditionLocale = conditionLocale;
  fields = ruleFields;
  expansions = GameBuild.expansionMap;
  itemClasses = itemClasses.classes;
  professions: Profession[] = [];
  sm = new SubscriptionManager();

  get formArray(): FormArray {
    return this.form.get('rules') as FormArray;
  }

  constructor(private professionService: ProfessionService) {
    this.sm.add(this.professionService.listWithRecipes,
      list =>
        this.professions = list);
  }

  ngAfterViewInit(): void {
    if (this.rules) {
      this.rules.forEach(rule =>
        this.addRule(undefined, rule));
    }
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
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

  isFieldType(i: number, type: string) {
    const field = this.formArray.controls[i].value.field;
    return field ? field.indexOf(type) > -1 : false;
  }
}
