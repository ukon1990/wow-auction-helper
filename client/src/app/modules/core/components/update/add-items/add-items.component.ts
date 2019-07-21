import {Component, OnInit} from '@angular/core';
import {ItemService} from '../../../../../services/item.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SharedService} from '../../../../../services/shared.service';

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
    {title: 'Name', key: 'name', dataType: 'string'},
    {title: 'Is new', key: 'isNew', dataType: 'boolean'}
  ];
  columnsFailed = [
    {title: 'ID', key: 'spellID', dataType: 'string'},
    {title: 'Message', key: 'message', dataType: 'string'},
  ];
  form: FormGroup;

  constructor(private service: ItemService, private fb: FormBuilder) {
    this.form = this.fb.group({
      input: new FormControl(),
      action: new FormControl(this.dbActions[0])
    });
  }

  ngOnInit() {
  }

  setMissingReagentItems(): void {
    const list = [];
    SharedService.recipes.forEach(recipe => {
      if (!SharedService.items[recipe.itemID] && recipe.itemID) {
        list.push(recipe.itemID);
      }

      recipe.reagents.forEach(reagent => {
        if (!SharedService.items[reagent.itemID] && reagent.itemID) {
          list.push(reagent.itemID);
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
    this.addItem(0);
  }

  async addItem(index: number) {
    const id = this.progress.ids[index];
    if (this.shouldUpdate()) {
      await this.service.updateItem(id)
        .then((item) =>
          this.handleServiceResult(item, id))
        .catch((error) => {
          this.progress.failed.push({id: id, message: error});
        });
    } else {
      if (SharedService.items[id] && !this.shouldUpdate()) {
        this.progress.existing.push({id: id, name: SharedService.items[id].name, isNew: false});
      } else {
        await this.service.addItem(id)
          .then((item) =>
            this.handleServiceResult(item, id))
          .catch((error) => {
            this.progress.failed.push({id: id, message: error});
          });
      }
    }
    index++;
    if (index < this.progress.ids.length) {
      this.addItem(index);
    }
  }

  private handleServiceResult(item, id) {
    if (item['error']) {
      this.progress.failed.push({id: id, message: item['error']});
      return;
    }
    this.progress.new.push({id: id, name: item.name, isNew: true});
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
}
