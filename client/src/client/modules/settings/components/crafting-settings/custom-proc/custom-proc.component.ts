import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {SharedService} from '../../../../../services/shared.service';
import {ColumnDescription} from '../../../../table/models/column-description';
import {CraftingUtil} from '../../../../crafting/utils/crafting.util';
import {CustomProc} from '../../../../crafting/models/custom-proc.model';
import {Recipe} from '../../../../crafting/models/recipe';
import {Report} from '../../../../../utils/report.util';
import {CustomProcUtil} from '../../../../crafting/utils/custom-proc.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {TextUtil} from '@ukon1990/js-utilities';

@Component({
  selector: 'wah-custom-proc',
  templateUrl: './custom-proc.component.html',
  styleUrls: ['./custom-proc.component.scss']
})
export class CustomProcComponent implements OnInit, OnDestroy {
  @Input() itemID: number;

  itemSearchForm: FormControl = new FormControl();
  filteredItems: any[];
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  customProcs: CustomProc[] = [];
  sm = new SubscriptionManager();

  constructor(private _formBuilder: FormBuilder) {

    this.sm.add(this.itemSearchForm.valueChanges, (name) => {
      this.filteredItems = this.filter(name);
    });
    this.columns.push({key: 'rank', title: 'Rank', dataType: ''});
    this.columns.push({key: 'name', title: 'Name', dataType: 'name'});
    this.columns.push({key: 'profession', title: 'Profession', dataType: ''});
    this.columns.push({key: 'rate', title: 'Rate', dataType: 'input-number'});
    this.columns.push({key: '', title: 'Actions', dataType: 'action', actions: ['custom-procs-delete']});
  }

  ngOnInit(): void {
    this.setCustomProcs();
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
    CustomProcUtil.save();
    CraftingUtil.calculateCost();
  }

  add(recipe: Recipe): void {
    this.itemSearchForm.setValue('');
    CustomProcUtil.add(recipe);
    this.setCustomProcs();
    Report.send('Added custom proc', 'Custom proc');
  }

  setCustomProcs(): void {
    this.customProcs = [...SharedService.user.customProcs];
    console.log('Custom procs', JSON.stringify(this.customProcs));
  }

  /**
   * Such efficient, such ugh
   * @param name Item name for the query
   */
  private filter(name: string): Array<Recipe> {
    return SharedService.recipes.filter(i =>
      TextUtil.contains(i.name, name)).slice(0, 20);
  }

  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }

  resetToDefault(): void {
    SharedService.user.customProcs = [];
  }
}
