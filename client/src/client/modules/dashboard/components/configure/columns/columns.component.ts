import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {Rule} from '../../../models/rule.model';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {ruleFields} from '../../../data/rule-fields.data';
import {ColumnDescription} from '../../../../table/models/column-description';
import {columnConfig} from '../../../data/columns.data';
import {SubscriptionManager} from '@ukon1990/subscription-manager';

@Component({
  selector: 'wah-columns',
  templateUrl: './columns.component.html',
  styleUrls: ['./columns.component.scss']
})
export class ColumnsComponent implements AfterViewInit {
  @Input() form: FormGroup;
  @Input() columns: ColumnDescription[];
  @Input() displayHeader: boolean;
  faTrash = faTrashAlt;
  fields = ruleFields;
  columnSelectionField: FormControl = new FormControl(columnConfig.item.name, Validators.required);
  sm = new SubscriptionManager();

  get formArray(): FormArray {
    return this.form.get('columns') as FormArray;
  }

  ngAfterViewInit(): void {
   //  this.sm.add(this.columnSelectionField.valueChanges, column => {});
    if (this.columns) {
      this.columns.forEach(column =>
        this.addColumn(undefined, column));
    }
  }

  addColumn(formArray: FormArray = this.form.controls.rules as FormArray,
            column: ColumnDescription = this.columnSelectionField.value as ColumnDescription): void {
    const form = new FormGroup({
      key: new FormControl(column ? column.key : null, Validators.required),
      title: new FormControl(column ? column.title : null, Validators.required),
      dataType: new FormControl(column ? column.dataType : null, Validators.required),
      hideOnMobile: new FormControl(column ? column.hideOnMobile : null),
    });
    formArray.push(form);
  }
}
