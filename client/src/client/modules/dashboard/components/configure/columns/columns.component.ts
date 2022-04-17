import {AfterViewInit, Component, Input, OnDestroy} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {ruleFields} from '../../../data/rule-fields.data';
import {ColumnDescription} from '@shared/models';
import {columnConfig} from '../../../data/columns.data';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {ErrorReport} from '../../../../../utils/error-report.util';
import {Report} from '../../../../../utils/report.util';
import {SortRule} from "@shared/models/dashboard/sort-rule.model";

@Component({
  selector: 'wah-columns',
  templateUrl: './columns.component.html',
  styleUrls: ['./columns.component.scss']
})
export class ColumnsComponent implements AfterViewInit, OnDestroy {
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

  ngAfterViewInit(): void {
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
    try {
      const {previousIndex, currentIndex} = event;
      Report.debug(`Moved column from ${previousIndex} to ${currentIndex}`, event);
      if (previousIndex !== currentIndex &&
        previousIndex !== undefined && currentIndex !== undefined) {
        const column = this.formArray.at(previousIndex);
        this.formArray.removeAt(previousIndex);
        this.formArray.insert(currentIndex, column);
      }
      Report.send(
        'Rearranged board',
        'DashboardItemsComponent.drop',
        `Moved board from ${previousIndex} to ${currentIndex}`);
    } catch (error) {
      ErrorReport.sendError('ColumnComponent.drop', error);
    }
  }
}