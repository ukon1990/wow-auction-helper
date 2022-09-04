import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {ProspectingAndMillingUtil} from '../../../../utils/prospect-milling.util';
import {SharedService} from '../../../../services/shared.service';
import {ColumnDescription, Item, Remains, RemainsSource} from '@shared/models';
import {Report} from '../../../../utils/report.util';

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
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'count', title: 'Count', dataType: 'input-number'},
    {key: '', title: 'Actions', dataType: 'action', actions: ['remove-from-list']}
  ];

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

    Report.send(`${this.isEditing ? 'Edited' : 'Added'} - ${this.newRemains.name}`, `Shuffle`);
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