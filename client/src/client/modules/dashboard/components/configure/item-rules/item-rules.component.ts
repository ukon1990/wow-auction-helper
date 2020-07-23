import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {ItemRule} from '../../../models/rule.model';
import {Item} from '../../../../../models/item/item';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ItemService} from '../../../../../services/item.service';
import {TextUtil} from '@ukon1990/js-utilities';
import {SharedService} from "../../../../../services/shared.service";

@Component({
    selector: 'wah-item-rules',
    templateUrl: './item-rules.component.html',
    styleUrls: ['./item-rules.component.scss']
})
export class ItemRulesComponent implements AfterViewInit {
    @Input() form: FormGroup;
    @Input() rules: ItemRule[];
    itemSearchForm: FormControl = new FormControl();
    filteredItems: Item[] = [];
    faTrash = faTrashAlt;
    sm = new SubscriptionManager();

    get formArray(): FormArray {
        return this.form.get('itemRules') as FormArray;
    }

    constructor() {
        this.sm.add(this.itemSearchForm.valueChanges, value => {
            if (SharedService.itemsUnmapped) {
                this.filteredItems = SharedService.itemsUnmapped.filter(item =>
                    TextUtil.contains(item.name, value)).slice(0, 25);
            }
        });
    }

    ngAfterViewInit(): void {
        if (this.rules) {
            this.rules.forEach(rule =>
                this.addItemRule(undefined, rule));
        }
    }

    formGroup(group: AbstractControl): FormGroup {
        return group as FormGroup;
    }

    addItemRule(formArray: FormArray = this.form.controls.itemRules as FormArray, itemRule?: ItemRule): void {
        const form = new FormGroup({
            itemId: new FormControl(itemRule ? itemRule.itemId : null, Validators.required),
            bonusIds: new FormControl(itemRule ? itemRule.bonusIds : null),
            petSpecies: new FormControl(itemRule ? itemRule.petSpeciesId : null),
            rules: new FormArray([]),
        });

        formArray.push(form);
    }

    setItem(item: Item, group: AbstractControl) {
        (group as FormGroup)
            .controls.itemId.setValue(item.id);
    }
}
