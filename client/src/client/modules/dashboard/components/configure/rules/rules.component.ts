import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {Rule} from "@shared/models/dashboard";

@Component({
  selector: 'wah-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit, OnDestroy, OnChanges {
  @Input() form: FormGroup;
  @Input() rules: Rule[];
  @Input() displayHeader: boolean;

  sm = new SubscriptionManager();

  get formArray(): FormArray {
    return this.form.get('rules') as FormArray;
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

  addRule(formArray: FormArray = this.formArray, rule?: Rule): void {
    const form = new FormGroup({
      condition: new FormControl(rule ? rule.condition : null, Validators.required),
      targetValueType: new FormControl(rule ? rule.targetValueType : null, Validators.required),
      field: new FormControl(rule ? rule.field : null, Validators.required),
      toField: new FormControl(rule ? rule.toField : null),
      toValue: new FormControl(rule ? rule.toValue : null),
      or: new FormArray([]),
    });

    if (rule && rule.or) {
      rule.or.forEach(orRule =>
        this.addRule(form.controls.or as FormArray, orRule));
    }
    formArray.push(form);
  }


}