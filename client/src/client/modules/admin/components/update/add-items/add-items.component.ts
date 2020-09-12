import {Component, OnInit} from '@angular/core';
import {ItemService} from '../../../../../services/item.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SharedService} from '../../../../../services/shared.service';
import {NpcService} from '../../../../npc/services/npc.service';
import {Item} from '../../../../../models/item/item';
import {CraftingService} from '../../../../../services/crafting.service';

@Component({
  selector: 'wah-add-items',
  templateUrl: './add-items.component.html',
  styleUrls: ['./add-items.component.scss']
})
export class AddItemsComponent implements OnInit {
  dbActions = [
    'Insert',
    'Update'
  ];
  progress = {
    list: [],
    ids: [],
    new: [],
    existing: [],
    failed: []
  };
  input: FormControl = new FormControl();
  columns = [
    {title: 'ID', key: 'id', dataType: 'string'},
    {title: 'Name', key: 'name', dataType: 'name'},
    {title: 'Is new', key: 'isNew', dataType: 'boolean'}
  ];
  columnsFailedItem = [
    {title: 'ID', key: 'id', dataType: 'string'},
    {title: 'Message', key: 'message', dataType: 'string'},
  ];
  columnsFailed = [
    {title: 'ID', key: 'spellID', dataType: 'string'},
    {title: 'Message', key: 'message', dataType: 'string'},
  ];
  form: FormGroup;

  constructor(private service: ItemService, private fb: FormBuilder, private npcService: NpcService) {
    this.form = this.fb.group({
      input: new FormControl(),
      action: new FormControl(this.dbActions[0])
    });
  }

  ngOnInit() {
  }

  setMissingReagentItems(): void {
    const list = [];
    CraftingService.list.value.forEach(recipe => {
      if (!SharedService.items[recipe.itemID] && recipe.itemID) {
        list.push(recipe.itemID);
      }

      recipe.reagents.forEach(reagent => {
        if (!SharedService.items[reagent.id] && reagent.id) {
          list.push(reagent.id);
        }
      });
    });

    this.form.controls.input.setValue(list.join(','));
  }

  addItems(): void {
    Object.keys(this.progress).forEach(key => {
      this.progress[key] = [];
    });
    this.progress.ids = this.form.getRawValue().input.replace(/[ a-zA-z]/g, '').split(',');
    // this.addItem(0);
  }

  async addItem(index: number) {
    const concurrentLimit = 20;
    const ids = this.progress.ids.slice(index, index + concurrentLimit);
    await Promise.all(ids.map(async id =>
      await this.processItem(id)));
    index = index + concurrentLimit;
    if (index < this.progress.ids.length) {
      setTimeout(() => this.addItem(index));
    }
  }

  private async processItem(id) {
    if (this.shouldUpdate()) {
      await this.service.updateItem(id)
        .then((item) =>
          this.handleServiceResult(item, id))
        .catch((error) => {
          this.progress.failed.push({id: id, message: error});
        });
    } else {
      if (SharedService.items[id] && !this.shouldUpdate()) {
        const {name, icon}: Item = SharedService.items[id];
        this.progress.existing.push({id: id, name, icon, isNew: false});
      } else {/* TODO: remove?
        await this.service.addItem(id)
          .then((item) =>
            this.handleServiceResult(item, id))
          .catch((error) => {
            this.progress.failed.push({id: id, message: error});
          });*/
      }
    }
  }

  private handleServiceResult({error, name, icon}, id) {
    if (error) {
      this.progress.failed = [{id, message: error}, ...this.progress.failed];
      return;
    }
    this.progress.new = [{id, name, isNew: true, icon}, ...this.progress.new];
    console.log('Progress report', this.progress);
  }

  getProgress(): number {
    return this.getProgressCount() / this.progress.ids.length;
  }

  getProgressCount() {
    return this.progress.new.length + this.progress.existing.length + this.progress.failed.length;
  }

  private shouldUpdate() {
    return this.dbActions[1] === this.form.getRawValue().action;
  }

  addMissingNPCItems() {
    const map = {};
    NpcService.list.value.forEach(npc => {
      if (npc.sells) {
        npc.sells.forEach(({id}) => {
          if (!SharedService.items[id]) {
            map[id] = id;
          }
        });
      }
      if (npc.drops) {
        npc.drops.forEach(({id}) => {
          if (!SharedService.items[id]) {
            map[id] = id;
          }
        });
      }
    });

    console.log('Missing from NPC count', Object.keys(map).length);
    this.form.controls.input.setValue(Object.keys(map).join(','));
  }
}
