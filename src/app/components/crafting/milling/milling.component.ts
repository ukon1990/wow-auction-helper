import { Component, OnInit } from '@angular/core';
import { ProspectingAndMillingUtil } from '../../../utils/prospect-milling.util';
import { Remains, RemainsSource } from '../../../models/item/remains.model';
import { ColumnDescription } from '../../../models/column-description';
import { SharedService } from '../../../services/shared.service';
import { } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Item } from '../../../models/item/item';

@Component({
  selector: 'wah-milling',
  templateUrl: './milling.component.html',
  styleUrls: ['./milling.component.scss']
})
export class MillingComponent implements OnInit {
  filteredItems: Observable<Array<Item>>;
  itemSearchForm: FormControl = new FormControl();
  locale = localStorage['locale'].split('-')[0];
  columns: ColumnDescription[] = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'cost', title: 'Cost', dataType: 'gold' },
    { key: 'roi', title: 'ROI', dataType: 'gold' },
    { key: 'dropChance', title: 'Drop chance', dataType: 'percent' }
  ];

  itemSourceColumns: ColumnDescription[] = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'count', title: 'Count', dataType: 'input-number' },
    { key: 'outOf', title: 'Out of', dataType: 'input-number' }
  ];
  types = ProspectingAndMillingUtil.TYPES;
  milling: Remains[] = ProspectingAndMillingUtil.mills;
  prospecting: Remains[] = ProspectingAndMillingUtil.prospecting;
  isEditing: boolean;
  isEditingType;
  newRemains: Remains;
  sourceList: Remains[];

  constructor() {
    this.filteredItems = this.itemSearchForm.valueChanges
      .pipe(
        startWith(''),
        map(name => this.filter(name))
      );
  }

  ngOnInit() {
  }

  updateTargetItem(target: RemainsSource): void {
    target.update(target.count, target.cost);
  }

  add(): void {
    this.newRemains.updateSourcesDropChance();
    this.sourceList.unshift(this.newRemains);
    this.newRemains = undefined;
    this.sourceList = undefined;
  }

  setItemSource(item: Item): void {
    this.newRemains = new Remains(item);
    this.itemSearchForm.reset();
  }

  openEditWindow(list: Remains[]): void {
    this.isEditing = true;
    this.sourceList = list;
  }

  closeEditWindow(): void {
    this.isEditing = false;
  }

  restore(): void {
    // this.milling = JSON.parse();
  }

  save(): void {
    // localStorage[] = JSON.stringify();
  }

  /**
 * Such efficient, such ugh
 * @param name Item name for the query
 */
  private filter(name: string): Array<Item> {
    if (name === null) {
      name = '';
    }

    return SharedService.itemsUnmapped.filter(i =>
      i.name.toLowerCase().indexOf(name.toLowerCase()) !== -1).slice(0, 100);
  }
}
