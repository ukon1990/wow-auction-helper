import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ColumnDescription } from '../../../models/column-description';
import { Remains, RemainsSource } from '../../../models/item/remains.model';
import { } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Item } from '../../../models/item/item';
import { SharedService } from '../../../services/shared.service';
import { ProspectingAndMillingUtil } from '../../../utils/prospect-milling.util';
import { Angulartics2 } from 'angulartics2';

@Component({
  selector: 'wah-shuffle-item-manage',
  templateUrl: './shuffle-item-manage.component.html',
  styleUrls: ['./shuffle-item-manage.component.scss']
})
export class ShuffleItemManageComponent implements OnInit {
  @Input() sourceList: Remains[];
  @Input() isEditing: boolean;
  @Input() newRemains: Remains;
  @Output() close: EventEmitter<any> = new EventEmitter<any>();
  filteredItems: Observable<Array<Item>>;
  itemSearchForm: FormControl = new FormControl();
  itemSourceColumns: ColumnDescription[] = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'count', title: 'Count', dataType: 'input-number'},
    { key: '', title: 'Actions', dataType: 'action', actions: ['remove-from-list'] }
  ];

  constructor(private angulartics2: Angulartics2) {
    this.filteredItems = this.itemSearchForm.valueChanges
    .pipe(
      startWith(''),
      map(name => this.filter(name))
    );
  }

  ngOnInit() {
    setTimeout(console.log(this.newRemains), 100);
  }

  updateTargetItem(target: RemainsSource): void {
    RemainsSource.update(target.count, this.newRemains, target);
  }

  save(): void {
    Remains.updateSourcesDropChance(this.newRemains);
    if (!this.isEditing) {
      this.sourceList.unshift(this.newRemains);
      this.newRemains = undefined;
      this.sourceList = undefined;
    }
    // TODO: Just do this for that item!
    ProspectingAndMillingUtil.calculateCost();

    ProspectingAndMillingUtil.save();
    this.closeEditWindow();

    this.angulartics2.eventTrack.next({
      action: `${ this.isEditing ? 'Edited' : 'Added' } - ${ this.newRemains.name }`,
      properties: { category: `Shuffle` },
    });
  }

  setItemSource(item: Item): void {
    this.newRemains = new Remains(item);
    this.itemSearchForm.reset();
  }

  addSource(item: Item): void {
    Remains.addSource(item, this.newRemains);
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

  closeEditWindow(): void {
    this.close.emit('');
  }
}
