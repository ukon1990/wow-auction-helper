import {Component} from '@angular/core';
import {BaseComponent} from '../base.component';
import {ColumnTypeEnum} from '@shared/enum';
import {ThemeUtil} from '../../../../core/utils/theme.util';
import {Theme} from '../../../../core/models/theme.model';
import {MatSelectChange} from '@angular/material/select';

@Component({
  selector: 'wah-form-controller-column',
  templateUrl: './form-controller-column.component.html',
  styleUrls: ['./form-controller-column.component.scss']
})
export class FormControllerColumnComponent extends BaseComponent {
  ColumnTypeEnum = ColumnTypeEnum;
  theme: Theme = ThemeUtil.current;


  onSelectionChange({value}: MatSelectChange): void {
    if (this.column?.options) {
      const columnValue = this.row[this.column.key];
      if (columnValue.id && this.column?.options.data) {
        const result = this.column?.options.data.filter(option => option.id === value);
        if (result && result[0]) {
          this.row[this.column.key] = result[0];
        }
      } else {
        this.row[this.column.key] = value;
      }
    }
  }
}