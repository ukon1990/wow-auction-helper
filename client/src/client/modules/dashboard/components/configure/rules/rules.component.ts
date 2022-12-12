import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {Rule} from "@shared/models";

@Component({
  selector: 'wah-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit, OnDestroy, OnChanges {
  @Input() form: UntypedFormGroup;
  @Input() rules: Rule[];
  @Input() displayHeader: boolean;

  sm = new SubscriptionManager();

  get formArray(): UntypedFormArray {
    return this.form.get('rules') as UntypedFormArray;
  }

  ngOnInit(): void {
    if (this.rules) {
      this.formArray.clear();
      this.rules.forEach(rule =>
        this.addRule(undefined, rule));
    }
  }

  ngOnChanges({rules}: SimpleChanges): void {
    if (rules) {
      this.formArray.clear();
      (rules.currentValue || []).forEach(rule =>
        this.addRule(undefined, rule));
    }
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  addRule(formArray: UntypedFormArray = this.formArray, rule?: Rule): void {
    const form = new UntypedFormGroup({
      condition: new UntypedFormControl(rule ? rule.condition : null, Validators.required),
      targetValueType: new UntypedFormControl(rule ? rule.targetValueType : null, Validators.required),
      field: new UntypedFormControl(rule ? rule.field : null, Validators.required),
      toField: new UntypedFormControl(rule ? rule.toField : null),
      toValue: new UntypedFormControl(rule ? rule.toValue : null),
      or: new UntypedFormArray([]),
    });

    if (rule && rule.or) {
      rule.or.forEach(orRule =>
        this.addRule(form.controls.or as UntypedFormArray, orRule));
    }
    formArray.push(form);
  }


}