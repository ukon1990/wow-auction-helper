import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {FormBuilder, FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {startWith, map} from 'rxjs/operators';
import {SharedService} from '../../../../../services/shared.service';
import {Item} from '../../../../../models/item/item';
import {CustomPrice, CustomPrices} from '../../../../crafting/models/custom-price';
import {ColumnDescription} from '../../../../table/models/column-description';
import {CraftingUtil} from '../../../../crafting/utils/crafting.util';
import {Angulartics2} from 'angulartics2';
import {CustomProc} from '../../../../crafting/models/custom-proc.model';
import {Recipe} from '../../../../crafting/models/recipe';
import {customProcsDefault} from '../../../../crafting/models/default-custom-procs';
import {Report} from '../../../../../utils/report.util';
import {CustomProcUtil} from '../../../../crafting/utils/custom-proc.util';

@Component({
  selector: 'wah-custom-proc',
  templateUrl: './custom-proc.component.html',
  styleUrls: ['./custom-proc.component.scss']
})
export class CustomProcComponent implements OnInit, OnDestroy {

  itemSearchForm: FormControl = new FormControl();
  filteredItems: Observable<any>;
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  saveInterval: any;
  @Input() itemID: number;

  constructor(private _formBuilder: FormBuilder) {
    this.filteredItems = this.itemSearchForm.valueChanges
      .pipe(
        startWith(''),
        map(name => this.filter(name))
      );
    this.columns.push({key: 'rank', title: 'Rank', dataType: ''});
    this.columns.push({key: 'name', title: 'Name', dataType: 'name'});
    this.columns.push({key: 'profession', title: 'Profession', dataType: ''});
    this.columns.push({key: 'rate', title: 'Rate', dataType: 'input-number'});
    this.columns.push({key: '', title: 'Actions', dataType: 'action', actions: ['custom-procs-delete']});
  }

  ngOnInit(): void {
    this.saveInterval = setInterval(() => {
      if (JSON.stringify(SharedService.user.customProcs) !== localStorage['custom_procs']) {
        CustomProcUtil.save();
        CraftingUtil.calculateCost();
      }
    }, 500);
  }

  ngOnDestroy(): void {
    if (!this.itemID) {
      clearInterval(this.saveInterval);
    }
  }

  add(recipe: Recipe): void {
    this.itemSearchForm.setValue('');
    CustomProcUtil.add(recipe);

    Report.send('Added custom proc', 'Custom proc');
  }

  getCustomProcs(): Array<CustomProc> {
    return SharedService.user.customProcs;
  }

  customProcs(): CustomProcUtil {
    return CustomProcUtil;
  }

  /**
   * Such efficient, such ugh
   * @param name Item name for the query
   */
  private filter(name: string): Array<Recipe> {
    return SharedService.recipes.filter(i =>
      i.name.toLowerCase().indexOf(name.toLowerCase()) !== -1).slice(0, 20);
  }

  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }

  resetToDefault(): void {
    SharedService.user.customProcs = customProcsDefault;
  }
}
