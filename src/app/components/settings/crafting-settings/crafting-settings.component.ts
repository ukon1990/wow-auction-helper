import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Item } from '../../../models/item/item';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'wah-crafting-settings',
  templateUrl: './crafting-settings.component.html',
  styleUrls: ['./crafting-settings.component.scss']
})
export class CraftingSettingsComponent implements OnInit {

  itemSearchForm: FormControl = new FormControl();
  filteredItems: Observable<any>;

  constructor(private _formBuilder: FormBuilder) {
    this.filteredItems = this.itemSearchForm.valueChanges
      .pipe(
        startWith(''),
        map(name => this.filter(name))
      );
  }

  ngOnInit() {
  }

  /**
   * Such efficient, such ugh
   * @param name Item name for the query
   */
  private filter(name: string): Array<Item> {
    return SharedService.itemsUnmapped.filter( i =>
      i.name.toLowerCase().indexOf(name.toLowerCase()) !== -1).slice(0, 20);
  }

  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }
}
