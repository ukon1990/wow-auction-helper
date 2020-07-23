import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {conditionLocale} from 'client/modules/dashboard/types/condition.enum';
import {ruleFields} from '../../../data/rule-fields.data';
import {Rule} from '../../../models/rule.model';

@Component({
    selector: 'wah-rules',
    templateUrl: './rules.component.html',
    styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements AfterViewInit {
    @Input() form: FormGroup;
    @Input() rules: Rule[];
    faTrash = faTrashAlt;
    conditionLocale = conditionLocale;
    fields = ruleFields;

    get formArray(): FormArray {
        return this.form.get('rules') as FormArray;
    }

    constructor() {
    }

    ngAfterViewInit(): void {
        if (this.rules) {
            this.rules.forEach(rule =>
                this.addRule(undefined, rule));
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
}
