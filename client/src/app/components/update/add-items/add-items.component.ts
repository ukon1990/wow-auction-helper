import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../../services/item.service';
import { FormControl } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { ColumnDescription } from '../../../models/column-description';

@Component({
  selector: 'wah-add-items',
  templateUrl: './add-items.component.html',
  styleUrls: ['./add-items.component.scss']
})
export class AddItemsComponent implements OnInit {
  progress = {
    list: [],
    ids: [],
    completed: [],
    failed: []
  };
  input: FormControl = new FormControl();
  columns = [
    {title: 'ID', key: 'id', dataType: 'string'},
    {title: 'Name', key: 'name', dataType: 'string'},
    {title: 'Is new', key: 'isNew', dataType: 'boolean'}
  ];

  constructor(private service: ItemService) { }

  ngOnInit() {
  }

  addItems(): void {
    Object.keys(this.progress).forEach(key => {
      this.progress[key] = [];
    });
    this.progress.ids = this.input.value.replace(/[ a-zA-z]/g, '').split(',');
    this.addItem(0);
  }

  async addItem(index: number) {
    const id = this.progress.ids[index];
    if (SharedService.items[id]) {
      this.progress.completed.push({ id: id, name: SharedService.items[id].name, isNew: false });
    } else {
      await this.service.addItem(id)
        .then((item) => {
          this.progress.completed.push({ id: id, name: item.name, isNew: true });
        })
        .catch(() => {
          this.progress.failed.push(id);
        });
    }
    index++;
    if (index < this.progress.ids.length) {
      this.addItem(index);
    }
  }

  getProgress(): number {
    return (this.progress.completed.length + this.progress.failed.length) / this.progress.ids.length;
  }
}
