import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {ruleFields} from '../../../../data/rule-fields.data';
import {GameBuild} from '@shared/utils';
import {Profession} from '@shared/models';
import {conditionLocale} from '@shared/enum';
import {ProfessionService} from '../../../../../crafting/services/profession.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {TextUtil} from '@ukon1990/js-utilities';
import {GoldPipe} from '../../../../../util/pipes/gold.pipe';
import {ItemLocale} from '../../../../../../language/item.locale';
import {RuleFieldGroup} from '../../../../models/rule-field.model';
import {ThemeUtil} from '../../../../../core/utils/theme.util';
import {ItemClassService} from '../../../../../item/service/item-class.service';
import {ItemClass} from '../../../../../item/models/item-class.model';
import {Rule} from "@shared/models";

@Component({
  selector: 'wah-rule',
  templateUrl: './rule.component.html',
  styleUrls: ['./rule.component.scss']
})
export class RuleComponent implements AfterViewInit, OnDestroy {
  @Input() formGroup: FormGroup;
  @Input() rules: Rule[];
  @Input() allRules: FormArray;
  @Input() index: number;
  @Input() isOrRule: boolean;
  @Output() remove: EventEmitter<void> = new EventEmitter<void>();
  theme = ThemeUtil.current;
  fields = ruleFields;
  conditionLocale = conditionLocale;
  expansions = GameBuild.expansionMap;
  itemClasses: ItemClass[] = ItemClassService.classes.value;
  itemQualities = ItemLocale.getQualities().list;
  // Must be true, in order for sub class to be selectable
  itemClassIdSelected: number;
  itemSubClasses: any[] = [];
  professions: Profession[] = [];
  mainFieldType = {
    isProfession: false,
    isExpansion: false,
    isItemClass: false,
    isItemSubClass: false,
    isQuality: false
  };
  toValueGold: number;

  sm = new SubscriptionManager();
  faTrash = faTrashAlt;
  faPlus = faPlus;
  private lastCharacterTyped: number;

  get orRules(): FormArray {
    return this.formGroup.get('or') as FormArray;
  }

  constructor(private professionService: ProfessionService) {
    this.sm.add(this.professionService.listWithRecipes,
      list =>
        this.professions = list);

    this.sm.add(ItemClassService.classes, classes => this.itemClasses = classes);
  }

  ngAfterViewInit(): void {
    if (this.rules) {
      this.rules.forEach(rule =>
        this.addOrRule(rule));
    }

    if (this.allRules && this.allRules instanceof FormArray) {
      this.setItemClassSelected(this.allRules.getRawValue());
      this.sm.add(this.allRules.valueChanges, value => this.setItemClassSelected(value));
    }

    this.toValueGold = this.formGroup.controls.toValue.value;
    this.setMainFieldType();
    this.enableOrDisableToField();
    this.enableOrDisableTargetValueTypeField();
    this.sm.add(this.formGroup.controls.field.valueChanges,
      value => this.handleFieldChange(value));
    this.sm.add(this.formGroup.controls.toField.valueChanges,
      value => this.enableOrDisableTargetValueTypeField(value));
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  shouldDisplayInputField(value?: string): boolean {
    return !this.isFieldType('profession', value) &&
      !this.isFieldType('expansion', value) &&
      !this.isFieldType('itemClass', value);
  }

  isFieldType(type: string, field: string = this.formGroup.value.field) {
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

  private handleFieldChange(value: string): void {
    this.setMainFieldType(value);
    this.enableOrDisableToField();
  }

  private enableOrDisableToField() {
    const canHaveComparisonToOtherField = this.shouldDisplayInputField();
    if (canHaveComparisonToOtherField) {
      this.formGroup.controls.toField.enable();
    } else {
      this.formGroup.controls.toField.disable();
    }
  }

  private enableOrDisableTargetValueTypeField(toField: string = this.formGroup.controls.toField.value): void {
    if (toField) {
      this.formGroup.controls.targetValueType.enable();
    } else {
      this.formGroup.controls.targetValueType.disable();
      this.resetFieldType();
    }
  }

  private resetFieldType() {
    let defaultType: string;
    this.fields.forEach(group =>
      group.options.forEach(col => {
        if (col.key === this.formGroup.controls.field.value) {
          defaultType = col.defaultType;
        }
      }));
    if (this.formGroup.controls.targetValueType.value !== defaultType) {
      this.formGroup.controls.targetValueType.setValue(defaultType);
    }
  }

  private setMainFieldType(value?: string) {
    // TOdO: Disable toField if these are selected
    this.mainFieldType.isExpansion = this.isFieldType('expansion', value);
    this.mainFieldType.isProfession = this.isFieldType('profession', value);
    this.mainFieldType.isItemSubClass = this.isFieldType('itemSubClass', value);
    this.mainFieldType.isItemClass = this.isFieldType('itemClass', value) && !this.mainFieldType.isItemSubClass;
    this.mainFieldType.isQuality = this.isFieldType('quality', value);

    const disableToField = Object.values(this.mainFieldType)
      .filter((isTrue: boolean) => isTrue);
    if (disableToField.length) {
      this.formGroup.controls.toField.disable({emitEvent: false});
    } else {
      this.formGroup.controls.toField.enable({emitEvent: false});
    }
  }

  setNewInputGoldValue(newValue: string) {
    const interval = 500;
    this.lastCharacterTyped = +new Date();
    setTimeout(() => {
      if (+new Date() - this.lastCharacterTyped >= interval) {
        this.toValueGold = GoldPipe.toCopper(newValue);
        this.lastCharacterTyped = undefined;
      }
    }, interval);
  }

  private setItemClassSelected(rules: Rule[]) {
    this.itemClassIdSelected = undefined;
    this.itemSubClasses = [];

    rules.forEach(rule => {
      if (this.isFieldType('itemClass', rule.field)) {
        this.itemClassIdSelected = +rule.toValue;
        const match = this.itemClasses
          .filter(cl => cl.id === +rule.toValue);
        if (match[0]) {
          this.itemSubClasses = match[0].subClasses;
        }
      }
    });

    if (this.itemClassIdSelected === undefined) {
      const relevantFields: RuleFieldGroup[] = [];
      ruleFields.forEach(field => {
        const matches = field.options.filter(option =>
          !TextUtil.contains(option.key, 'itemSubClass'));
        if (matches.length) {
          relevantFields.push({
            ...field,
            options: matches,
          });
        }
      });
      this.fields = relevantFields;
    } else {
      this.fields = ruleFields;
    }
  }
}