import {AfterViewInit, Component, Input, OnDestroy} from '@angular/core';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Item} from '@shared/models';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ItemService} from '../../../../../services/item.service';
import {TextUtil} from '@ukon1990/js-utilities';
import {SharedService} from '../../../../../services/shared.service';
import {ItemRule} from "@shared/models";

@Component({
  selector: 'wah-item-rules',
  templateUrl: './item-rules.component.html',
  styleUrls: ['./item-rules.component.scss']
})
export class ItemRulesComponent implements AfterViewInit, OnDestroy {
  @Input() form: UntypedFormGroup;
  @Input() rules: ItemRule[];
  itemSearchForm: UntypedFormControl = new UntypedFormControl();
  filteredItems: Item[] = [];
  items: Map<number, Item>;
  faTrash = faTrashAlt;
  sm = new SubscriptionManager();
  selectedItem: Item;
  selectedPanelIndex = 0;

  get formArray(): UntypedFormArray {
    return this.form.get('itemRules') as UntypedFormArray;
  }

  constructor() {
    this.sm.add(this.itemSearchForm.valueChanges, value => {
      if (SharedService.itemsUnmapped) {
        this.filteredItems = SharedService.itemsUnmapped.filter(item =>
          TextUtil.contains(item.name, value)).slice(0, 25);
      }
    });

    this.sm.add(ItemService.mapped, (map) => this.items = map);
  }

  ngAfterViewInit(): void {
    if (this.rules) {
      this.formArray.clear();
      this.rules.forEach(rule =>
        this.addItemRule(undefined, rule, true));
    }
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  formGroup(group: AbstractControl): UntypedFormGroup {
    return group as UntypedFormGroup;
  }

  addItemRule(formArray: UntypedFormArray = this.form.controls.itemRules as UntypedFormArray,
              itemRule?: ItemRule, doNotSetSelectedIndex?: boolean): void {
    const form = new UntypedFormGroup({
      itemId: new UntypedFormControl(itemRule ? itemRule.itemId : this.selectedItem.id, Validators.required),
      bonusIds: new UntypedFormControl(itemRule ? itemRule.bonusIds : null),
      petSpecies: new UntypedFormControl(itemRule ? itemRule.petSpeciesId : null),
      rules: new UntypedFormArray([]),
    });

    formArray.push(form);
    this.selectedItem = undefined;
    if (!doNotSetSelectedIndex) {
      this.onPanelOpen(this.formArray.length - 1);
    }
  }

  setItem(item: Item) {
    this.selectedItem = item;
  }

  onPanelOpen(index: number) {
    this.selectedPanelIndex = index;
  }
}