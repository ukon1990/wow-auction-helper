import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {MatAutocomplete, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {FormArray, FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import {DashboardService} from '../../../services/dashboard.service';
import {TextUtil} from '@ukon1990/js-utilities';

@Component({
  selector: 'wah-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent {
  @Input() inputField: FormControl;
  tagInputControl = new FormControl('');
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredTags: Observable<string[]>;
  allTags: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  get tags():  string[] {
    return this.inputField.value as string[];
  }

  constructor(private service: DashboardService) {
    const tags: string[] = [];
    const tagMap = new Map<string, string>();
    service.list.value.forEach(board => {
      (board.tags || []).forEach(tag => {
        if (!tagMap.has(tag)) {
          tags.push(tag);
        }
      });
    });
    this.allTags = tags;

    this.filteredTags = this.tagInputControl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => tag ? this._filter(tag) : this.allTags.slice())
    );
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      const list = this.inputField.value || [];
      this.inputField.setValue([...list, value.trim()]);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.tagInputControl.setValue(null);
  }

  remove(fruit: string): void {
    const list = this.inputField.value || [];
    const index = list.indexOf(fruit);

    if (index >= 0) {
      this.inputField.setValue([...list.splice(index, 1)]);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const list = this.inputField.value || [];
    this.inputField.setValue([...list, event.option.viewValue]);
    this.tagInput.nativeElement.value = '';
    this.tagInputControl.setValue(null);
  }

  private _filter(value: string): string[] {
    return this.allTags.filter(tag => TextUtil.contains(tag, value));
  }
}
