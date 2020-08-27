import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {ruleFields} from '../../../data/rule-fields.data';
import {ColumnDescription} from '../../../../table/models/column-description';
import {columnConfig} from '../../../data/columns.data';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {SortRule} from '../../../models/dashboard-v2.model';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'wah-columns',
  templateUrl: './columns.component.html',
  styleUrls: ['./columns.component.scss']
})
export class ColumnsComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;
  @Input() columns: ColumnDescription[];
  @Input() sortOrder: SortRule;
  @Input() displayHeader: boolean;
  selectedColumns: ColumnDescription[] = [];
  faTrash = faTrashAlt;
  fields = ruleFields;
  columnSelectionField: FormControl = new FormControl(columnConfig.item.name, Validators.required);
  sm = new SubscriptionManager();

  get formArray(): FormArray {
    return this.form.get('columns') as FormArray;
  }

  get sortRuleGroup(): FormGroup {
    return this.form.get('sortRule') as FormGroup;
  }

  ngOnInit(): void {
    if (this.sortOrder) {
      this.sortRuleGroup.controls.field.setValue(this.sortOrder.field);
      this.sortRuleGroup.controls.sortDesc.setValue(this.sortOrder.sortDesc);
    }

    this.formArray.clear();
    if (!this.columns) {
      this.addDefaultColumns();
    } else {
      this.columns.forEach(column =>
        this.addColumn(undefined, column));
      this.selectedColumns = this.formArray.getRawValue();
    }
    this.sm.add(this.formArray.valueChanges,
      (values) => this.selectedColumns = values);
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
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

  addColumn(formArray: FormArray = this.formArray,
            column: ColumnDescription = this.columnSelectionField.value as ColumnDescription): void {
    const form = new FormGroup({
      key: new FormControl({
        value: column ? column.key : null,
        disabled: true
      }, Validators.required),
      title: new FormControl(column ? column.title : null, Validators.required),
      dataType: new FormControl({
        value: column ? column.dataType : null, disabled: true
      }, Validators.required),
      hideOnMobile: new FormControl(column ? column.hideOnMobile || false : false),
    });
    formArray.push(form);
  }

  drop(event: CdkDragDrop<FormGroup[]>) {
    const column = this.formArray.at(event.previousIndex);
    this.formArray.removeAt(event.previousIndex);
    this.formArray.insert(event.currentIndex, column);
    // moveItemInArray(this.formArray.controls, event.previousIndex, event.currentIndex);
  }
}
